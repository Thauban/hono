import { PrismaClient } from '../generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import { getLogger } from '../logger/logger.mts';
import { prismaQueryInsights } from '@prisma/sqlcommenter-query-insights';
import process from 'node:process';
import { styleText } from 'node:util';

const logger = getLogger('prisma-client', 'file');

export const adapter = new PrismaPg({
    connectionString: process.env['DATABASE_URL'],
});

let tmpClient: PrismaClient;

if (logger.isLevelEnabled('debug')) {
    const debugClient = new PrismaClient({
        adapter,
        errorFormat: 'pretty',
        log: [
            {
                emit: 'event',
                level: 'query',
            },
            'info',
            'warn',
            'error',
        ],
        comments: [prismaQueryInsights()],
    });

    debugClient.$on('query', (event) => {
        // console.log(), weil der Pino-Logger asynchron ist
        const message = styleText(['black', 'bgWhite'], 'Query:');
        console.log(`${message} ${event.query}`);
    });

    tmpClient = debugClient;
} else {
    const prodClient = new PrismaClient({ adapter });
    tmpClient = prodClient;
}

export const prismaClient = tmpClient;

export const connectDB = async () => {
    await prismaClient.$connect();
    logger.info('Verbindung mit der DB ist hergestellt.');
};

export const disconnectDB = async () => {
    await prismaClient.$disconnect();
    logger.info('Verbindung mit der DB ist getrennt.');
};
