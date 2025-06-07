const Joi = require("joi");
const {
  getArticles,
  getArticleById,
  getArticleBySlug,
  createArticle,
  updateArticle,
  softDeleteArticle,
  hardDeleteArticle,
  restoreArticle,
  getArticleComments,
  createComment,
  updateComment,
  deleteComment,
  getArticleLikes,
  toggleLike,
  checkUserLike,
  getUserLikedArticles,
  getDashboard,
  getLikedArticlesByUser,
  getSavedArticlesByUser,
  getArticlesByIds,
} = require("../controllers/articleControllers");
const {
  postLikeArticle,
  deleteLikeArticle,
  postSaveArticle,
  deleteSaveArticle,
} = require("../controllers/articleController");
// Custom validation schemas
const imageSchema = Joi.object({
  image_url: Joi.string().uri().required(),
  alt_text: Joi.string().allow("").optional(),
  caption: Joi.string().allow("").optional(),
  order: Joi.number().integer().min(0).default(0),
});
const articlesRoutes = [
  {
    method: "POST",
    path: "/articles",
    handler: createArticle,
  },
  {
    method: "GET",
    path: "/articles",
    handler: getArticles,
    options: {
      validate: {
        query: Joi.object({
          page: Joi.number().integer().min(1).optional(),
          limit: Joi.number().integer().min(1).optional(),
          category: Joi.string().optional(),
          province: Joi.string().optional(),
          city: Joi.string().optional(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/articles/{id}",
    handler: getArticleById,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().required(), // Ganti ke Joi.string().uuid() jika pakai UUID
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/articles/slug/{slug}",
    handler: getArticleBySlug,
    options: {
      validate: {
        params: Joi.object({
          slug: Joi.string().required(),
        }),
      },
    },
  },
  // UPDATE article
  {
    method: "PUT",
    path: "/articles/{id}",
    handler: updateArticle,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().required(),
        }),
        payload: Joi.object({
          title: Joi.string().min(3).max(255).optional(),
          slug: Joi.string()
            .min(3)
            .max(255)
            .pattern(/^[a-z0-9-]+$/)
            .optional(),
          content_html: Joi.string().min(10).optional(),
          province: Joi.string().max(100).allow("").optional(),
          city: Joi.string().max(100).allow("").optional(),
          categories: Joi.array().items(Joi.string()).min(0).optional(),
          images: Joi.array().items(imageSchema).min(0).optional(),
          active: Joi.boolean().optional(),
        }).min(1), // At least one field must be provided
      },
    },
  },

  // PATCH article (partial update)
  {
    method: "PATCH",
    path: "/articles/{id}",
    handler: updateArticle,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().required(),
        }),
        payload: Joi.object({
          title: Joi.string().min(3).max(255).optional(),
          slug: Joi.string()
            .min(3)
            .max(255)
            .pattern(/^[a-z0-9-]+$/)
            .optional(),
          content_html: Joi.string().min(10).optional(),
          province: Joi.string().max(100).allow("").optional(),
          city: Joi.string().max(100).allow("").optional(),
          categories: Joi.array()
            .items(Joi.number().integer())
            .min(0)
            .optional(),
          images: Joi.array().items(imageSchema).min(0).optional(),
          active: Joi.boolean().optional(),
        }).min(1),
      },
    },
  },

  // SOFT DELETE article
  {
    method: "DELETE",
    path: "/articles/{id}",
    handler: softDeleteArticle,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().required(),
        }),
      },
    },
  },

  // HARD DELETE article (permanently delete)
  {
    method: "DELETE",
    path: "/articles/{id}/permanent",
    handler: hardDeleteArticle,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().required(),
        }),
      },
    },
  },

  // RESTORE soft deleted article
  {
    method: "PUT",
    path: "/articles/{id}/restore",
    handler: restoreArticle,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().required(),
        }),
      },
    },
  },

  // UPDATE article status only
  {
    method: "PATCH",
    path: "/articles/{id}/status",
    handler: updateArticle,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().required(),
        }),
        payload: Joi.object({
          active: Joi.boolean().required(),
        }),
      },
    },
  },

  // BULK operations
  {
    method: "PATCH",
    path: "/articles/bulk/status",
    handler: async (request, h) => {
      // This would need a separate controller function for bulk operations
      try {
        const { ids, active } = request.payload;

        // Implementation for bulk status update
        const { Article } = require("../models/relation");

        await Article.update({ active }, { where: { id: ids } });

        return h
          .response({
            success: true,
            message: `${ids.length} articles updated successfully`,
          })
          .code(200);
      } catch (error) {
        console.error("Error in bulk update:", error);
        return h
          .response({
            success: false,
            message: "Internal server error",
            error: error.message,
          })
          .code(500);
      }
    },
    options: {
      validate: {
        payload: Joi.object({
          ids: Joi.array().items(Joi.string()).required(),
          active: Joi.boolean().required(),
        }),
      },
    },
  },
  // ============= COMMENT ROUTES =============

  // GET all comments for an article
  {
    method: "GET",
    path: "/articles/{article_id}/comments",
    handler: getArticleComments,
    options: {
      validate: {
        params: Joi.object({
          article_id: Joi.number().integer().required(),
        }),
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).max(50).default(10),
        }),
      },
    },
  },

  // CREATE comment or reply
  {
    method: "POST",
    path: "/articles/{article_id}/comments",
    handler: createComment,
    options: {
      validate: {
        params: Joi.object({
          article_id: Joi.number().integer().required(),
        }),
        payload: Joi.object({
          user_id: Joi.number().integer().required(),
          comments: Joi.string().min(1).max(1000).required(),
          parent_comment_id: Joi.number().integer().optional().allow(null),
        }),
      },
    },
  },

  // UPDATE comment
  {
    method: "PUT",
    path: "/comments/{comment_id}",
    handler: updateComment,
    options: {
      validate: {
        params: Joi.object({
          comment_id: Joi.number().integer().required(),
        }),
        payload: Joi.object({
          user_id: Joi.number().integer().required(),
          comments: Joi.string().min(1).max(1000).required(),
        }),
      },
    },
  },

  // DELETE comment (soft delete)
  {
    method: "DELETE",
    path: "/comments/{comment_id}",
    handler: deleteComment,
    options: {
      validate: {
        params: Joi.object({
          comment_id: Joi.number().integer().required(),
        }),
        payload: Joi.object({
          user_id: Joi.number().integer().required(),
        }),
      },
    },
  },

  // ============= LIKE ROUTES =============

  // GET article likes
  {
    method: "GET",
    path: "/articles/{article_id}/likes",
    handler: getArticleLikes,
    options: {
      validate: {
        params: Joi.object({
          article_id: Joi.number().integer().required(),
        }),
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).max(100).default(20),
        }),
      },
    },
  },

  // TOGGLE like (like/unlike)
  {
    method: "POST",
    path: "/articles/{article_id}/likes/toggle",
    handler: toggleLike,
    options: {
      validate: {
        params: Joi.object({
          article_id: Joi.number().integer().required(),
        }),
        payload: Joi.object({
          user_id: Joi.number().integer().required(),
        }),
      },
    },
  },

  // CHECK if user liked an article
  {
    method: "GET",
    path: "/articles/{article_id}/likes/user/{user_id}",
    handler: checkUserLike,
    options: {
      validate: {
        params: Joi.object({
          article_id: Joi.number().integer().required(),
          user_id: Joi.number().integer().required(),
        }),
      },
    },
  },

  // GET user's liked articles
  {
    method: "GET",
    path: "/users/{user_id}/liked-articles",
    handler: getUserLikedArticles,
    options: {
      validate: {
        params: Joi.object({
          user_id: Joi.number().integer().required(),
        }),
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).max(50).default(10),
        }),
      },
    },
  },

  // ============= ADDITIONAL ROUTES =============

  // GET comment with replies (single comment detail)
  {
    method: "GET",
    path: "/comments/{comment_id}",
    handler: async (request, h) => {
      try {
        const { comment_id } = request.params;
        const { ArticleComments, User } = require("../models/relation");

        const comment = await ArticleComments.findByPk(comment_id, {
          where: { active: true },
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name", "email"],
            },
            {
              model: ArticleComments,
              as: "replies",
              where: { active: true },
              required: false,
              include: [
                {
                  model: User,
                  as: "user",
                  attributes: ["id", "name", "email"],
                },
              ],
              order: [["created_at", "ASC"]],
            },
          ],
        });

        if (!comment) {
          return h
            .response({
              success: false,
              message: "Comment not found",
            })
            .code(404);
        }

        return h
          .response({
            success: true,
            data: {
              id: comment.id,
              content: comment.comments,
              user: comment.user,
              parent_comment_id: comment.parent_comment_id,
              replies_count: comment.replies ? comment.replies.length : 0,
              replies: comment.replies || [],
              created_at: comment.created_at,
              updated_at: comment.updated_at,
            },
          })
          .code(200);
      } catch (error) {
        console.error("Error fetching comment:", error);
        return h
          .response({
            success: false,
            message: "Internal server error",
            error: error.message,
          })
          .code(500);
      }
    },
    options: {
      validate: {
        params: Joi.object({
          comment_id: Joi.number().integer().required(),
        }),
      },
    },
  },

  // GET user's comments
  {
    method: "GET",
    path: "/users/{user_id}/comments",
    handler: async (request, h) => {
      try {
        const { user_id } = request.params;
        const { page = 1, limit = 10 } = request.query;
        const offset = (page - 1) * limit;

        const {
          ArticleComments,
          User,
          Article,
        } = require("../models/relation");

        // Check if user exists
        const user = await User.findByPk(user_id);
        if (!user) {
          return h
            .response({
              success: false,
              message: "User not found",
            })
            .code(404);
        }

        const comments = await ArticleComments.findAndCountAll({
          where: { user_id, active: true },
          include: [
            {
              model: Article,
              as: "article",
              attributes: ["id", "title", "slug"],
              where: { active: true },
            },
            {
              model: User,
              as: "user",
              attributes: ["id", "name", "email"],
            },
          ],
          order: [["created_at", "DESC"]],
          limit: parseInt(limit),
          offset: parseInt(offset),
          distinct: true,
        });

        return h
          .response({
            success: true,
            data: {
              comments: comments.rows.map((comment) => ({
                id: comment.id,
                content: comment.comments,
                parent_comment_id: comment.parent_comment_id,
                article: comment.article,
                created_at: comment.created_at,
                updated_at: comment.updated_at,
              })),
              pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(comments.count / limit),
                totalItems: comments.count,
                itemsPerPage: parseInt(limit),
              },
            },
          })
          .code(200);
      } catch (error) {
        console.error("Error fetching user comments:", error);
        return h
          .response({
            success: false,
            message: "Internal server error",
            error: error.message,
          })
          .code(500);
      }
    },
    options: {
      validate: {
        params: Joi.object({
          user_id: Joi.number().integer().required(),
        }),
        query: Joi.object({
          page: Joi.number().integer().min(1).default(1),
          limit: Joi.number().integer().min(1).max(50).default(10),
        }),
      },
    },
  },

  // BULK delete comments (for admin)
  {
    method: "DELETE",
    path: "/comments/bulk",
    handler: async (request, h) => {
      try {
        const { comment_ids, user_id } = request.payload;
        const { ArticleComments, sequelize } = require("../models/relation");

        const transaction = await sequelize.transaction();

        try {
          // You can add admin check here
          // For now, allowing users to delete their own comments only

          const result = await ArticleComments.update(
            { active: false },
            {
              where: {
                id: comment_ids,
                user_id: user_id, // Only allow deleting own comments
              },
              transaction,
            }
          );

          await transaction.commit();

          return h
            .response({
              success: true,
              message: `${result[0]} comments deleted successfully`,
            })
            .code(200);
        } catch (error) {
          await transaction.rollback();
          throw error;
        }
      } catch (error) {
        console.error("Error bulk deleting comments:", error);
        return h
          .response({
            success: false,
            message: "Internal server error",
            error: error.message,
          })
          .code(500);
      }
    },
    options: {
      validate: {
        payload: Joi.object({
          comment_ids: Joi.array()
            .items(Joi.number().integer())
            .min(1)
            .required(),
          user_id: Joi.number().integer().required(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/dashboard",
    handler: getDashboard,
  },
  {
    method: "POST",
    path: "/articles/{articleId}/{userId}/like",
    handler: postLikeArticle,
    options: {
      validate: {
        params: Joi.object({
          articleId: Joi.string().required(),
          userId: Joi.string().required(),
        }),
      },
    },
  },
  {
    method: "DELETE",
    path: "/articles/{articleId}/like",
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
    path: "/articles/{articleId}/{userId}/save",
    handler: postSaveArticle,
    options: {
      validate: {
        params: Joi.object({
          articleId: Joi.string().required(),
          userId: Joi.string().required(),
        }),
      },
    },
  },
  {
    method: "DELETE",
    path: "/articles/{articleId}/save",
    handler: deleteSaveArticle,
    options: {
      validate: {
        params: Joi.object({
          articleId: Joi.string().uuid().required(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/articles/likes/{userId}",
    handler: getLikedArticlesByUser,
    options: {
      validate: {
        params: Joi.object({
          userId: Joi.string().required(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/articles/saved/{userId}",
    handler: getSavedArticlesByUser,
    options: {
      validate: {
        params: Joi.object({
          userId: Joi.string().required(),
        }),
      },
    },
  },
  // Alternative route untuk multiple articles - POST method (recommended untuk banyak IDs)
  {
    method: "POST",
    path: "/articles/bulk",
    handler: getArticlesByIds,
    options: {
      validate: {
        // Atau ada .required() di level object
        payload: Joi.object({
          ids: Joi.array().items(Joi.string()),
        }).required(),
      },
    },
  },
];

module.exports = articlesRoutes;
