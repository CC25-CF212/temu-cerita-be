const { User } = require("./users");
const { Article } = require("./articles");
// const { Article_saved } = require('./article_saved');
const { Category } = require("./category");
const { ArticleCategoryMap } = require("./article_category_map");
const { ArticleLikes } = require("./article_likes");
const { ArticleComments } = require("./article_comments");
const { ArticleSaved } = require("./article_saved");
const { ArticleImage } = require("./article_images");

// Relasi User - Article
User.hasMany(Article, { foreignKey: "user_id", as: "articles" });
Article.belongsTo(User, { foreignKey: "user_id", as: "author" });

// // Relasi Article - Article_saved
Article.hasMany(ArticleSaved, { foreignKey: "article_id", as: "saves" });
ArticleSaved.belongsTo(Article, { foreignKey: "article_id" });
User.hasMany(ArticleSaved, { foreignKey: "user_id", as: "saved_articles" });
ArticleSaved.belongsTo(User, { foreignKey: "user_id" });

// // Relasi Article - Article_image
Article.hasMany(ArticleImage, { foreignKey: "article_id", as: "images" });
ArticleImage.belongsTo(Article, { foreignKey: "article_id" });

// // Relasi Article - Article_category_map
Article.hasMany(ArticleCategoryMap, {
  foreignKey: "article_id",
  as: "category_maps",
});
ArticleCategoryMap.belongsTo(Article, { foreignKey: "article_id" });

// // Relasi Article_category - Article_category_map
Category.hasMany(ArticleCategoryMap, {
  foreignKey: "article_category_id",
  as: "articles",
});
ArticleCategoryMap.belongsTo(Category, {
  foreignKey: "article_category_id",
  as: "category",
});

// // Relasi Article - Article_like
Article.hasMany(ArticleLikes, { foreignKey: "article_id", as: "likes" });
ArticleLikes.belongsTo(Article, { foreignKey: "article_id" });
User.hasMany(ArticleLikes, { foreignKey: "user_id", as: "liked_articles" });
ArticleLikes.belongsTo(User, { foreignKey: "user_id" });

// // Relasi Article - ArticleComments
Article.hasMany(ArticleComments, { foreignKey: "article_id", as: "comments" });
ArticleComments.belongsTo(Article, { foreignKey: "article_id" });
User.hasMany(ArticleComments, { foreignKey: "user_id", as: "comments" });
ArticleComments.belongsTo(User, { foreignKey: "user_id" });

// // Relasi komentar ke parent komentar
ArticleComments.hasMany(ArticleComments, {
  foreignKey: "parent_comment_id",
  as: "replies",
});
ArticleComments.belongsTo(ArticleComments, {
  foreignKey: "parent_comment_id",
  as: "parent",
});

module.exports = {
  User,
  Article,
  ArticleSaved,
  ArticleImage,
  Category,
  ArticleCategoryMap,
  ArticleLikes,
  ArticleComments,
};
