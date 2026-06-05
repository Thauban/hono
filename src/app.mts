import { type Context, Hono, type Next } from 'hono';
import {
  NotFoundError,
  VersionInvalidError,
  VersionOutdatedError,
} from './soldat/service/errors.mts';
import { router } from './soldat/router/soldat-router.mts';
import { router as soldatWriteRouter } from './soldat/router/soldat-write-router.mts';
import { router as authRouter } from './security/auth-router.mts';
import { router as healthRouter } from './admin/health-router.mts';
import { compress } from 'hono/compress';
import { cors } from 'hono/cors';
import { corsOptions } from './config/cors.mts';
import { createMiddleware } from 'hono/factory'; // oxlint-disable-line import/max-dependencies
import { router as devRouter } from './config/dev/dev-router.mts';
import { env } from './config/env.mts';
import { paths } from './config/paths.mts';
import { secureHeaders } from 'hono/secure-headers';
import { type ZodError } from 'zod';
import {
  createProblemDetails,
  preconditionFailed,
  unprocessableContent,
  notFound
} from './problem-details.mts';
import { getLogger } from './logger/logger.mts';

export const app = new Hono();

const logger = getLogger('app', 'file');

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


app.route(paths.rest, router);
app.route(paths.rest, soldatWriteRouter);
app.route(paths.health, healthRouter);
app.route(paths.auth, authRouter);

const { NODE_ENV } = env;
if (NODE_ENV === 'development' || NODE_ENV === 'test') {
  app.route(paths.dev, devRouter);
}

// -----------------------------------------------------------------------------
// E r r o r   H a n d l e r
// -----------------------------------------------------------------------------
app.onError((error, c) => {
 if (error instanceof NotFoundError) {
  return createProblemDetails(c, notFound, error.message);
}

  if (error.name === 'ZodError') {
    return createProblemDetails(c, unprocessableContent, (error as ZodError).issues);
  }

  if (error instanceof VersionInvalidError || error instanceof VersionOutdatedError) {
    return createProblemDetails(c, preconditionFailed, error.message);
  }

  logger.error('Interner Fehler: %o', error);
  console.log(error.stack);
  return c.body('Interner Fehler', 500);
});
