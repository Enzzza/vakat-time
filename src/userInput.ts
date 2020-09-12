import {
  QuickPickItem,
  window,
  Disposable,
  CancellationToken,
  QuickInputButton,
  QuickInput,
  ExtensionContext,
  QuickInputButtons,
} from 'vscode';
import data from './data/vaktija.json';
const reminderTimerList: number[] = [5, 10, 15];

export async function userInputSettings(context: ExtensionContext) {
  const locations: QuickPickItem[] = [...data['locations']].map((label) => ({
    label,
  }));

  interface State {
    title: string;
    step: number;
    totalSteps: number;
    location: QuickPickItem;
    reminder: QuickPickItem;
  }

  async function collectUserInputs() {
    const state = {} as Partial<State>;
    await UserInputSettings.run((input) => pickLocation(input, state));
    return state as State;
  }

  const title = 'Postavke vaktije';

  async function pickLocation(input: UserInputSettings, state: Partial<State>) {
    state.location = await input.showQuickPick({
      title,
      step: 1,
      totalSteps: 2,
      placeholder: 'Odaberite vaš grad',
      items: locations,
      activeItem:
        typeof state.location !== 'string' ? state.location : undefined,
    });

    return (input: UserInputSettings) => pickReminder(input, state);
  }

  async function pickReminder(input: UserInputSettings, state: Partial<State>) {
    const additionalSteps = typeof state.location === 'string' ? 1 : 0;
    const reminders = getReminderList();

    state.reminder = await input.showQuickPick({
      title,
      step: 2 + additionalSteps,
      totalSteps: 2 + additionalSteps,
      placeholder: 'Da li želite da dobivate obavijest prije nastupa namaza?',
      items: reminders,
      activeItem: state.reminder,
    });
  }
  function getReminderList() {
    const reminderList = reminderTimerList.map(
      (number) => `${number} minuta prije namaza`
    );
    return ['Ne!', ...reminderList].map((label) => ({ label }));
  }
  function saveSettings(location: string, reminder: string) {
    const isNumber: string[] | null = reminder.match(/\d+/);
    let reminderIn: number;
    isNumber ? (reminderIn = parseInt(isNumber[0])) : (reminderIn = 0);

    const saveObject: { location: string; reminderIn: number } = {
      location,
      reminderIn,
    };
    context.globalState.update('userSettings', saveObject);
    // const obj = context.globalState.get('userSettings');
    // console.log(obj);
    window.showInformationMessage('Postavke spašene!');
  }

  try {
    const state = await collectUserInputs();
    saveSettings(state.location.label, state.reminder.label);
  } catch (error) {
    console.error('User probably pressed ESC!', error);
    window.showErrorMessage('Postavke nisu spašene!');
  }
}

// -------------------------------------------------------
// Helper code that wraps the API for the multi-step case.
// -------------------------------------------------------

class InputFlowAction {
  static back = new InputFlowAction();
  static cancel = new InputFlowAction();
  static resume = new InputFlowAction();
}

type InputStep = (input: UserInputSettings) => Thenable<InputStep | void>;

interface QuickPickParameters<T extends QuickPickItem> {
  title: string;
  step: number;
  totalSteps: number;
  items: T[];
  activeItem?: T;
  placeholder: string;
  buttons?: QuickInputButton[];
  shouldResume?: () => Thenable<boolean>;
}

class UserInputSettings {
  static async run<T>(start: InputStep) {
    const input = new UserInputSettings();
    return input.stepThrough(start);
  }

  private current?: QuickInput;
  private steps: InputStep[] = [];

  private async stepThrough<T>(start: InputStep) {
    let step: InputStep | void = start;
    while (step) {
      this.steps.push(step);
      if (this.current) {
        this.current.enabled = false;
        this.current.busy = true;
      }
      try {
        step = await step(this);
      } catch (err) {
        if (err === InputFlowAction.back) {
          this.steps.pop();
          step = this.steps.pop();
        } else if (err === InputFlowAction.resume) {
          step = this.steps.pop();
        } else if (err === InputFlowAction.cancel) {
          step = undefined;
        } else {
          throw err;
        }
      }
    }
    if (this.current) {
      this.current.dispose();
    }
  }

  async showQuickPick<
    T extends QuickPickItem,
    P extends QuickPickParameters<T>
  >({
    title,
    step,
    totalSteps,
    items,
    activeItem,
    placeholder,
    buttons,
    shouldResume,
  }: P) {
    const disposables: Disposable[] = [];
    try {
      return await new Promise<
        T | (P extends { buttons: (infer I)[] } ? I : never)
      >((resolve, reject) => {
        const input = window.createQuickPick<T>();
        input.title = title;
        input.step = step;
        input.totalSteps = totalSteps;
        input.placeholder = placeholder;
        input.items = items;
        if (activeItem) {
          input.activeItems = [activeItem];
        }
        input.buttons = [
          ...(this.steps.length > 1 ? [QuickInputButtons.Back] : []),
          ...(buttons || []),
        ];
        disposables.push(
          input.onDidTriggerButton((item) => {
            if (item === QuickInputButtons.Back) {
              reject(InputFlowAction.back);
            } else {
              resolve(<any>item);
            }
          }),
          input.onDidChangeSelection((items) => resolve(items[0])),
          input.onDidHide(() => {
            (async () => {
              reject(
                shouldResume && (await shouldResume())
                  ? InputFlowAction.resume
                  : InputFlowAction.cancel
              );
            })().catch(reject);
          })
        );
        if (this.current) {
          this.current.dispose();
        }
        this.current = input;
        this.current.show();
      });
    } finally {
      disposables.forEach((d) => d.dispose());
    }
  }
}
