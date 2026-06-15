export const REGEXP = {
  number: /[0-9]/,
  latins: /^[a-zA-Z]+$/,
  cyrillic: /^[а-яА-ЯёЁ]+$/,
  letters: /(?=.*[a-z])(?=.*[A-Z])/,
  specSymbols: /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~ ]/,
  lineBreaks: /\n\r?/g,

  url: /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z0-9]{2,}(\/[^\s]*)?$/,

  numbersOrDot: /^[0-9.]+$/,
  latinsOrNumbers: /^[a-zA-Z0-9]+$/,
  latinsOrSpecSymbols: /^[a-zA-Z!@#$%^&*()_ +\-=:;?.,<>{}|[\]~`\\/']+$/,
  latinsOrCyrillicOrSpecSymbols:
    /^[a-zA-Zа-яА-Я!@#$%^&*()_ +\-=:;?.,<>{}|[\]~`\\/']+$/,
  latinsOrNumbersOrSpecSymbols:
    /^[a-zA-Z0-9!"@#$%^&*()_ +\-=:;?.,<>{}|[\]~`\\/']+$/,
  latinsOrNumbersOrHyphen: /^[a-zA-Z0-9!"\-`\\/']+$/,

  latinsOrNumbersOrColon: /^[a-zA-Z0-9:]+$/,
  latinsOrDotOrColonOrNumbers: /^[a-zA-Z0-9:.[\]~`\\/']+$/,

  numbersOrSpecSymbols: /^[0-9!"@#$%^&*()_ +\-=:;?.,<>{}|[\]~`\\/']+$/,
};
