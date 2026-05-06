// Copyright (C) 2025 - present Juergen Zimmermann, Hochschule Karlsruhe
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

// Aufruf:   bun i
//           bun --env-file=.env prisma generate
//
//           bun --env-file=.env src\beispiele-write.mts

import { PrismaPg } from '@prisma/adapter-pg';
import process from 'node:process';
import { styleText } from 'node:util';
import { PrismaClient, type Prisma } from './generated/prisma/client.ts';

let message = styleText(
    'yellow',
    `process.env['DATABASE_URL']=${process.env['DATABASE_URL']}`,
);
console.log(message);
console.log();

const adapter = new PrismaPg({
    connectionString: process.env['DATABASE_URL_ADMIN'],
});

const log: (Prisma.LogLevel | Prisma.LogDefinition)[] = [
    {
        emit: 'event',
        level: 'query',
    },
    'info',
    'warn',
    'error',
];

// PrismaClient fuer DB "soldat" (siehe Umgebungsvariable DATABASE_URL in ".env")
// d.h. mit PostgreSQL-User "soldat" und Schema "soldat"
const prisma = new PrismaClient({
    adapter,
    errorFormat: 'pretty',
    log,
});
prisma.$on('query', (e) => {
    message = styleText('green', `Query: ${e.query}`);
    console.log(message);
    message = styleText('cyan', `Duration: ${e.duration} ms`);
    console.log(message);
});

const neuerSoldat: Prisma.SoldatCreateInput = {
    vorname: 'Eren',
    nachname: 'Jaeger',
    geburtsdatum: '2000-01-01T00:00:00.000Z',
    geschlecht: 'WEIBLICH',
    rang: 'REKRUT',
    username: 'Jaeger',
    // 1:1-Beziehung
    ausruestung: {
        create: {
            waffe: 'Klinge',
            seriennummer: '123',
        },
    },
    // 1:N-Beziehung
    verletzungen: {
        create: [
            {
                verletzungsbezeichnung: 'Kopfverletzung',
                behandelt: true,
                schweregrad: 'LEICHT',
                verletzungsdatum: '2000-12-25T00:00:00.000Z',
            },
        ],
    },
};
type SoldatCreated = Prisma.SoldatGetPayload<{
    include: {
        ausruestung: true;
        verletzungen: true;
    };
}>;

const geaendertesSoldat: Prisma.SoldatUpdateInput = {
    version: { increment: 1 },
    rang: 'SOLDAT',
};
type SoldatUpdated = Prisma.SoldatGetPayload<{}>; // eslint-disable-line @typescript-eslint/no-empty-object-type

// Schreib-Operationen mit dem Model "Soldat"
try {
    await prisma.$connect();
    await prisma.$transaction(async (tx) => {
        // Neuer Datensatz mit generierter ID
        const soldatDb: SoldatCreated = await tx.soldat.create({
            data: neuerSoldat,
            include: { ausruestung: true, verletzungen: true },
        });
        message = styleText(['black', 'bgWhite'], 'Generierte ID:');
        console.log(`${message} ${soldatDb.id}`);
        console.log();

        // Version +1 wegen "Optimistic Locking" bzw. Vermeidung von "Lost Updates"
        const soldatUpdated: SoldatUpdated = await tx.soldat.update({
            data: geaendertesSoldat,
            where: { id: 30 },
        });
        // eslint-disable-next-line require-atomic-updates
        message = styleText(['black', 'bgWhite'], 'Aktualisierte Version:');
        console.log(`${message} ${soldatUpdated.version}`);
        console.log();

        // https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/referential-actions#referential-action-defaults
        // https://www.prisma.io/docs/orm/prisma-schema/data-model/relations/relation-mode
        const geloescht = await tx.soldat.delete({
            where: { id: soldatDb.id },
        });
        // eslint-disable-next-line require-atomic-updates
        message = styleText(['black', 'bgWhite'], 'Geloescht:');
        console.log(`${message} ${geloescht.id}`);
    });
} finally {
    await prisma.$disconnect();
}
