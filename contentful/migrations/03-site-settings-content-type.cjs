/**
 * Creates the `siteSettings` content type.
 *
 * This is a singleton by convention: exactly one entry is expected, and the
 * queries read the first one. Contentful has no built-in singleton concept,
 * so the constraint is documented here and enforced by editorial discipline.
 */
module.exports = function (migration) {
  const siteSettings = migration
    .createContentType("siteSettings")
    .name("Site settings")
    .description(
      "Homepage banner plus the mission and vision copy on the About page. Only one entry of this type should exist.",
    )
    .displayField("bannerTitle");

  siteSettings
    .createField("bannerTitle")
    .name("Banner title")
    .type("Symbol")
    .required(true);

  siteSettings
    .createField("bannerSubtitle")
    .name("Banner subtitle")
    .type("Text")
    .required(true);

  siteSettings.createField("missionTitle").name("Mission title").type("Symbol");
  siteSettings.createField("missionBody").name("Mission body").type("Text");
  siteSettings.createField("visionTitle").name("Vision title").type("Symbol");
  siteSettings.createField("visionBody").name("Vision body").type("Text");
};
