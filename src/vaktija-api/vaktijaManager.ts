import { ExtensionContext, StatusBarItem } from 'vscode';
import moment from 'moment';
import { Vaktija } from './vaktija';
import { getStatusBarItem } from '../extension';

interface VakatProps {
  nextVakatPosition: number;
  vakatTime: string;
  vakatMoment: moment.Duration;
  humanizedVakat: string;
  vakatName: string;
}

export function vaktijaManager(context: ExtensionContext): void {
  let vaktija = new Vaktija(context);
  let vakatProps: VakatProps | undefined = getVakatProps(vaktija);
  if (vakatProps) {
    let { vakatName, humanizedVakat } = vakatProps;
    let msg = `$(heart) ${vakatName} ${humanizedVakat} `;
    updateStatusBar(msg);
  }
}

function getVakatProps(vaktija: Vaktija): VakatProps | undefined {
  let nextVakatPosition: number;
  let vakatTime: string;
  let vakatMoment: moment.Duration;
  let humanizedVakat: string;
  let vakatName: string;

  if (vaktija.dailyVakats && vaktija.nextVakatPosition) {
    nextVakatPosition = vaktija.nextVakatPosition;
    vakatTime = vaktija.dailyVakats.vakat[nextVakatPosition];
    vakatMoment = Vaktija.getVakatMoment(vakatTime);
    humanizedVakat = Vaktija.humanizeVakat(vakatMoment);
    vakatName = Vaktija.getVakatName(nextVakatPosition);
    return {
      nextVakatPosition,
      vakatTime,
      vakatMoment,
      humanizedVakat,
      vakatName,
    };
  }
  return;
}

function updateStatusBar(msg: string) {
  let statusBarItem: StatusBarItem | null = getStatusBarItem();
  if (statusBarItem === null) {
    return;
  }

  if (typeof msg === 'string') {
    statusBarItem.text = msg;
  }
}
