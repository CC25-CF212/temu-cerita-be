"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Article_category_maps", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      article_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Articles",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Categories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex(
      "Article_category_maps",
      ["article_id", "category_id"],
      {
        unique: true,
        name: "unique_article_category",
      }
    );

    await queryInterface.addIndex("Article_category_maps", ["article_id"]);
    await queryInterface.addIndex("Article_category_maps", ["category_id"]);
    await queryInterface.addIndex("Article_category_maps", ["is_primary"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Article_category_maps");
  },
};
