import { ExtensionContext, window } from 'vscode';
import moment, { min } from 'moment';
import { Vaktija } from './vaktija';
import { updateStatusBar } from '../status/statusManager';
import { subject } from '../userInput';

interface VakatProps {
  nextVakatPosition: number;
  vakatTime: string;
  vakatMoment: moment.Duration;
  humanizedVakat: string;
  vakatName: string;
  location: string;
}
let vaktija: Vaktija;
let globalContext: ExtensionContext;
let intervalID: any;
export function vaktijaManager(context: ExtensionContext): void {
  globalContext = context;
  vaktija = getVaktija();

  startVaktija();
  subject.subscribe((msg) => {
    restartVaktija();
  });
}

function startVaktija() {
  intervalID = setInterval(() => {
    let vakatProps: VakatProps | undefined = getVakatProps(vaktija);
    if (vakatProps) {
      let {
        vakatName,
        humanizedVakat,
        location,
        nextVakatPosition,
        vakatMoment,
      } = vakatProps;
      let msg: string;
      if (nextVakatPosition === 6) {
        let zoraHuman = vaktija.nextZora;
        vakatName = 'Zora';
        msg = `$(heart) ${location}: ${vakatName} ${zoraHuman} `;
      } else {
        msg = `$(heart) ${location}: ${vakatName} ${humanizedVakat} `;
      }
      showNotification(vakatMoment, vakatName);
      updateStatusBar(msg);
    }
  }, 1000);
}
function restartVaktija(): void {
  vaktija.reset();
  clearInterval(intervalID);
  startVaktija();
}
function getVaktija(): Vaktija {
  return new Vaktija(globalContext);
}
function getVakatProps(vaktija: Vaktija): VakatProps | undefined {
  let nextVakatPosition: number;
  let vakatTime: string;
  let vakatMoment: moment.Duration;
  let humanizedVakat: string;
  let vakatName: string;
  let location: string;

  if (vaktija.dailyVakats && vaktija.nextVakatPosition) {
    nextVakatPosition = vaktija.nextVakatPosition;
    vakatTime = vaktija.dailyVakats.vakat[nextVakatPosition];
    vakatMoment = Vaktija.getVakatMoment(vakatTime);
    humanizedVakat = Vaktija.humanizeVakat(vakatMoment);
    vakatName = Vaktija.getVakatName(nextVakatPosition);
    location = vaktija.location;
    return {
      nextVakatPosition,
      vakatTime,
      vakatMoment,
      humanizedVakat,
      vakatName,
      location,
    };
  }
  return;
}

function showNotification(vakatMoment: moment.Duration, vakatName: string) {
  let secondsLeft: number = Math.floor(parseInt(vakatMoment.asSeconds().toString()));
  const userSettings: any = globalContext.globalState.get('userSettings');
  let userSeconds: number = 0;
  

  let ajet = `„O vjernici, tražite pomoć sa strpljenjem i obavljanjem na­maza! Allah je doista sa strpljivima.“ (El-­Bekare, 153.)`;
  
  console.log(Math.floor(parseInt(vakatMoment.asSeconds().toString())));
 
  if (userSettings) {
    userSeconds = userSettings['reminderIn'];
    userSeconds *= 60;
  }

  if (userSeconds) {
    if (secondsLeft === userSeconds) {
      window.showInformationMessage(
        `${vakatName} je za ${userSeconds} minuta. ${ajet} \❤️ `
      );
    }
  }
}
