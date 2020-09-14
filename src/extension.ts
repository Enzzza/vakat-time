import {
  commands,
  ExtensionContext,
  window,
  StatusBarAlignment,
  StatusBarItem,
} from 'vscode';
import { userInputSettings } from './userInput';
import { vaktijaManager } from './vaktija-api/vaktijaManager';
import { setInterval } from 'timers';



let statusBarItem : StatusBarItem | null = null;

export function getStatusBarItem() {
  return statusBarItem;
}

export async function activate(context: ExtensionContext) {
  context.subscriptions.push(
    commands.registerCommand('vaktija.userSettings', async () => {
      await userInputSettings(context);
    })
  );
  await createStatusBar(context);
  
  // let n = 20;
  // setInterval(() =>{
  //   n-=1;
  //   updateStatusBar(n);
  // },1000*60);
 
}


async function createStatusBar(context:ExtensionContext) {
  setTimeout(() => {
    statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 10);

    let tooltip = 'Klikni da otvoriš postavke';

    statusBarItem.tooltip = tooltip;
    statusBarItem.command = 'vaktija.userSettings';
    statusBarItem.show();
    vaktijaManager(context);
  }, 0);
}