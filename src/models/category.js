"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      // allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    slug: {
      type: DataTypes.STRING,
      // allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        is: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, // slug format validation
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, // hex color validation
      },
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Category",
    tableName: "Categories",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        unique: true,
        fields: ["name"],
      },
      {
        unique: true,
        fields: ["slug"],
      },
      {
        fields: ["active"],
      },
    ],
  }
);

module.exports = { Category };
