/**
 * Creates the `contactPage` content type holding the editable copy on
 * /contact. The form itself stays in code; only its wording is managed here.
 *
 * Singleton by convention, as with `siteSettings`.
 */
module.exports = function (migration) {
  const contactPage = migration
    .createContentType("contactPage")
    .name("Contact page")
    .description(
      "Editable copy for the Contact page. Only one entry of this type should exist.",
    )
    .displayField("heading");

  contactPage
    .createField("heading")
    .name("Heading")
    .type("Symbol")
    .required(true);

  contactPage.createField("intro").name("Intro").type("Text");

  contactPage
    .createField("submitLabel")
    .name("Submit button label")
    .type("Symbol")
    .required(true);

  contactPage
    .createField("submittingLabel")
    .name("Submit button label while sending")
    .type("Symbol")
    .required(true);

  contactPage
    .createField("successMessage")
    .name("Success message")
    .type("Text")
    .required(true);

  contactPage
    .createField("errorMessage")
    .name("Error message")
    .type("Text")
    .required(true);
};
