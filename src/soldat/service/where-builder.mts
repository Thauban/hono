/**
 * Das Modul enthaelt den Builder fuer Prisma-Where-Filter bei Soldaten.
 * @packageDocumentation
 */

import { Prisma } from '../../generated/prisma/client.ts';
import {
  type geschlecht,
  type rang,
  type schweregrad,
  type waffe,
} from '../../generated/prisma/enums.ts';
import { getLogger } from '../../logger/logger.mts';
import { type Suchparameter } from './suchparameter.mts';

const logger = getLogger('buildWhere', 'func');

const containsInsensitive = (value: string) => ({
  contains: value,
  mode: Prisma.QueryMode.insensitive,
});

/**
 * WHERE-Klausel fuer die flexible Suche nach Soldaten bauen.
 */
export const buildWhere = ({
  vorname,
  nachname,
  username,
  geschlecht,
  rang,
  waffe,
  seriennummer,
  verletzungsbezeichnung,
  schweregrad,
  behandelt,
}: Suchparameter): Prisma.SoldatWhereInput => {
  logger.debug(
    'buildWhere: vorname=%s, nachname=%s, username=%s, rang=%s',
    vorname,
    nachname,
    username,
    rang,
  );

  const where: Prisma.SoldatWhereInput = {};

  if (vorname !== undefined) {
    where.vorname = containsInsensitive(vorname);
  }

  if (nachname !== undefined) {
    where.nachname = containsInsensitive(nachname);
  }

  if (username !== undefined) {
    where.username = containsInsensitive(username);
  }

  if (geschlecht !== undefined) {
    where.geschlecht = { equals: geschlecht as geschlecht };
  }

  if (rang !== undefined) {
    where.rang = { equals: rang as rang };
  }

  if (waffe !== undefined || seriennummer !== undefined) {
    where.ausruestung = {
      is: {
        ...(waffe === undefined ? {} : { waffe: { equals: waffe as waffe } }),
        ...(seriennummer === undefined ? {} : { seriennummer: containsInsensitive(seriennummer) }),
      },
    };
  }

  if (
    verletzungsbezeichnung !== undefined ||
    schweregrad !== undefined ||
    behandelt !== undefined
  ) {
    where.verletzungen = {
      some: {
        ...(verletzungsbezeichnung === undefined
          ? {}
          : {
              verletzungsbezeichnung: containsInsensitive(verletzungsbezeichnung),
            }),
        ...(schweregrad === undefined
          ? {}
          : {
              schweregrad: {
                equals: schweregrad as schweregrad,
              },
            }),
        ...(behandelt === undefined
          ? {}
          : {
              behandelt: {
                equals: behandelt.toLowerCase() === 'true',
              },
            }),
      },
    };
  }

  logger.debug('buildWhere: where=%o', where);
  return where;
};
