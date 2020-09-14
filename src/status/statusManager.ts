import { StatusBarItem } from 'vscode';
import { getStatusBarItem } from '../extension';

export function updateStatusBar(msg: string) {
    let statusBarItem: StatusBarItem | null = getStatusBarItem();
    if (statusBarItem === null) {
      return;
    }
  
    if (typeof msg === 'string') {
      statusBarItem.text = msg;
    }
  }