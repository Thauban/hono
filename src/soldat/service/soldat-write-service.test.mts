import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Prisma } from '../../generated/prisma/client.ts';
import { SoldatService } from './soldat-service.mts';
import {
    type SoldatCreate,
    SoldatWriteService,
} from './soldat-write-service.mts';

const createMock = vi.fn<Prisma.SoldatDelegate["create"]>();
const transactionMock = vi.fn();

// vi.mock() bewirkt Hoisting
vi.mock('../../config/prisma-client.mts', () => ({
    prismaClient: {
        soldat: {
            create: createMock,
        },
        $transaction: transactionMock,
    },
}));

describe('SoldatWriteService create', () => {
    let service: SoldatWriteService;
    let readService: SoldatService;

    beforeEach(() => {
        readService = new SoldatService();
        service = new SoldatWriteService(readService);

        createMock.mockReset();
        transactionMock.mockReset();

        transactionMock.mockImplementation(async (callback) => {
            return callback({
                soldat: {
                    create: createMock,
                },
            });
        });
    });

    test('Neuer Soldat', async () => {
        // given
        const idMock = 1;
        const soldat: SoldatCreate = {
            vorname: 'Reiner',
            nachname: 'Braun',
            geburtsdatum: new Date('1995-08-01'),
            geschlecht: 'MAENNLICH',
            rang: 'SOLDAT',
            username: 'reiner',
            ausruestung: {
                create: {
                    waffe: 'Klinge',
                    seriennummer: 'SN-1',
                },
            },
            verletzungen: {
                create: [],
            },
        };

        const soldatDb: Prisma.SoldatGetPayload<{
            include: {
                ausruestung: true;
                verletzungen: true;
            };
        }> = {
            id: idMock,
            version: 0,
            vorname: 'Reiner',
            nachname: 'Braun',
            geburtsdatum: new Date('1995-08-01'),
            geschlecht: 'MAENNLICH',
            rang: 'SOLDAT',
            username: 'reiner',
            erzeugt: new Date(),
            aktualisiert: new Date(),
            ausruestung: {
                id: 1,
                waffe: 'Klinge',
                seriennummer: 'SN-1',
                soldatId: idMock,
            },
            verletzungen: [],
        };

        // return von tx.soldat.create()
        createMock.mockResolvedValue(soldatDb);

        // when
        const id = await service.create(soldat);

        // then
        expect(id).toBe(idMock);
    });
});
