import {
    type SoldatCreate,
    type SoldatUpdate,
} from '../service/soldat-write-service.mts';
import {
    SoldatNeuSchema,
    type SoldatNeuType,
    SoldatUpdateSchema,
    type SoldatUpdateType,
} from './soldat-validation.mts';
import {
    badRequest,
    createProblemDetails,
    preconditionRequired,
} from '../../problem-details.mts';
import { File } from 'node:buffer';
import { Hono } from 'hono';
import { container } from '../../container.mts';
import { createBaseUrl } from './create-base-url.mts';
import { getLogger } from '../../logger/logger.mts';
import { rolesRequired } from '../../security/roles-required.mts';

const { soldatWriteService } = container;

export const router = new Hono();

const logger = getLogger('soldat-write-router', 'file');

// -----------------------------------------------------------------------------
// N e u a n l e g e n
// -----------------------------------------------------------------------------
const soldatDtoToSoldatCreateInput = (soldatDTO: SoldatNeuType): SoldatCreate => {
    const verletzungen = soldatDTO.verletzungen?.map((verletzungDTO) => {
        const verletzung = {
            verletzungsbezeichnung: verletzungDTO.verletzungsbezeichnung,
            behandelt: verletzungDTO.behandelt,
            schweregrad: verletzungDTO.schweregrad,
            verletzungsdatum: verletzungDTO.verletzungsdatum,
        };
        return verletzung;
    });
    const soldat: SoldatCreate = {
        version: 0,
        vorname: soldatDTO.vorname,
        nachname: soldatDTO.nachname,
        geburtsdatum: soldatDTO.geburtsdatum,
        geschlecht: soldatDTO.geschlecht,
        rang: soldatDTO.rang,
        username: soldatDTO.username,
        ausruestung: {
            create: {
                waffe: soldatDTO.ausruestung.waffe ?? null,
                seriennummer: soldatDTO.ausruestung.seriennummer,
            },
        },
        verletzungen: { create: verletzungen ?? [] },
    };
    return soldat;
};

router.post('/', rolesRequired('admin', 'user'), async (c) => {
    const requestBody = await c.req.json();

    // Validierung mit Zod: ZodError wird geworfen, falls Validierung nicht erfolgreich
    const soldatDTO: SoldatNeuType = SoldatNeuSchema.parse(requestBody);
    logger.debug('post: soldatDTO=%o', soldatDTO);

    const soldat = soldatDtoToSoldatCreateInput(soldatDTO);
    const id = await soldatWriteService.create(soldat);

    const location = `${createBaseUrl(c.req)}/${id}`;
    const { header, body } = c;
    header('Location', location);
    return body(null, 201);
});

// -----------------------------------------------------------------------------
// A e n d e r n
// -----------------------------------------------------------------------------
const soldatDtoToSoldatUpdate = (soldatDTO: SoldatUpdateType): SoldatUpdate => {
    return {
        version: 0,
        vorname: soldatDTO.vorname,
        nachname: soldatDTO.nachname,
        geburtsdatum: soldatDTO.geburtsdatum,
        geschlecht: soldatDTO.geschlecht,
        rang: soldatDTO.rang,
        username: soldatDTO.username,
    };
};

router.put('/:id', rolesRequired('admin', 'user'), async (c) => {
    const { req } = c;
    const id = req.param('id') ?? '-1';
    logger.debug('put: id=%s', id);
    const idNumber = Number.parseInt(id, 10);
    if (Number.isNaN(idNumber)) {
        // https://hono.dev/docs/api/context#notfound
        return c.notFound();
    }

    // https://hono.dev/docs/api/request#header
    const version = req.header('If-Match');
    logger.debug('put: version=%s', version);
    if (version === undefined) {
        logger.debug('put: version === undefined');
        return createProblemDetails(
            c,
            preconditionRequired,
            'Header "If-Match" fehlt',
        );
    }

    const requestBody = await c.req.json();
    logger.debug('put: requestBody=%o', requestBody);

    // Validierung mit Zod
    const soldatDTO: SoldatUpdateType = SoldatUpdateSchema.parse(requestBody);
    logger.debug('put: soldatDTO=%o', soldatDTO);

    const soldat = soldatDtoToSoldatUpdate(soldatDTO);
    const neueVersion = await soldatWriteService.update({
        id: idNumber,
        soldat,
        version,
    });
    logger.debug('put: neueVersion=%d', neueVersion);
    const headers = {
        ETag: `"${neueVersion}"`,
    };
    return c.body(null, 204, headers);
});

// -----------------------------------------------------------------------------
// L o e s c h e n
// -----------------------------------------------------------------------------
router.delete('/:id', rolesRequired('admin'), async (c) => {
    const id = c.req.param('id') ?? '-1';
    logger.debug('delete: id=%s', id);
    const idNumber = Number.parseInt(id, 10);
    const { body } = c;
    if (Number.isNaN(idNumber)) {
        return body(null, 204);
    }

    await soldatWriteService.delete(idNumber);
    return body(null, 204);
});

