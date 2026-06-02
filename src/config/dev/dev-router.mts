import { Hono } from 'hono';
import { container } from '../../container.mts';
import { rolesRequired } from '../../security/roles-required.mts';

export const router = new Hono();

router.post('/db_populate', rolesRequired('admin'), async (c) => {
  await container.dbPopulateService.populate();
  const success = {
    db_populate: 'ok',
  };
  return c.json(success);
});
