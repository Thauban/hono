import process from 'node:process';
import { styleText } from 'node:util';
import { PrismaPg } from '@prisma/adapter-pg';
import { prismaQueryInsights } from '@prisma/sqlcommenter-query-insights';
import { PrismaClient, type Soldat, type Prisma } from './generated/prisma/client.ts';

let message = styleText(['black', 'bgWhite'], 'Node version');
console.log(`${message}=${process.version}`);
message = styleText(['black', 'bgWhite'], 'DATABASE_URL');
console.log(`${message}=${process.env['DATABASE_URL']}`);
console.log();

// "named parameter" durch JSON-Objekt
const adapter = new PrismaPg({
  connectionString: process.env['DATABASE_URL'],
});

// union type
const log: (Prisma.LogLevel | Prisma.LogDefinition)[] = [
  {
    // siehe unten: prisma.$on('query', ...);
    emit: 'event',
    level: 'query',
  },
  'info',
  'warn',
  'error',
];

// PrismaClient passend zur Umgebungsvariable DATABASE_URL in ".env"
// d.h. mit PostgreSQL-User "soldat" und Schema "soldat"
const prisma = new PrismaClient({
  // shorthand property
  adapter,
  errorFormat: 'pretty',
  log,
  // Kommentar zu Log-Ausgabe:
  // /*prismaQuery='soldat.findMany%3A...
  comments: [prismaQueryInsights()],
});
prisma.$on('query', (e) => {
  message = styleText('green', `Query: ${e.query}`);
  console.log(message);
  message = styleText('cyan', `Duration: ${e.duration} ms`);
  console.log(message);
});

export type SoldatMitVerletzungUndAusruestung = Prisma.SoldatGetPayload<{
  include: {
    verletzungen: true;
    ausruestung: true;
  };
}>;

// Operationen mit dem Model "Soldat"
try {
  await prisma.$connect();

  // Das Resultat ist null, falls kein Datensatz gefunden
  const soldat: Soldat | null = await prisma.soldat.findFirst({
    orderBy: { id: 'asc' },
  });
  message = styleText(['black', 'bgWhite'], 'soldat');
  console.log(`${message} = %j`, soldat);
  console.log();

  const soldatenMitVerletzungen: SoldatMitVerletzungUndAusruestung[] = await prisma.soldat.findMany(
    {
      where: {
        verletzungen: {
          some: {
            verletzungsbezeichnung: {
              contains: 'n',
            },
          },
        },
      },
      include: {
        verletzungen: true,
        ausruestung: true,
      },
    },
  );
  message = styleText(['black', 'bgWhite'], 'soldatenMitVerletzungen');
  console.log(`${message} = %j`, soldatenMitVerletzungen);
  console.log();

  // Pagination
  const soldatenPage2: Soldat[] = await prisma.soldat.findMany({
    skip: 5,
    take: 5,
  });
  message = styleText(['black', 'bgWhite'], 'soldatenPage2');
  console.log(`${message} = %j`, soldatenPage2);
  console.log();
} finally {
  await prisma.$disconnect();
}

// PrismaClient mit PostgreSQL-User "postgres", d.h. mit Administrationsrechten
const adapterAdmin = new PrismaPg({
  connectionString: process.env['DATABASE_URL_ADMIN'],
});
const prismaAdmin = new PrismaClient({ adapter: adapterAdmin });
try {
  const soldatenAdmin: Soldat[] = await prismaAdmin.soldat.findMany({
    where: {
      verletzungen: {
        some: {
          verletzungsbezeichnung: {
            contains: 'n',
          },
        },
      },
    },
  });
  message = styleText(['black', 'bgWhite'], 'soldatenAdmin');
  console.log(`${message} = ${JSON.stringify(soldatenAdmin)}`);
} finally {
  await prismaAdmin.$disconnect();
}
