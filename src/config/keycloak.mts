import { config } from './app.mts';
import { env } from './env.mts';
import { getLogger } from '../logger/logger.mts';

const logger = getLogger('config/keycloak', 'file');

const { keycloak } = config;

if (typeof keycloak === 'object') {
  if (
    (keycloak.schema !== undefined && typeof keycloak.schema !== 'string') ||
    (keycloak.port !== undefined && typeof keycloak.port !== 'number')
  ) {
    console.error('!!!keycloak=%j', keycloak);
    throw new TypeError('Die Konfiguration für Keycloak (Schema und Port) ist falsch');
  }
  if (keycloak.realm !== undefined && typeof keycloak.realm !== 'string') {
    throw new TypeError('Der konfigurierte Realm-Name für Keycloak ist kein String');
  }
  if (keycloak.clientId !== undefined && typeof keycloak.clientId !== 'string') {
    throw new TypeError('Der konfigurierte Client-ID für Keycloak ist kein String');
  }
}

const schema = (keycloak?.schema as string | undefined) ?? 'https';
const host = (keycloak?.host as string | undefined) ?? 'keycloak';
const port = (keycloak?.port as number | undefined) ?? 8443; // oxlint-disable-line no-magic-numbers
const authServerUrl = `${schema}://${host}:${port}`;
// Keycloak ist in Sicherheits-Bereiche (= realms) unterteilt
const realm = (keycloak?.realm as string | undefined) ?? 'javascript';
const issuer = `${authServerUrl}/realms/${realm}`;
const oidcUrl = `${issuer}/protocol/openid-connect`;
const jwksUri = `${oidcUrl}/certs`;
const clientId = (keycloak?.clientId as string | undefined) ?? 'javascript-client';
const audience = ['account'];

// fuer KeycloakService
const accessTokenUrl = `${oidcUrl}/token`;

const { CLIENT_SECRET, NODE_ENV } = env;

export const keycloakConfig = {
  realm,
  issuer,
  jwksUri,
  clientId,
  audience,
  // fuer KeycloakService
  accessTokenUrl,
  secret: CLIENT_SECRET ?? 'ERROR: Umgebungsvariable CLIENT_SECRET nicht gesetzt!',
};

if (NODE_ENV === 'development') {
  logger.debug('keycloakConfig = %o', keycloakConfig);
} else {
  // oxlint-disable-next-line no-unused-vars
  const { secret, ...keycloakConfigLog } = keycloakConfig;
  logger.debug('keycloakConfig = %o', keycloakConfigLog);
}
