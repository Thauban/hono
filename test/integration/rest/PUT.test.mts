import {
  APPLICATION_JSON,
  AUTHORIZATION,
  BEARER,
  CONTENT_TYPE,
  IF_MATCH,
  PUT,
  restURL,
} from "../constants.mts";
import { beforeAll, describe, expect, test } from "vitest";
import { type SoldatUpdateType } from "../../../src/soldat/router/soldat-validation.mts";
import { getToken } from "../token.mts";

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
const geaendertesSoldat: Omit<SoldatUpdateType, "datum"> = {
  vorname: "Peter",
  nachname: "Klein",
  geburtsdatum: new Date("2025-02-28T00:00:00Z"),
  geschlecht: "WEIBLICH",
  rang: "REKRUT",
  username: "Peter",
};
const idVorhanden = "30";

const geaendertesSoldatIdNichtVorhanden: Omit<SoldatUpdateType, "datum"> = {
  vorname: "Peter",
  nachname: "Klein",
  geburtsdatum: new Date("2025-02-28T00:00:00Z"),
  geschlecht: "WEIBLICH",
  rang: "REKRUT",
  username: "Peter",
};
const idNichtVorhanden = "999999";

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
// Test-Suite
describe("PUT /rest/:id", () => {
  let token: string;

  beforeAll(async () => {
    token = await getToken("admin", "p");
  });

  test("Vorhandenes Soldat aendern", async () => {
    // given
    const url = `${restURL}/${idVorhanden}`;
    const headers = new Headers();
    headers.append(CONTENT_TYPE, APPLICATION_JSON);
    headers.append(IF_MATCH, '"0"');
    headers.append(AUTHORIZATION, `${BEARER} ${token}`);

    // when
    const { status } = await fetch(url, {
      method: PUT,
      body: JSON.stringify(geaendertesSoldat),
      headers,
    });

    // then
    expect(status).toBe(204);
  });

  test("Nicht-vorhandenes Soldat aendern", async () => {
    // given
    const url = `${restURL}/${idNichtVorhanden}`;
    const headers = new Headers();
    headers.append(CONTENT_TYPE, APPLICATION_JSON);
    headers.append(IF_MATCH, '"0"');
    headers.append(AUTHORIZATION, `${BEARER} ${token}`);

    // when
    const { status } = await fetch(url, {
      method: PUT,
      body: JSON.stringify(geaendertesSoldatIdNichtVorhanden),
      headers,
    });

    // then
    expect(status).toBe(404);
  });
});
