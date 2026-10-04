// Must be set before any module imports lib/cms/env.ts.
process.env.CONTENTFUL_SPACE_ID ??= "test-space";
process.env.CONTENTFUL_DELIVERY_TOKEN ??= "test-delivery-token";
process.env.CONTENTFUL_ENVIRONMENT ??= "master";
