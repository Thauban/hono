/* eslint-disable max-classes-per-file */

/**
 * Das Modul besteht aus den Klassen fuer die Fehlerbehandlung bei der Verwaltung
 * von Soldaten, z.B. beim DB-Zugriff.
 * @packageDocumentation
 */

/**
 * Error-Klasse fuer einen nicht gefundenen Soldaten.
 */
export class NotFoundError extends Error {}

/**
 * Error-Klasse fuer eine ungueltige Versionsnummer beim Aendern.
 */
export class VersionInvalidError extends Error {
  readonly version: string | undefined;

  constructor(version: string | undefined) {
    super(`Die Versionsnummer ${version} ist ungueltig.`);
    this.version = version;
  }
}

/**
 * Error-Klasse fuer eine veraltete Versionsnummer beim Aendern.
 */
export class VersionOutdatedError extends Error {
  readonly version: number;

  constructor(version: number) {
    super(`Die Versionsnummer ${version} ist nicht aktuell.`);
    this.version = version;
  }
}

/* eslint-enable max-classes-per-file */
