import { type Context, Hono, type Next } from 'hono';
import {
    NotFoundError,
    VersionInvalidError,
    VersionOutdatedError,
} from './soldat/service/errors.mts';
import { router } from './soldat/router/soldat-router.mts';
import { compress } from 'hono/compress';
import { cors } from 'hono/cors';
import { corsOptions } from './config/cors.mts';
import { createMiddleware } from 'hono/factory'; // oxlint-disable-line import/max-dependencies
import { router as devRouter } from './config/dev/dev-router.mts';
import { env } from './config/env.mts';
import { paths } from './config/paths.mts';
import { secureHeaders } from 'hono/secure-headers';

export const app = new Hono();

// -----------------------------------------------------------------------------
// M i d d l e w a r e
// -----------------------------------------------------------------------------
const securityHeaders = createMiddleware(async (c: Context, next: Next) => {
    c.header('X-Content-Type-Options', 'nosniff');
    // siehe CORS
    c.header('X-Frame-Options', 'SAMEORIGIN');
    await next();
});

app.use(secureHeaders(), cors(corsOptions), securityHeaders, compress());

// -----------------------------------------------------------------------------
// R o u t e n
// -----------------------------------------------------------------------------


const { NODE_ENV } = env;
if (NODE_ENV === 'development' || NODE_ENV === 'test') {
    app.route(paths.dev, devRouter);
}

app.route("/soldaten", router);

// -----------------------------------------------------------------------------
// E r r o r   H a n d l e r
// -----------------------------------------------------------------------------
app.onError((error, c) => {
    console.log(error.stack);
    return c.body('Interner Fehler', 500);
  if (error instanceof NotFoundError) {
    return c.notFound();
  }

  console.error(error);
  return c.body("Interner Fehler", 500);
});
