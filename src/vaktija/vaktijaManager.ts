import { ExtensionContext } from 'vscode';
import moment from 'moment';
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
let intervalID:any;
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
      } = vakatProps;
      let msg: string;
      if (nextVakatPosition === 6) {
        // ako je za danasnji dan pozicija 6
        // u vaktiji napravit

        let zora = vaktija.dailyVakats?.vakat[0];
        let zoraMoment = Vaktija.getVakatMoment(zora);
        zoraMoment.add(24, 'hours');
        let zoraHuman = Vaktija.humanizeVakat(zoraMoment);
        msg = `$(heart) ${location}: Zora ${zoraHuman} `;
      } else {
        msg = `$(heart) ${location}: ${vakatName} ${humanizedVakat} `;
      }

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
