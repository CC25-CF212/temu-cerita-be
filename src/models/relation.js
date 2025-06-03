const { User } = require("./users");
const { Article } = require("./articles");
const { Category } = require("./category");
const { ArticleCategoryMap } = require("./article_category_map");
const { ArticleLikes } = require("./article_likes");
const { ArticleComments } = require("./article_comments");
const { ArticleSaved } = require("./article_saved");
const { ArticleImage } = require("./article_images");

// ========================================
// RELASI USER - ARTICLE
// ========================================
User.hasMany(Article, {
  foreignKey: "user_id",
  as: "articles",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Article.belongsTo(User, {
  foreignKey: "user_id",
  as: "author",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// ========================================
// RELASI ARTICLE - ARTICLE_SAVED
// ========================================
Article.hasMany(ArticleSaved, {
  foreignKey: "article_id",
  as: "saves",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

ArticleSaved.belongsTo(Article, {
  foreignKey: "article_id",
  as: "article",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

User.hasMany(ArticleSaved, {
  foreignKey: "user_id",
  as: "saved_articles",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

ArticleSaved.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// ========================================
// RELASI ARTICLE - ARTICLE_IMAGE
// ========================================
Article.hasMany(ArticleImage, {
  foreignKey: "article_id",
  as: "images",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

ArticleImage.belongsTo(Article, {
  foreignKey: "article_id",
  as: "article",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// ========================================
// RELASI ARTICLE - ARTICLE_CATEGORY_MAP
// ========================================
Article.hasMany(ArticleCategoryMap, {
  foreignKey: "article_id",
  as: "category_maps",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

ArticleCategoryMap.belongsTo(Article, {
  foreignKey: "article_id",
  as: "article",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// ========================================
// RELASI CATEGORY - ARTICLE_CATEGORY_MAP
// ========================================
Category.hasMany(ArticleCategoryMap, {
  foreignKey: "category_id",
  as: "article_maps",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

ArticleCategoryMap.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// ========================================
// RELASI ARTICLE - ARTICLE_LIKES
// ========================================
Article.hasMany(ArticleLikes, {
  foreignKey: "article_id",
  as: "likes",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

ArticleLikes.belongsTo(Article, {
  foreignKey: "article_id",
  as: "article",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

User.hasMany(ArticleLikes, {
  foreignKey: "user_id",
  as: "liked_articles",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

ArticleLikes.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// ========================================
// RELASI ARTICLE - ARTICLE_COMMENTS
//========================================
Article.hasMany(ArticleComments, {
  foreignKey: "article_id",
  as: "comments",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

ArticleComments.belongsTo(Article, {
  foreignKey: "article_id",
  as: "article",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

User.hasMany(ArticleComments, {
  foreignKey: "user_id",
  as: "comments",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

ArticleComments.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// ========================================
// RELASI KOMENTAR KE PARENT KOMENTAR (SELF-REFERENCING)
// ========================================
ArticleComments.hasMany(ArticleComments, {
  foreignKey: "parent_comment_id",
  as: "replies",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

ArticleComments.belongsTo(ArticleComments, {
  foreignKey: "parent_comment_id",
  as: "parent",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// ========================================
// MANY-TO-MANY RELATIONS (Optional untuk kemudahan query)
// ========================================

// Article - Category (Many-to-Many melalui ArticleCategoryMap)
Article.belongsToMany(Category, {
  through: ArticleCategoryMap,
  foreignKey: "article_id",
  otherKey: "category_id",
  as: "categories",
});

Category.belongsToMany(Article, {
  through: ArticleCategoryMap,
  foreignKey: "category_id",
  otherKey: "article_id",
  as: "articles",
});

//User - Article (Many-to-Many untuk likes)
User.belongsToMany(Article, {
  through: ArticleLikes,
  foreignKey: "user_id",
  otherKey: "article_id",
  as: "liked_articles_direct",
});

Article.belongsToMany(User, {
  through: ArticleLikes,
  foreignKey: "article_id",
  otherKey: "user_id",
  as: "liked_by_users",
});

// User - Article (Many-to-Many untuk saves)
User.belongsToMany(Article, {
  through: ArticleSaved,
  foreignKey: "user_id",
  otherKey: "article_id",
  as: "saved_articles_direct",
});

Article.belongsToMany(User, {
  through: ArticleSaved,
  foreignKey: "article_id",
  otherKey: "user_id",
  as: "saved_by_users",
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
