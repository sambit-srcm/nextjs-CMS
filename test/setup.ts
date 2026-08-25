// `lib/cms/env.ts` validates at module load, so these must exist before any
// module under test is imported — later than this and the import throws.
process.env.CONTENTFUL_SPACE_ID ??= "test-space";
process.env.CONTENTFUL_DELIVERY_TOKEN ??= "test-delivery-token";
process.env.CONTENTFUL_ENVIRONMENT ??= "master";
