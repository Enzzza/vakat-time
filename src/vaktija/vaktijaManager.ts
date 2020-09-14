import { ExtensionContext } from 'vscode';
import moment from 'moment';
import { Vaktija } from './vaktija';
import { updateStatusBar } from '../status/statusManager';
import {subject} from '../userInput';

interface VakatProps {
  nextVakatPosition: number;
  vakatTime: string;
  vakatMoment: moment.Duration;
  humanizedVakat: string;
  vakatName: string;
  location: string;
}
let vaktija;
export function vaktijaManager(context: ExtensionContext): void {
  subject.subscribe((msg) =>{
    console.log(msg)
    startVaktija(context);
  });
  startVaktija(context);
 
}


function startVaktija(context: ExtensionContext){
  vaktija = getVaktija(context);
  let vakatProps: VakatProps | undefined = getVakatProps(vaktija);
  if (vakatProps) {
    let { vakatName, humanizedVakat, location } = vakatProps;
    let msg = `$(heart) ${location}: ${vakatName} ${humanizedVakat} `;
    updateStatusBar(msg);
  }
}
function restartVaktija(context: ExtensionContext){
  startVaktija(context);
}
function getVaktija(context: ExtensionContext): Vaktija {
  return new Vaktija(context);
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
