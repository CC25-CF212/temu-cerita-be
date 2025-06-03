"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Article_saved", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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

    await queryInterface.addIndex("Article_saved", ["user_id", "article_id"], {
      unique: true,
      name: "unique_user_article_save",
    });

    await queryInterface.addIndex("Article_saved", ["article_id"]);
    await queryInterface.addIndex("Article_saved", ["user_id"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Article_saved");
  },
};
