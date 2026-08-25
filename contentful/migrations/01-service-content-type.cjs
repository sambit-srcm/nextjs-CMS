/**
 * Creates the `service` content type backing the /services page.
 *
 * Run with:
 *   npm run contentful:migrate
 */
module.exports = function (migration) {
  const service = migration
    .createContentType("service")
    .name("Service")
    .description("A service offering shown on the Services page.")
    .displayField("title");

  service.createField("title").name("Title").type("Symbol").required(true);

  service
    .createField("description")
    .name("Description")
    .type("Text")
    .required(true);

  service
    .createField("price")
    .name("Price")
    .type("Symbol")
    .validations([{ size: { max: 60 } }]);

  service
    .createField("image")
    .name("Image")
    .type("Link")
    .linkType("Asset")
    .validations([{ linkMimetypeGroup: ["image"] }]);

  service.createField("order").name("Display order").type("Integer");

  service.changeFieldControl("price", "builtin", "singleLine", {
    helpText: 'Free text, e.g. "From $2,500/mo".',
  });

  service.changeFieldControl("order", "builtin", "numberEditor", {
    helpText: "Lower numbers appear first on the Services page.",
  });
};
