import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Prisma, PrismaClient } from '../../generated/prisma/client.ts';
import {
  SoldatService,
  type SoldatMitAusruestungUndVerletzungen,
} from './soldat-service.mts';

// Hoisting: wird an den (Datei-) Anfang verschoben
const { findUniqueMock } = vi.hoisted(() => ({
  findUniqueMock: vi.fn<PrismaClient['soldat']['findUnique']>(),
}));

// vi.mock() bewirkt Hoisting
vi.mock('../../config/prisma-client.mts', () => ({
  prismaClient: {
    soldat: {
      findUnique: findUniqueMock,
    },
  },
}));

describe('SoldatService findById', () => {
  let service: SoldatService;

  beforeEach(() => {
    service = new SoldatService();
    findUniqueMock.mockReset();
  });

  test('id vorhanden', async () => {
    // given
    const id = 1;
    const soldatMock: Readonly<SoldatMitAusruestungUndVerletzungen> = {
      id,
      version: 0,
      vorname: 'Eren',
      nachname: 'Jaeger',
      geburtsdatum: new Date('2000-01-01'),
      geschlecht: 'MAENNLICH',
      rang: 'REKRUT',
      username: 'eren',
      erzeugt: new Date(),
      aktualisiert: new Date(),
      ausruestung: {
        id: 1,
        waffe: 'Klinge',
        seriennummer: 'SN-1',
        soldatId: id,
      },
      verletzungen: [],
    };
    // return von prismaClient.buch.findUnique()
    findUniqueMock.mockResolvedValueOnce(soldatMock);

    // when
    const soldat = await service.findById({ id });

    // then
    expect(soldat).toStrictEqual(soldatMock);
  });

  test('id nicht vorhanden', async () => {
    // given
    const id = 999;
    findUniqueMock.mockResolvedValue(null);

    // when / then
    await expect(service.findById({ id })).rejects.toThrow(
      `Es gibt keinen Soldaten mit der ID ${id}.`,
    );
  });
});
