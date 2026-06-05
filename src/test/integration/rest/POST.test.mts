import {
    APPLICATION_JSON,
    AUTHORIZATION,
    BEARER,
    CONTENT_TYPE,
    LOCATION,
    POST,
    restURL,
} from '../constants.mts';
import { beforeAll, describe, expect, test } from 'vitest';
import { type SoldatNeuType } from '../../../../src/soldat/router/soldat-validation.mts';
import { SoldatService } from '../../../../src/soldat/service/soldat-service.mts';
import type { ProblemDetails } from '../../../../src/problem-details.mts';
import { getToken } from '../token.mts';

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
const neuesSoldat: Omit<SoldatNeuType, 'datum'>= {
  vorname: "Peter",
  nachname: "Klein",
  geburtsdatum: new Date("2025-02-28T00:00:00Z"),
  geschlecht: "WEIBLICH",
  rang: "REKRUT",
  username: "Peter",
  ausruestung: {
    waffe: "Klinge",
    seriennummer: "AOT-12345ABC"
  },
  verletzungen: [{
    verletzungsbezeichnung: "Knochenbruch",
    behandelt: false,
    schweregrad: "LEICHT",
    verletzungsdatum: new Date("2025-02-28T00:00:00Z")
  }]
};
const neuesSoldatInvalid: Record<string, unknown> = {
    vorname: '123Peter',
    nachname: 1,
    geburtsdatum: '2025-02-28T00:00:00Zd',
    geschlecht: 'ddd',
    rang: 'dd',
    username: 'Peter',
    ausruestung: {
        waffe: 'Kliddnge',
        seriennummer: 'zaAOT-12345ABC'
    },
    verletzungen: [{
        verletzungsbezeichnung: 'Knochenbruch',
        behandelt: false,
        schweregrad: 'LEICHT',
        verletzungsdatum: '2025-03-28T00:00:00Z'
    }]
};
// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
// Test-Suite
describe('POST /rest', () => {
    let token: string;

    beforeAll(async () => {
        token = await getToken('admin', 'p');
    });

    test('Neuer Soldat', async () => {
        // given
        const headers = new Headers();
        headers.append(CONTENT_TYPE, APPLICATION_JSON);
        headers.append(AUTHORIZATION, `${BEARER} ${token}`);

        // when
        const response = await fetch(restURL, {
            method: POST,
            body: JSON.stringify(neuesSoldat),
            headers,
        });

        // then
        const { status } = response;

        expect(status).toBe(201);

        const responseHeaders = response.headers;
        const location = responseHeaders.get(LOCATION);

        expect(location).toBeDefined();

        // ID nach dem letzten "/"
        const indexLastSlash = location?.lastIndexOf('/') ?? -1;

        expect(indexLastSlash).not.toBe(-1);

        const idStr = location?.slice(indexLastSlash + 1);

        expect(idStr).toBeDefined();
        expect(SoldatService.ID_PATTERN.test(idStr ?? '')).toBe(true);
    });

    test('Neuer Soldat mit ungueltigen Daten', async () => {
        // given
        const headers = new Headers();
        headers.append(CONTENT_TYPE, APPLICATION_JSON);
        headers.append(AUTHORIZATION, `${BEARER} ${token}`);

        const response = await fetch(restURL, {
            method: POST,
            body: JSON.stringify(neuesSoldatInvalid),
            headers,
        });

        // then
        const { status } = response;

        expect(status).toBe(422);

        const body = (await response.json()) as ProblemDetails;

    });

});
