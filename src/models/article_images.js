("use strict");
const { DataTypes } = require("sequelize");
const sequelize = require("./index");
const ArticleImage = sequelize.define(
  "ArticleImage",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        isUrl: true,
      },
    },
    article_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Articles",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "ArticleImage",
    tableName: "Article_images",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = { ArticleImage };
