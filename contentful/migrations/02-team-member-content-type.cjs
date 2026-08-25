/**
 * Creates the `teamMember` content type backing the Team section of /about.
 */
module.exports = function (migration) {
  const teamMember = migration
    .createContentType("teamMember")
    .name("Team member")
    .description("A person shown in the Team section of the About page.")
    .displayField("name");

  teamMember.createField("name").name("Name").type("Symbol").required(true);

  teamMember
    .createField("designation")
    .name("Designation")
    .type("Symbol")
    .required(true);

  teamMember.createField("bio").name("Bio").type("Text").required(true);

  teamMember
    .createField("photo")
    .name("Photo")
    .type("Link")
    .linkType("Asset")
    .validations([{ linkMimetypeGroup: ["image"] }]);

  teamMember.createField("order").name("Display order").type("Integer");

  teamMember.changeFieldControl("photo", "builtin", "assetLinkEditor", {
    helpText: "Optional. Falls back to the person's initials when empty.",
  });

  teamMember.changeFieldControl("order", "builtin", "numberEditor", {
    helpText: "Lower numbers appear first.",
  });
};
