"use strict";
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
        isUrl: {
          args: true,
          msg: "Image URL must be a valid URL",
        },
      },
    },
    alt_text: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    caption: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    article_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Articles",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
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
    indexes: [
      {
        fields: ["article_id"],
      },
      {
        fields: ["order"],
      },
    ],
  }
);

module.exports = { ArticleImage };
