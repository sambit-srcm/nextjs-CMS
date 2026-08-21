import "server-only";

import { createClient } from "contentful";

import { deliveryToken, environment, spaceId } from "./env";

// Server-only: the delivery token must never be bundled into client JS.
export const client = createClient({
  space: spaceId,
  environment,
  accessToken: deliveryToken,
});
