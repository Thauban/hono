import { config } from './app.mts';
import { getLogger } from '../logger/logger.mts';

const logger = getLogger('config/mail', 'file');
const { mail } = config;

const activated = mail?.activated === undefined || mail?.activated === true;

if (typeof mail === 'object') {
  if (Object.hasOwn(mail, 'host') && typeof mail.host !== 'string') {
    throw new TypeError('Der konfigurierte Mailserver ist kein String');
  }
  if (Object.hasOwn(mail, 'port') && typeof mail.port !== 'number') {
    throw new TypeError('Der konfigurierte Port für den Mailserver ist keine Zahl');
  }
}
const host = (mail?.host as string | undefined) ?? 'mail';
const port = (mail?.port as number | undefined) ?? 25; // oxlint-disable-line no-magic-numbers
const useLogger = mail?.log === true;
const from = (mail?.from as string | undefined) ?? '"Joe Doe" <Joe.Doe@acme.com>';
const to = (mail?.to as string | undefined) ?? '"Foo Bar" <Foo.Bar@acme.com>';

export const options: any = {
  host,
  port,
  secure: false,

  priority: 'normal',
  logger: useLogger,
} as const;

type MailConfig = {
  activated: boolean;
  options: any;
  from: string;
  to: string;
};
export const mailConfig: MailConfig = {
  activated,
  options,
  from,
  to,
};

Object.freeze(options);
logger.debug('mailConfig = %o', mailConfig);
