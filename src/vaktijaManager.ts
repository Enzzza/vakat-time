import { ExtensionContext } from 'vscode';
import { differences, vaktija } from './data/vaktija.json';
import moment from 'moment';
import 'moment-duration-format';
import 'moment-timezone';
import 'moment/locale/bs';
moment.locale('bs');

const toOrdinalSuffixMinutes = num => {
  const int = parseInt(num, 10),
    digits = [int % 10, int % 100],
    ordinals = [" minutu", " minute", " minute", " minute", " minuta"],
    // ordinals = [" min", " min", " min", " min", " min"],
    oPattern = [1, 2, 3, 4],
    tPattern = [11, 12, 13, 14, 15, 16, 17, 18, 19];
  return oPattern.includes(digits[0]) && !tPattern.includes(digits[1])
    ? ordinals[digits[0] - 1]
    : ordinals[4];
};

const toOrdinalSuffixHours = num => {
  const int = parseInt(num, 10),
    digits = [int % 10, int % 100],
    ordinals = [" sat", " sata", " sata", " sata", " sati"],
    oPattern = [1, 2, 3, 4],
    tPattern = [11, 12, 13, 14, 15, 16, 17, 18, 19];
  return oPattern.includes(digits[0]) && !tPattern.includes(digits[1])
    ? ordinals[digits[0] - 1]
    : ordinals[4];
};

const translate = (number, withoutSuffix, key) => {
  var result = number + " ";
  // eslint-disable-next-line default-case
  switch (key) {
    case "ss":
      if (number === 1) {
        result += "sekunda";
      } else if (number === 2 || number === 3 || number === 4) {
        result += "sekunde";
      } else {
        result += "sekundi";
      }
      return result;
    case "m":
      return withoutSuffix ? "jedna minuta" : "jednu minutu";
    // result += toOrdinalSuffixMinutes(number);
    // return result;
    case "mm":
      result += toOrdinalSuffixMinutes(number);
      return result;
    case "h":
      return withoutSuffix ? "jedan sat" : "jedan sat";
    // result += toOrdinalSuffixHours(number);
    // return result;
    case "hh":
      result += toOrdinalSuffixHours(number);
      return result;
    case "dd":
      if (number === 1) {
        result += "dan";
      } else {
        result += "dana";
      }
      return result;
    case "MM":
      if (number === 1) {
        result += "mjesec";
      } else if (number === 2 || number === 3 || number === 4) {
        result += "mjeseca";
      } else {
        result += "mjeseci";
      }
      return result;
    case "yy":
      if (number === 1) {
        result += "godina";
      } else if (number === 2 || number === 3 || number === 4) {
        result += "godine";
      } else {
        result += "godina";
      }
      return result;
  }
};

moment.updateLocale("bs", {
  iMonths: [
    "Muharrem",
    "Safer",
    "Rebi'u-l-evvel",
    "Rebi'u-l-ahir",
    "Džumade-l-ula",
    "Džumade-l-uhra",
    "Redžeb",
    "Ša'ban",
    "Ramazan",
    "Ševval",
    "Zu-l-ka'de",
    "Zu-l-hidždže"
  ],
  weekdaysShort: ["ned", "pon", "uto", "sri", "čet", "pet", "sub"],
  relativeTime: {
    future: "za %s",
    past: "prije %s",
    s: "par sekundi",
    ss: translate,
    m: translate,
    mm: translate,
    h: translate,
    hh: translate,
    d: "dan",
    dd: translate,
    M: "mjesec",
    MM: translate,
    y: "godinu",
    yy: translate
  }
});





type Vakat = {
  vakat: string[];
};

let locationID: number;
let dailyVakats: Vakat;
let nextVakatPosition: number;

export function getVaktijaMsg(context: ExtensionContext) {
  const userSettings: any = context.globalState.get('userSettings');

  if (userSettings) {
    locationID = userSettings['locationID'];
  } else {
    locationID = 77;
  }

  dailyVakats = <Vakat>daily({});
  nextVakatPosition = nextVakat(dailyVakats);

  if (nextVakatPosition === 6) {
    let newDay = new Date();
    newDay.setDate(newDay.getDate() + 1);
    console.log('Usao u slucaj kad je prosla jacija!');
    console.log(newDay);
    // dailyVakats = <Vakat>daily({ day: newDay.getDate() });
    // nextVakatPosition = nextVakat(dailyVakats);
  }

  return `$(heart) jacija ${timeToNext(dailyVakats.vakat[nextVakatPosition])} `;
}

const daily = ({
  location = locationID,
  year = new Date().getFullYear(),
  month = new Date().getMonth() + 1,
  day = new Date().getDate(),
}: {
  location?: number;
  year?: number;
  month?: number;
  day?: number;
}) => {
  if (moment([year, month - 1, day]).isValid()) {
    return {
      vakat: vaktija.months[month - 1].days[day - 1].vakat.map((v, i) =>
        moment([year, month - 1, day])
          .add(3, 'h')
          .tz('Europe/Sarajevo')
          .isDST()
          ? moment
              .duration(
                v + differences[location].months[month - 1].vakat[i] + 3600,
                's'
              )
              .format('HH:mm')
          : moment
              .duration(
                v + differences[location].months[month - 1].vakat[i],
                's'
              )
              .format('HH:mm')
      ),
    };
  }
};

const nextVakat = (dailyVakats: Vakat) => {
  const vakatPosition = dailyVakats.vakat.map((v, i) => ({
    pos: i,
    active: moment()
      .tz('Europe/Sarajevo')
      .isSameOrBefore(moment(v, 'HH:mm').tz('Europe/Sarajevo')),
  }));

  if (vakatPosition.filter((n) => n.active === true).length) {
    return vakatPosition.filter((n) => n.active === true)[0].pos;
  } else {
    return 6;
  }
};

const timeToNext = (vakatTime: string) => {
  const vakatMoment = moment(vakatTime, 'HH:mm').tz('Europe/Sarajevo');

  const duration = moment
    .duration(vakatMoment.diff(moment().tz('Europe/Sarajevo')))
    .humanize(true);
  //console.log(vakatMoment.diff(moment().tz('Europe/Sarajevo')));
  //console.log("Vrijeme do iduceg namaza: ",duration.format("*HH:mm:ss"));

  return duration;
};
