function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}. See .env.example.`);
  }
  return value;
}

export const spaceId = required(
  process.env.CONTENTFUL_SPACE_ID,
  "CONTENTFUL_SPACE_ID",
);

export const deliveryToken = required(
  process.env.CONTENTFUL_DELIVERY_TOKEN,
  "CONTENTFUL_DELIVERY_TOKEN",
);

export const environment = process.env.CONTENTFUL_ENVIRONMENT ?? "master";
