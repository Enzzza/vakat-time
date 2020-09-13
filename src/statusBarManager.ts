
import { ExtensionContext } from 'vscode';
import { getStatusBarItem } from './extension';
import { getVaktijaMsg } from './vaktijaManager';


export function updateStatusBar(context:ExtensionContext) {
  if (!getStatusBarItem()) {
    return;
  }
  let msg = getVaktijaMsg(context);
  getStatusBarItem().text = msg;
}
