"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const ArticleCategoryMap = sequelize.define(
  "ArticleCategoryMap",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
    category_id: {
      type: DataTypes.UUID,
      // allowNull: false,
      references: {
        model: "Categories",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "ArticleCategoryMap",
    tableName: "Article_category_maps",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["article_id", "category_id"], // Prevent duplicate category assignments
        name: "unique_article_category",
      },
      {
        fields: ["article_id"],
      },
      {
        fields: ["category_id"],
      },
      {
        fields: ["is_primary"],
      },
    ],
  }
);

module.exports = { ArticleCategoryMap };
