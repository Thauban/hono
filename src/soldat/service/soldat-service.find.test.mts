import { beforeEach, describe, expect, test, vi } from "vitest";
import { type PrismaClient } from "../../generated/prisma/client.ts";
import { type Pageable } from "./pageable.mts";
import {
  SoldatService,
  type SoldatMitAusruestungUndVerletzungen,
} from "./soldat-service.mts";
import { type Suchparameter } from "./suchparameter.mts";

const findManyMock = vi.fn<PrismaClient["soldat"]["findMany"]>();
const countMock = vi.fn<PrismaClient["soldat"]["count"]>();

// vi.mock() bewirkt Hoisting
vi.mock("../../config/prisma-client.mts", () => ({
  prismaClient: {
    soldat: {
      findMany: findManyMock,
      count: countMock,
    },
  },
}));

describe("SoldatService find", () => {
  let service: SoldatService;

  beforeEach(() => {
    service = new SoldatService();
    findManyMock.mockReset();
    countMock.mockReset();
  });

  test("nachname vorhanden", async () => {
    // given
    const suchparameter: Suchparameter = {
      nachname: "Braun",
    };
    const pageable: Pageable = {
      number: 0,
      size: 5,
    };
    const soldatMock: SoldatMitAusruestungUndVerletzungen = {
      id: 1,
      version: 0,
      vorname: "Reiner",
      nachname: "Braun",
      geburtsdatum: new Date("1995-08-01"),
      geschlecht: "MAENNLICH",
      rang: "SOLDAT",
      username: "reiner",
      erzeugt: new Date(),
      aktualisiert: new Date(),
      ausruestung: {
        id: 1,
        waffe: "Klinge",
        seriennummer: "SN-1",
        soldatId: 1,
      },
      verletzungen: [],
    };

    // return von prismaClient.soldat.findMany()
    findManyMock.mockResolvedValueOnce([soldatMock]);
    // return von prismaClient.soldat.count()
    countMock.mockResolvedValueOnce(1);

    // when
    const soldaten = await service.find(suchparameter, pageable);

    // then
    expect(soldaten.content).toStrictEqual([soldatMock]);
    expect(soldaten.totalElements).toBe(1);
  });

  test("nachname nicht vorhanden", async () => {
    // given
    const suchparameter: Suchparameter = {
      nachname: "Nichtvorhanden",
    };
    const pageable: Pageable = {
      number: 0,
      size: 5,
    };

    // return von prismaClient.soldat.findMany()
    findManyMock.mockResolvedValueOnce([]);

    // when / then
    await expect(service.find(suchparameter, pageable)).rejects.toThrow(
      "Keine Soldaten gefunden.",
    );
  });

  test("keine suchparameter", async () => {
    // given
    const pageable: Pageable = {
      number: 0,
      size: 5,
    };
    const soldatMock: SoldatMitAusruestungUndVerletzungen = {
      id: 1,
      version: 0,
      vorname: "Reiner",
      nachname: "Braun",
      geburtsdatum: new Date("1995-08-01"),
      geschlecht: "MAENNLICH",
      rang: "SOLDAT",
      username: "reiner",
      erzeugt: new Date(),
      aktualisiert: new Date(),
      ausruestung: {
        id: 1,
        waffe: "Klinge",
        seriennummer: "SN-1",
        soldatId: 1,
      },
      verletzungen: [],
    };

    // return von prismaClient.soldat.findMany()
    findManyMock.mockResolvedValueOnce([soldatMock]);
    // return von prismaClient.soldat.count()
    countMock.mockResolvedValueOnce(1);

    // when
    const soldaten = await service.find(undefined, pageable);

    // then
    expect(soldaten.content).toStrictEqual([soldatMock]);
    expect(soldaten.totalElements).toBe(1);
  });

  test("ungueltiger suchparameter", async () => {
    // given
    const suchparameter = {
      falschesFeld: "abc",
    } as unknown as Suchparameter;
    const pageable: Pageable = {
      number: 0,
      size: 5,
    };

    // when / then
    await expect(service.find(suchparameter, pageable)).rejects.toThrow(
      "Ungueltige Suchparameter",
    );
  });
});
