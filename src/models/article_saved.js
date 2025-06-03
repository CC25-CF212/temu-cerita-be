"use strict";

const { DataTypes } = require("sequelize");
const sequelize = require(".");

const ArticleSaved = sequelize.define(
  "ArticleSaved",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
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
    modelName: "ArticleSaved",
    tableName: "Article_saved",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["user_id", "article_id"], // Prevent duplicate saves
        name: "unique_user_article_save",
      },
      {
        fields: ["article_id"],
      },
      {
        fields: ["user_id"],
      },
    ],
  }
);

module.exports = { ArticleSaved };
