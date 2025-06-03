"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const ArticleComments = sequelize.define(
  "ArticleComments",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 1000], // Maximum 1000 characters for comment
      },
    },
    parent_comment_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "Article_comments",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
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
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "ArticleComments",
    tableName: "Article_comments",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        fields: ["article_id"],
      },
      {
        fields: ["user_id"],
      },
      {
        fields: ["parent_comment_id"],
      },
      {
        fields: ["active"],
      },
      {
        fields: ["created_at"],
      },
    ],
  }
);

module.exports = { ArticleComments };
