const { formidable } = require("formidable");
const path = require("path");
const fs = require("fs");
const Joi = require("joi");
const { v4: uuidv4 } = require("uuid");
const {
  Article,
  ArticleLikes,
  ArticleComments,
  ArticleCategoryMap,
  Category,
  ArticleSaved,
  User,
} = require("../models/relation");
// const sequelize = require("../models/index");
const { Op, Sequelize } = require("sequelize");
const articleService = require("../services/articleService");

const createArticleHandler = async (request, h) => {
  const articleSchema = Joi.object({
    title: Joi.string().min(5).required(),
    content_html: Joi.string().required(),
    province: Joi.string().required(),
    city: Joi.string().required(),
    active: Joi.boolean().required(),
    thumbnail: Joi.required(),
    category: Joi.string().required(),
  });

  const form = formidable({
    multiples: false,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
  });

  return new Promise((resolve, reject) => {
    form.parse(request.raw.req, async (err, fields, files) => {
      if (err) {
        return resolve(
          h
            .response({
              statusCode: 400,
              status: "fail",
              message: "Form parsing error",
            })
            .code(400)
        );
      }

      const { error, value } = articleSchema.validate({
        title: fields.title?.[0],
        content_html: fields.content_html?.[0],
        province: fields.province?.[0],
        active: fields.active?.[0],
        city: fields.city?.[0],
        thumbnail: files.thumbnail?.[0],
        category: fields.category?.[0],
      });

      if (error) {
        return resolve(
          h
            .response({
              statusCode: 400,
              status: "fail",
              message: error.details[0].message,
            })
            .code(400)
        );
      }

      try {
        const user_id = request.auth.credentials.id;
        const { title, content_html, province, active, city, category } =
          fields;
        const file = files.thumbnail;
        // const receivedMimeType = file.mimetype.toLowerCase();
        // console.log(file[0].mimetype, "===> fileee");

        // Validasi file
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        if (!allowedTypes.includes(file[0].mimetype)) {
          return resolve(
            h
              .response({
                statusCode: 415,
                status: "fail",
                message: "Only jpg, jpeg, and png files are allowed",
              })
              .code(415)
          );
        }

        const ext = path.extname(file[0].originalFilename).toLowerCase();
        const uuid = uuidv4();
        const fileName = `${title[0].replace(/\s+/g, "-")}-${uuid.slice(
          0,
          5
        )}${ext}`;

        // Buat slug dan insert ke DB
        const slug = `${title[0]
          .toLowerCase()
          .replace(/\s+/g, "-")}-${uuid.slice(0, 5)}`;

        console.log("97");

        let existingCategory = await Category.findOne({
          where: { category: category[0].trim().toLowerCase() },
        });

        console.log("103");
        // console.log(existingCategory, "exisssss");

        if (!existingCategory) {
          existingCategory = await Category.create({
            id: uuidv4(),
            category: category[0].trim().toLowerCase(),
          });
        }

        const article = await Article.create({
          id: uuid,
          title: title[0],
          slug: slug,
          thumbnail_url: fileName,
          content_html: content_html[0],
          province: province[0],
          city: city[0],
          user_id,
          active: active[0],
        });

        await ArticleCategoryMap.create({
          id: uuidv4(),
          article_id: article.id,
          article_category_id: existingCategory.id,
        });

        return resolve(
          h
            .response({
              statusCode: 201,
              status: "success",
              message: "Article created successfully",
              data: article,
            })
            .code(201)
        );
      } catch (error) {
        console.error(error);
        return resolve(
          h
            .response({
              statusCode: 500,
              status: "error",
              message: "Internal Server Error",
            })
            .code(500)
        );
      }
    });
  });
};

const getCalculatedArticleAttributes = (userId) => {
  const attributes = [
    [
      Sequelize.literal(`(
        SELECT COUNT(*) FROM "Article_likes" AS likes WHERE likes.article_id = "Articles"."id"
      )`),
      "total_likes",
    ],
    [
      Sequelize.literal(`(
        SELECT COUNT(*) FROM "Article_comments" AS comments WHERE comments.article_id = "Articles"."id"
      )`),
      "total_comments",
    ],
    [
      Sequelize.literal(`(
        SELECT name FROM "Users" WHERE "Articles".user_id = "Users"."id"
      )`),
      "authorName",
    ],
  ];

  if (userId) {
    attributes.push([
      Sequelize.literal(`(
          EXISTS (
              SELECT 1 FROM "Article_likes" AS "user_like"
              WHERE "user_like"."article_id" = "Articles"."id"
              AND "user_like"."user_id" = '${userId}'
          )
      )`),
      "isLikedByUser",
    ]);
    attributes.push([
      Sequelize.literal(`(
          EXISTS (
              SELECT 1 FROM "Article_saved" AS "user_save"
              WHERE "user_save"."article_id" = "Articles"."id"
              AND "user_save"."user_id" = '${userId}'
          )
      )`),
      "isSavedByUser",
    ]);
  } else {
    attributes.push([Sequelize.literal("false"), "isLikedByUser"]);
    attributes.push([Sequelize.literal("false"), "isSavedByUser"]);
  }
  return attributes;
};

const getAllArticleHandler = async (request, h) => {
  try {
    const { title, category: categoryQuery } = request.query;
    const userId = request.auth.isAuthenticated
      ? request.auth.credentials.id
      : null;

    const whereClause = {
      active: true,
    };
    if (title) {
      whereClause.title = { [Op.iLike]: `%${title}%` };
    }

    const calculatedAttributes = getCalculatedArticleAttributes(userId);

    const articles = await Article.findAll({
      where: whereClause,
      include: [
        { model: ArticleLikes, as: "likes", attributes: [] },
        { model: ArticleComments, as: "comments", attributes: [] },
        {
          model: ArticleCategoryMap,
          as: "category_maps",
          required: !!categoryQuery,
          include: [
            {
              model: Category,
              as: "category",
              attributes: ["id", "category"],
              where: categoryQuery
                ? { category: { [Op.iLike]: `%${categoryQuery}%` } }
                : undefined,
              required: !!categoryQuery,
            },
          ],
        },
      ],
      attributes: {
        include: calculatedAttributes,
      },
      order: [["created_at", "DESC"]],
      distinct: true,
    });

    return h
      .response({
        statusCode: 200,
        status: "success",
        data: articles,
      })
      .code(200);
  } catch (error) {
    console.error("Error in getAllArticleHandler:", error);
    return h
      .response({
        statusCode: 500,
        status: "error",
        message: "Internal Server Error",
      })
      .code(500);
  }
};

const getArticleBySlug = async (request, h) => {
  try {
    const { slug } = request.params;
    const userId = request.auth.isAuthenticated
      ? request.auth.credentials.id
      : null;

    console.log(
      `[getArticleBySlug] Mencari artikel dengan slug: ${slug}, untuk userId: ${userId}`
    );

    const calculatedAttributes = getCalculatedArticleAttributes(userId);

    const article = await Article.findOne({
      where: { slug },
      include: [
        {
          model: ArticleCategoryMap,
          as: "category_maps",
          attributes: ["id"],
          include: [
            {
              model: Category,
              as: "category",
              attributes: ["id", "category"],
            },
          ],
          required: false,
        },
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email"],
        },
      ],
      attributes: {
        include: calculatedAttributes,
      },
    });

    console.log(
      `[getArticleBySlug] Hasil findOne untuk slug '${slug}':`,
      article ? "Ditemukan" : "Tidak Ditemukan (null)"
    );
    if (!article) {
      return h
        .response({
          statusCode: 404,
          status: "fail",
          message: "Article not found",
        })
        .code(404);
    }

    if (!article.active && article.user_id !== userId) {
      console.log(
        `[getArticleBySlug] Artikel '${slug}' tidak aktif dan user '${userId}' bukan pemilik.`
      );
      return h
        .response({
          statusCode: 404,
          status: "fail",
          message:
            "Article not found or you do not have permission to view it.",
        })
        .code(404);
    }

    return h
      .response({
        statusCode: 200,
        status: "success",
        data: article,
      })
      .code(200);
  } catch (error) {
    console.error(
      "Error in getArticleBySlug:",
      error.name,
      error.message,
      error.stack
    ); // Log error lebih detail
    return h
      .response({
        statusCode: 500,
        status: "error",
        message: "Internal Server Error",
      })
      .code(500);
  }
};

const getAllCategories = async (request, h) => {
  const categories = await Category.findAll();

  return h
    .response({
      statusCode: 200,
      status: "success",
      data: categories,
    })
    .code(200);
};

const postLikeArticle = async (request, h) => {
  try {
    const { articleId, userId } = request.params;

    // Check if article exists and is active
    const article = await Article.findOne({ where: { id: articleId } });
    if (!article || !article.active) {
      return h
        .response({
          statusCode: 404,
          status: "fail",
          message: "Article not found",
        })
        .code(404);
    }

    // Check if user already liked this article
    const existingLike = await ArticleLikes.findOne({
      where: {
        article_id: articleId,
        user_id: userId,
      },
    });

    let message;
    let isLiked;

    if (existingLike) {
      // Jika sudah exist, HAPUS like (unlike)
      await ArticleLikes.destroy({
        where: {
          article_id: articleId,
          user_id: userId,
        },
      });
      message = `Article unliked by user ${userId}`;
      isLiked = false;
    } else {
      // Jika tidak exist, INSERT like baru
      await ArticleLikes.create({
        article_id: articleId,
        user_id: userId,
      });
      message = `Article liked by user ${userId}`;
      isLiked = true;
    }

    // Get total likes count for this article
    const totalLikes = await ArticleLikes.count({
      where: { article_id: articleId },
    });

    return h
      .response({
        statusCode: 200,
        status: "success",
        message: message,
        data: {
          articleId: articleId,
          userId: userId,
          isLiked: isLiked,
          totalLikes: totalLikes,
        },
      })
      .code(200);
  } catch (err) {
    console.error("ERROR TOGGLING ARTICLE LIKE:", err);

    // Handle specific database errors
    if (err.name === "SequelizeValidationError") {
      return h
        .response({
          statusCode: 400,
          status: "fail",
          message: "Invalid data provided",
        })
        .code(400);
    }

    return h
      .response({
        statusCode: 500,
        status: "error",
        message: "Internal Server Error",
      })
      .code(500);
  }
};

const deleteLikeArticle = async (request, h) => {
  try {
    const { articleId } = request.params;
    console.log(articleId, "3100 articcc");
    const article = await Article.findOne({ where: { id: articleId } });

    if (!article || !article.active) {
      return h
        .response({
          statusCode: 404,
          status: "fail",
          message: "Article not found",
        })
        .code(404);
    }

    const user = request.auth.credentials;
    console.log(user.id, "ussserrrrrrr id");
    console.log(user.email, "ussserrrrrrr id");

    const articleLikeByUser = await ArticleLikes.findOne({
      where: {
        article_id: article.id,
        user_id: user.id,
      },
    });

    if (!articleLikeByUser) {
      return h
        .response({
          statusCode: 404,
          status: "fail",
          message: "User has not liked this article.",
        })
        .code(404);
    }

    await articleLikeByUser.destroy();
    return h
      .response({
        statusCode: 200,
        status: "success",
        message: "Success unliked the article",
      })
      .code(200);
  } catch (err) {
    console.error("ERROR UNLIKE ARTICLE:", err);
    return h
      .response({
        statusCode: 500,
        status: "error",
        message: "Internal Server Error",
      })
      .code(500);
  }
};

const postSaveArticle = async (request, h) => {
  try {
    const { articleId, userId } = request.params;

    // Check if article exists and is active
    const article = await Article.findOne({ where: { id: articleId } });
    if (!article || !article.active) {
      return h
        .response({
          statusCode: 404,
          status: "fail",
          message: "Article not found",
        })
        .code(404);
    }

    //const user = request.auth.credentials;

    // Check if user already saved this article
    const existingSave = await ArticleSaved.findOne({
      where: {
        article_id: articleId,
        user_id: userId,
      },
    });

    let message;
    let isSaved;

    if (existingSave) {
      // Jika sudah exist, HAPUS save (unsave)
      await ArticleSaved.destroy({
        where: {
          article_id: articleId,
          user_id: userId,
        },
      });
      message = `Article unsaved by ${userId}`;
      isSaved = false;
    } else {
      // Jika tidak exist, INSERT save baru
      await ArticleSaved.create({
        article_id: articleId,
        user_id: userId,
      });
      message = `Article saved by ${userId}`;
      isSaved = true;
    }

    // Get total saves count for this article (optional)
    const totalSaves = await ArticleSaved.count({
      where: { article_id: articleId },
    });

    return h
      .response({
        statusCode: 200,
        status: "success",
        message: message,
        data: {
          articleId: articleId,
          userId: userId,
          userEmail: userId,
          isSaved: isSaved,
          totalSaves: totalSaves,
        },
      })
      .code(200);
  } catch (err) {
    console.error("ERROR TOGGLING ARTICLE SAVE:", err);

    // Handle specific database errors
    if (err.name === "SequelizeValidationError") {
      return h
        .response({
          statusCode: 400,
          status: "fail",
          message: "Invalid data provided",
        })
        .code(400);
    }

    return h
      .response({
        statusCode: 500,
        status: "error",
        message: "Internal Server Error",
      })
      .code(500);
  }
};

const deleteSaveArticle = async (request, h) => {
  try {
    const { articleId } = request.params;
    const article = await Article.findOne({ where: { id: articleId } });

    if (!article || !article.active) {
      return h
        .response({
          statusCode: 404,
          status: "fail",
          message: "Article not found",
        })
        .code(404);
    }

    const user = request.auth.credentials;

    const articleSaveByUser = await ArticleSaved.findOne({
      where: {
        article_id: article.id,
        user_id: user.id,
      },
    });

    if (!articleSaveByUser) {
      return h
        .response({
          statusCode: 404,
          status: "fail",
          message: "User has not saved this article.",
        })
        .code(404);
    }

    await articleSaveByUser.destroy();
    return h
      .response({
        statusCode: 200,
        status: "success",
        message: "Success unsaved the article",
      })
      .code(200);
  } catch (err) {
    console.error("ERROR UNSAVE ARTICLE:", err);
    return h
      .response({
        statusCode: 500,
        status: "error",
        message: "Internal Server Error",
      })
      .code(500);
  }
};

module.exports = {
  createArticleHandler,
  getAllArticleHandler,
  getAllCategories,
  postLikeArticle,
  deleteLikeArticle,
  postSaveArticle,
  deleteSaveArticle,
  getArticleBySlug,
};
