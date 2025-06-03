"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Article_comments", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
      },
      article_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "Articles", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      parent_comment_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "Article_comments", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });

    await queryInterface.addIndex("Article_comments", ["article_id"]);
    await queryInterface.addIndex("Article_comments", ["user_id"]);
    await queryInterface.addIndex("Article_comments", ["parent_comment_id"]);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("Article_comments");
  },
};
