"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const ArticleLikes = sequelize.define(
  "ArticleLikes",
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
    modelName: "ArticleLikes",
    tableName: "Article_likes",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["user_id", "article_id"], // Prevent duplicate likes
        name: "unique_user_article_like",
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

module.exports = { ArticleLikes };
