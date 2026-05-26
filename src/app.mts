import { Hono } from 'hono';
import { compress } from 'hono/compress';
import { secureHeaders } from 'hono/secure-headers';
import { NotFoundError } from './soldat/service/errors.mts';
import { router as soldatRouter } from './soldat/router/soldat-router.mts';

/**
 * Web-Applikation mit Hono.
 */
export const app = new Hono();

// -----------------------------------------------------------------------------
// M i d d l e w a r e
// -----------------------------------------------------------------------------

app.use(secureHeaders(), compress());

// -----------------------------------------------------------------------------
// R o u t e n
// -----------------------------------------------------------------------------

app.route('/soldaten', soldatRouter);

// -----------------------------------------------------------------------------
// E r r o r   H a n d l e r
// -----------------------------------------------------------------------------

app.onError((error, c) => {
    if (error instanceof NotFoundError) {
        return c.notFound();
    }

    console.error(error);
    return c.body('Interner Fehler', 500);
});