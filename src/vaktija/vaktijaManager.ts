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
let globalContext:ExtensionContext;
export function vaktijaManager(context: ExtensionContext): void {
  globalContext = context;
  subject.subscribe((msg) =>{
    console.log(msg);
    startVaktija();
  });
  startVaktija();
 
}


function startVaktija(){
  vaktija = getVaktija();
  let vakatProps: VakatProps | undefined = getVakatProps(vaktija);
  if (vakatProps) {
    let { vakatName, humanizedVakat, location ,nextVakatPosition} = vakatProps;
    let msg:string;
    if(nextVakatPosition === 6){
      // ako je za danasnji dan pozicija 6
      msg = `$(heart) ${location}: TODO do zore je! `;
    }else{
      msg = `$(heart) ${location}: ${vakatName} ${humanizedVakat} `;
    }
    
    updateStatusBar(msg);
  }
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
