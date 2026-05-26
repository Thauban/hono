/**
 * Das Modul besteht aus der Klasse {@linkcode SoldatService}.
 * @packageDocumentation
 */

import { prismaClient } from "../../config/prisma-client.mts";
import { type Prisma } from "../../generated/prisma/client.ts";
import { getLogger } from "../../logger/logger.mts";
import { NotFoundError } from "./errors.mts";
import { type Pageable } from "./pageable.mts";
import { type Slice } from "./slice.mts";
import { type Suchparameter, suchparameterNamen } from "./suchparameter.mts";
import { buildWhere } from "./where-builder.mts";

// Typdefinition fuer `findById`
type FindByIdParams = {
  readonly id: number;
  readonly mitBeziehungen?: boolean;
};

export type SoldatMitAusruestungUndVerletzungen = Prisma.SoldatGetPayload<{
  include: {
    ausruestung: true;
    verletzungen: true;
  };
}>;

/**
 * Die Klasse `SoldatService` implementiert das Lesen fuer Soldaten und greift
 * mit _Prisma_ auf eine relationale DB zu.
 */
export class SoldatService {
  static readonly ID_PATTERN = /^[1-9]\d{0,10}$/u;

  readonly #includeBeziehungen: Prisma.SoldatInclude = {
    ausruestung: true,
    verletzungen: true,
  };

  readonly #logger = getLogger(SoldatService.name);

  /**
   * Einen Soldaten asynchron anhand seiner ID suchen.
   * @param id ID des gesuchten Soldaten.
   * @returns Der gefundene Soldat in einem Promise aus ES2015.
   * @throws NotFoundError falls kein Soldat mit der ID existiert.
   */
  async findById({
    id,
    mitBeziehungen = true,
  }: FindByIdParams): Promise<Readonly<SoldatMitAusruestungUndVerletzungen>> {
    this.#logger.debug("findById: id=%d", id);

    const soldat = await prismaClient.soldat.findUnique({
      where: { id },
      include: mitBeziehungen ? this.#includeBeziehungen : undefined,
    });

    if (soldat === null) {
      this.#logger.debug("Es gibt keinen Soldaten mit der ID %d", id);
      throw new NotFoundError(`Es gibt keinen Soldaten mit der ID ${id}.`);
    }

    this.#logger.debug("findById: soldat=%o", soldat);
    return soldat as SoldatMitAusruestungUndVerletzungen;
  }

  async find(
    suchparameter: Suchparameter | undefined,
    pageable: Pageable,
  ): Promise<Readonly<Slice<Readonly<SoldatMitAusruestungUndVerletzungen>>>> {
    this.#logger.debug(
      "find: suchparameter=%s, pageable=%o",
      JSON.stringify(suchparameter),
      pageable,
    );

    if (
      suchparameter === undefined ||
      Object.keys(suchparameter).length === 0
    ) {
      return await this.#findAll(pageable);
    }

    const keys = Object.keys(suchparameter);
    if (!this.#checkKeys(keys)) {
      this.#logger.debug("Ungueltige Suchparameter: %o", keys);
      throw new NotFoundError("Ungueltige Suchparameter");
    }

    const where = buildWhere(suchparameter);
    const { number, size } = pageable;

    const soldaten = await prismaClient.soldat.findMany({
      where,
      skip: number * size,
      take: size,
      include: this.#includeBeziehungen,
      orderBy: { id: "asc" },
    });

    if (soldaten.length === 0) {
      this.#logger.debug("find: Keine Soldaten gefunden");
      throw new NotFoundError(
        `Keine Soldaten gefunden: ${JSON.stringify(suchparameter)}, Seite ${pageable.number}`,
      );
    }

    const totalElements = await this.count(where);
    return this.#createSlice(soldaten, totalElements);
  }

  async count(where?: Prisma.SoldatWhereInput) {
    this.#logger.debug("count: where=%o", where ?? "undefined");

    const { count } = prismaClient.soldat;
    const anzahl = where === undefined ? await count() : await count({ where });

    this.#logger.debug("count: %d", anzahl);
    return anzahl;
  }

  async #findAll(
    pageable: Pageable,
  ): Promise<Readonly<Slice<SoldatMitAusruestungUndVerletzungen>>> {
    const { number, size } = pageable;

    const soldaten = await prismaClient.soldat.findMany({
      skip: number * size,
      take: size,
      include: this.#includeBeziehungen,
      orderBy: { id: "asc" },
    });

    if (soldaten.length === 0) {
      this.#logger.debug("#findAll: Keine Soldaten gefunden");
      throw new NotFoundError(`Ungueltige Seite "${number}"`);
    }

    const totalElements = await this.count();
    return this.#createSlice(soldaten, totalElements);
  }

  #createSlice(
    soldaten: SoldatMitAusruestungUndVerletzungen[],
    totalElements: number,
  ): Readonly<Slice<SoldatMitAusruestungUndVerletzungen>> {
    const soldatSlice: Slice<SoldatMitAusruestungUndVerletzungen> = {
      content: soldaten,
      totalElements,
    };

    this.#logger.debug("createSlice: soldatSlice=%o", soldatSlice);
    return soldatSlice;
  }

  #checkKeys(keys: string[]) {
    this.#logger.debug("#checkKeys: keys=%o", keys);
    return keys.every((key) => suchparameterNamen.includes(key));
  }
}
