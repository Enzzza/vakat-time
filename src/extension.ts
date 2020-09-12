/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { window, commands, ExtensionContext } from 'vscode';

import { userInputSettings } from './userInput';

export function activate(context: ExtensionContext) {
  
	
  context.subscriptions.push(
    commands.registerCommand('vaktija.helloWorld', async () => {
      const options: {
        [key: string]: (context: ExtensionContext) => Promise<void>;
      } = {
        userInputSettings,
      };
      const quickPick = window.createQuickPick();
      quickPick.items = Object.keys(options).map((label) => ({ label }));
      quickPick.onDidChangeSelection((selection) => {
        if (selection[0]) {
          options[selection[0].label](context).catch(console.error);
        }
      });
      quickPick.onDidHide(() => quickPick.dispose());
      quickPick.show();
    })
  );
}
