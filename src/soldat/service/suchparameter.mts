import {
  type geschlecht,
  type rang,
  type schweregrad,
  type waffe,
} from '../../generated/prisma/enums.ts';

// Typdefinition für `find`
export type Suchparameter = {
  readonly vorname?: string;
  readonly nachname?: string;
  readonly username?: string;
  readonly geschlecht?: geschlecht;
  readonly rang?: rang;
  readonly waffe?: waffe;
  readonly seriennummer?: string;
  readonly verletzungsbezeichnung?: string;
  readonly schweregrad?: schweregrad;
  readonly behandelt?: string;
};

// gueltige Namen fuer die Suchparameter
export const suchparameterNamen = [
  'vorname',
  'nachname',
  'username',
  'geschlecht',
  'rang',
  'waffe',
  'seriennummer',
  'verletzungsbezeichnung',
  'schweregrad',
  'behandelt',
];
