import { Hono } from 'hono';
import { createPageable } from '../service/pageable.mts';
import {
    SoldatService,
    type SoldatMitAusruestungUndVerletzungen,
} from '../service/soldat-service.mts';
import { type Suchparameter } from '../service/suchparameter.mts';

export const router = new Hono();

const service = new SoldatService();

router.get('/', async (c) => {
    const query = c.req.query();

    const pageable = createPageable({
        number: query['page'],
        size: query['size'],
    });

    const { page, size, ...suchparameter } = query;
    const soldaten = await service.find(
        suchparameter as Suchparameter,
        pageable,
    );

    return c.json(soldaten);
});

router.get('/:id', async (c) => {
    const idParam = c.req.param('id');

    if (!SoldatService.ID_PATTERN.test(idParam)) {
        return c.notFound();
    }

    const id = Number(idParam);
    const soldat: Readonly<SoldatMitAusruestungUndVerletzungen> =
        await service.findById({ id });

    return c.json(soldat);
});