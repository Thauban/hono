/**
 * Das Modul besteht aus der Klasse {@linkcode SoldatWriteService} fuer die
 * Schreiboperationen im Anwendungskern.
 * @packageDocumentation
 */

import { prismaClient } from '../../config/prisma-client.mts';
import { type Prisma } from '../../generated/prisma/client.ts';
import { getLogger } from '../../logger/logger.mts';
import {
  NotFoundError,
  VersionInvalidError,
  SeriennummerExistsError,
  VersionOutdatedError,
} from './errors.mts';
import { SoldatService } from './soldat-service.mts';


export type SoldatCreate = Prisma.SoldatCreateInput;
export type SoldatUpdate = Prisma.SoldatUpdateInput;
type SoldatCreated = Prisma.SoldatGetPayload<{
  include: {
    ausruestung: true;
    verletzungen: true;
  };
}>;

export type UpdateParams = {
  readonly id: number | undefined;
  readonly soldat: SoldatUpdate;
  readonly version: string;
};

type SoldatUpdated = Prisma.SoldatGetPayload<{}>;

/**
 * Die Klasse `SoldatWriteService` implementiert den Anwendungskern fuer das
 * Schreiben von Soldaten und greift mit _Prisma_ auf die DB zu.
 */
export class SoldatWriteService {
  private static readonly VERSION_PATTERN = /^"\d{1,3}"/u;

  readonly #readService: SoldatService;

  readonly #logger = getLogger(SoldatWriteService.name);

  constructor(readService: SoldatService) {
    this.#readService = readService;
  }

  async create(soldat: SoldatCreate) {
    this.#logger.debug('create: soldat=%o', soldat);

    let soldatDb: SoldatCreated | undefined;

try {
    await prismaClient.$transaction(async (tx) => {
        soldatDb = await tx.soldat.create({
            data: soldat,
            include: {
                ausruestung: true,
                verletzungen: true,
            },
        });
    });
} catch (error) {
    if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
) {
        const seriennummer =
            soldat.ausruestung?.create?.seriennummer as string | undefined;

        throw new SeriennummerExistsError(seriennummer);
    }

    throw error;
}

    this.#logger.debug('create: soldatDb.id=%s', soldatDb?.id);
    return soldatDb?.id ?? Number.NaN;
  }

  async update({ id, soldat, version }: UpdateParams) {
    this.#logger.debug(
      'update: id=%s, soldat=%o, version=%s',
      id,
      soldat,
      version,
    );

    if (id === undefined) {
      this.#logger.debug('update: Keine gueltige ID');
      throw new NotFoundError(`Es gibt keinen Soldaten mit der ID ${id}.`);
    }

    await this.#validateUpdate(id, version);

    soldat.version = { increment: 1 };

    let soldatUpdated: SoldatUpdated | undefined;
    await prismaClient.$transaction(async (tx) => {
      soldatUpdated = await tx.soldat.update({
        data: soldat,
        where: { id },
      });
    });

    this.#logger.debug(
      'update: soldatUpdated=%s',
      JSON.stringify(soldatUpdated),
    );

    return soldatUpdated?.version ?? Number.NaN;
  }

  async #validateUpdate(id: number, versionStr: string) {
    this.#logger.debug('#validateUpdate: id=%d, versionStr=%s', id, versionStr);

    if (!SoldatWriteService.VERSION_PATTERN.test(versionStr)) {
      throw new VersionInvalidError(versionStr);
    }

    const version = Number.parseInt(versionStr.slice(1, -1), 10);
    const soldatDb = await this.#readService.findById({ id });

    if (version < soldatDb.version) {
      this.#logger.debug('#validateUpdate: versionDb=%d', soldatDb.version);
      throw new VersionOutdatedError(version);
    }
  }

  async delete(id: number) {
    this.#logger.debug('delete: id=%d', id);

    const soldat = await prismaClient.soldat.findUnique({
      where: { id },
    });

    if (soldat === null) {
      this.#logger.debug('delete: not found');
      return false;
    }

    await prismaClient.$transaction(async (tx) => {
      await tx.soldat.delete({ where: { id } });
    });

    this.#logger.debug('delete');
    return true;
  }
}
