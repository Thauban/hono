import { AUTHORIZATION, BEARER, DELETE, restURL } from "../constants.mts";
import { beforeAll, describe, expect, test } from "vitest";
import { getToken } from "../token.mts";

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------
const id = "50";

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------
// Test-Suite
describe("DELETE /rest", () => {
  let token: string;
  let tokenUser: string;

  beforeAll(async () => {
    token = await getToken("admin", "p");
    tokenUser = await getToken("user", "p");
  });

  test.concurrent("Vorhandenen Soldat loeschen", async () => {
    // given
    const url = `${restURL}/${id}`;
    const headers = new Headers();
    headers.append(AUTHORIZATION, `${BEARER} ${token}`);

    // when
    const { status } = await fetch(url, {
      method: DELETE,
      headers,
    });

    // then
    expect(status).toBe(204);
  });
});
