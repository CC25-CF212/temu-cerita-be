// 'use strict';
// const { DataTypes } = require('sequelize');
// const sequelize = require('./index');
// const { v4: uuidv4 } = require('uuid');

// const Article = sequelize.define(
//   'Articles',
//   {
//     id: {
//       type: DataTypes.UUID,
//       defaultValue: uuidv4,
//       primaryKey: true
//     },
//     title: {
//       type: DataTypes.STRING,
//       allowNull: false
//     },
//     slug: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       unique: true
//     },
//     thumbnail_url: {
//       type: DataTypes.STRING,
//       allowNull: false
//     },
//     content_html: {
//       type: DataTypes.TEXT,
//       allowNull: false
//     },
//     province: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },
//     city: {
//       type: DataTypes.STRING,
//       allowNull: true
//     },
//     user_id: {
//       type: DataTypes.UUID,
//       allowNull: false
//     },
//     active: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: true
//     }
//   },
//   {
//     modelName: 'Article',
//     tableName: 'Articles',
//     underscored: true,
//     timestamps: true
//   }
// );

// module.exports = { Article };

// "use strict";
// const { DataTypes } = require("sequelize");
// const sequelize = require("./index");
// class Article {
//   static associate(models) {
//     // Article belongs to User
//     //   Article.belongsTo(models.User, {
//     //     foreignKey: "user_id",
//     //     as: "author",
//     //   });

//     // Article has many ArticleImages
//     Article.hasMany(models.ArticleImage, {
//       foreignKey: "article_id",
//       as: "images",
//       onDelete: "CASCADE",
//     });
//   }
// }

// Article.init(
//   {
//     id: {
//       type: DataTypes.UUID,
//       defaultValue: DataTypes.UUIDV4,
//       primaryKey: true,
//     },
//     title: {
//       type: DataTypes.STRING,
//       allowNull: false,
//       validate: {
//         notEmpty: true,
//         len: [1, 255],
//       },
//     },
//     slug: {
//       type: DataTypes.STRING,
//       unique: true,
//       allowNull: false,
//       validate: {
//         notEmpty: true,
//       },
//     },
//     thumbnail_url: {
//       type: DataTypes.STRING,
//       validate: {
//         isUrl: true,
//       },
//     },
//     content_html: {
//       type: DataTypes.TEXT,
//       allowNull: false,
//       validate: {
//         notEmpty: true,
//       },
//     },
//     province: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     city: {
//       type: DataTypes.STRING,
//       allowNull: true,
//     },
//     active: {
//       type: DataTypes.BOOLEAN,
//       defaultValue: true,
//     },
//     user_id: {
//       type: DataTypes.UUID,
//       allowNull: false,
//       //   references: {
//       //     model: 'Users',
//       //     key: 'id'
//       //   }
//     },
//   },
//   {
//     sequelize,
//     modelName: "Article",
//     tableName: "Articles",
//     underscored: true,
//     timestamps: true,
//     createdAt: "created_at",
//     updatedAt: "updated_at",
//   }
// );

// module.exports = { Article };
"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("./index");
const { ArticleImage } = require("./article_images");

const Article = sequelize.define(
  "Article",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255],
      },
    },
    slug: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    thumbnail_url: {
      type: DataTypes.STRING,
      validate: {
        isUrl: true,
      },
    },
    content_html: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    province: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      // references: {
      //   model: 'Users',
      //   key: 'id'
      // }
    },
  },
  {
    sequelize,
    modelName: "Article",
    tableName: "Articles",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = { Article };
