/**
 * Creates the `blogPost` content type backing /blog and the "Latest from the
 * blog" section on the homepage.
 */
module.exports = function (migration) {
  const blogPost = migration
    .createContentType("blogPost")
    .name("Blog post")
    .description("An article listed on the Blog page.")
    .displayField("title");

  blogPost.createField("title").name("Title").type("Symbol").required(true);

  blogPost
    .createField("slug")
    .name("Slug")
    .type("Symbol")
    .required(true)
    .validations([{ unique: true }]);

  blogPost.createField("author").name("Author").type("Symbol").required(true);

  blogPost
    .createField("date")
    .name("Publish date")
    .type("Date")
    .required(true);

  blogPost
    .createField("excerpt")
    .name("Excerpt")
    .type("Text")
    .required(true)
    .validations([{ size: { max: 200 } }]);

  blogPost
    .createField("coverImage")
    .name("Cover image")
    .type("Link")
    .linkType("Asset")
    .validations([{ linkMimetypeGroup: ["image"] }]);

  blogPost.createField("body").name("Body").type("RichText");

  blogPost.changeFieldControl("slug", "builtin", "slugEditor", {
    trackingFieldId: "title",
  });

  blogPost.changeFieldControl("excerpt", "builtin", "multipleLine", {
    helpText: "Shown on the blog listing and homepage. Max 200 characters.",
  });
};
