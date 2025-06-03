const { options } = require("joi");
const {
  createArticleHandler,
  getAllArticleHandler,
  getAllCategories,
  postLikeArticle,
  deleteLikeArticle,
  postSaveArticle,
  deleteSaveArticle,
  getArticleBySlug,
  createArticle,
} = require("../controllers/articleController");
const Joi = require("joi");

const articleRoutes = [
  {
    method: "GET",
    path: "/home",
    handler: (request, h) => {
      const user = request.auth.credentials;

      return h.response({
        message: `Welcome back, ${user.email}`,
        user,
      });
    },
  },
  {
    method: "GET",
    path: "/articles",
    handler: getAllArticleHandler,
  },
  {
    method: "POST",
    path: "/articles",
    // Uncomment the following line if you want to use the original handler
    // handler: createArticleHandler,
    handler: createArticle,
    // options: {
    //   payload: {
    //     output: "stream",
    //     parse: false,
    //     maxBytes: 5 * 1024 * 1024, // 5MB
    //     allow: "multipart/form-data",
    //   },
    // },
  },
  {
    method: "GET",
    path: "/articles/{slug}",
    handler: getArticleBySlug,
  },
  {
    method: "GET",
    path: "/articles/add",
    handler: getAllCategories,
  },
  {
    method: "POST",
    path: "/article/{articleId}/like",
    handler: postLikeArticle,
    options: {
      validate: {
        params: Joi.object({
          articleId: Joi.string().uuid().required(),
        }),
      },
    },
  },
  {
    method: "DELETE",
    path: "/article/{articleId}/like",
    handler: deleteLikeArticle,
    options: {
      validate: {
        params: Joi.object({
          articleId: Joi.string().uuid().required(),
        }),
      },
    },
  },
  {
    method: "POST",
    path: "/article/{articleId}/save",
    handler: postSaveArticle,
    options: {
      validate: {
        params: Joi.object({
          articleId: Joi.string().uuid().required(),
        }),
      },
    },
  },
  {
    method: "DELETE",
    path: "/article/{articleId}/save",
    handler: deleteSaveArticle,
    options: {
      validate: {
        params: Joi.object({
          articleId: Joi.string().uuid().required(),
        }),
      },
    },
  },
];

module.exports = articleRoutes;
