const {
  Article,
  ArticleImage,
  ArticleLikes,
  ArticleComments,
  Category,
  ArticleCategoryMap,
  User,
  ArticleSaved,
} = require("../models/relation");
const { Op, Sequelize } = require("sequelize");
const articleService = require("../services/articleService");
const sequelize = require("../models");

const getArticles = async (request, h) => {
  try {
    const { page = 1, limit = 10, category, province, city } = request.query;
    const offset = (page - 1) * limit;

    let whereCondition = { active: true };
    if (province) whereCondition.province = province;
    if (city) whereCondition.city = city;

    let categoryFilter = {};
    if (category) {
      categoryFilter = {
        include: [
          {
            model: Category,
            as: "category",
            where: { name: { [Op.iLike]: `%${category}%` } },
          },
        ],
      };
    }

    const articles = await Article.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email"],
        },
        {
          model: ArticleImage,
          as: "images",
          attributes: ["id", "image_url", "alt_text", "caption", "order"],
          order: [["order", "ASC"]],
        },
        {
          model: ArticleLikes,
          as: "likes",
          attributes: ["id", "user_id"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: ArticleComments,
          as: "comments",
          attributes: ["id", "user_id", "parent_comment_id", "comments"],
          where: { parent_comment_id: null, active: true },
          required: false,
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: ArticleCategoryMap,
          as: "category_maps",
          include: [
            {
              model: Category,
              as: "category",
              attributes: ["id", "name", "slug", "color"],
            },
          ],
          ...categoryFilter,
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true,
    });

    const transformedArticles = articles.rows.map((article) => {
      const primaryCategory =
        article.category_maps?.[0]?.category?.name || "Uncategorized";
      const images = article.images.map((img) => img.image_url);
      const mainImage = images.length > 0 ? images[0] : "/images/default.png";

      return {
        id: article.id,
        category: primaryCategory,
        title: article.title,
        slug: article.slug,
        description:
          article.content_html.replace(/<[^>]*>/g, "").substring(0, 150) +
          "...",
        content_html: article.content_html,
        province: article.province,
        city: article.city,
        active: article.active,
        thumbnail_url: mainImage,
        images: images,
        createdAt: article.created_at,
        updatedAt: article.updated_at,
        likes: article.likes.length,
        comments: article.comments.length,
        author: article.author,
      };
    });

    return h
      .response({
        success: true,
        data: {
          articles: transformedArticles,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(articles.count / limit),
            totalItems: articles.count,
            itemsPerPage: parseInt(limit),
          },
        },
      })
      .code(200);
  } catch (error) {
    console.error("Error fetching articles:", error);
    return h
      .response({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
      .code(500);
  }
};

const getArticleById = async (request, h) => {
  try {
    const { id } = request.params;

    const article = await Article.findOne({
      where: { id, active: true },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email"],
        },
        {
          model: ArticleImage,
          as: "images",
          attributes: ["id", "image_url"],
        },
        {
          model: ArticleLikes,
          as: "likes",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: ArticleComments,
          as: "comments",
          where: { parent_comment_id: null },
          required: false,
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name"],
            },
            {
              model: ArticleComments,
              as: "replies",
              include: [
                {
                  model: User,
                  as: "user",
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        },
        {
          model: ArticleCategoryMap,
          as: "category_maps",
          include: [
            {
              model: Category,
              as: "category",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    if (!article) {
      return h
        .response({
          success: false,
          message: "Article not found",
        })
        .code(404);
    }

    const primaryCategory =
      article.category_maps?.[0]?.category?.name || "Uncategorized";
    const images = article.images.map((img) => img.image_url);
    const mainImage = images.length > 0 ? images[0] : "/images/default.png";

    const transformedArticle = {
      id: article.id,
      category: primaryCategory,
      categories: article.category_maps.map((cm) => cm.category),
      title: article.title,
      slug: article.slug,
      description:
        article.content_html.replace(/<[^>]*>/g, "").substring(0, 150) + "...",
      content_html: article.content_html,
      province: article.province,
      city: article.city,
      active: article.active,
      thumbnail_url: mainImage,
      images: images,
      createdAt: article.created_at,
      updatedAt: article.updated_at,
      likes: article.likes.length,
      comments: article.comments.length,
      author: article.author,
      likesDetails: article.likes,
      commentsDetails: article.comments,
    };

    return h
      .response({
        success: true,
        data: transformedArticle,
      })
      .code(200);
  } catch (error) {
    console.error("Error fetching article:", error);
    return h
      .response({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
      .code(500);
  }
};

const getArticleBySlug = async (request, h) => {
  try {
    const { slug } = request.params;

    const article = await Article.findOne({
      where: { slug, active: true },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email"],
        },
        {
          model: ArticleImage,
          as: "images",
          attributes: ["id", "image_url"],
        },
        {
          model: ArticleLikes,
          as: "likes",
          attributes: ["id", "user_id"],
        },
        {
          model: ArticleComments,
          as: "comments",
          where: { parent_comment_id: null },
          required: false,
          include: [
            {
              model: ArticleComments,
              as: "replies",
            },
          ],
        },
        {
          model: ArticleCategoryMap,
          as: "category_maps",
          include: [
            {
              model: Category,
              as: "category",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    if (!article) {
      return h
        .response({
          success: false,
          message: "Article not found",
        })
        .code(404);
    }

    const primaryCategory =
      article.category_maps?.[0]?.category?.name || "Uncategorized";
    const images = article.images.map((img) => img.image_url);
    const mainImage = images.length > 0 ? images[0] : "/images/default.png";

    const transformedArticle = {
      id: article.id,
      category: primaryCategory,
      title: article.title,
      slug: article.slug,
      description:
        article.content_html.replace(/<[^>]*>/g, "").substring(0, 150) + "...",
      content_html: article.content_html,
      province: article.province,
      city: article.city,
      active: article.active,
      thumbnail_url: mainImage,
      images: images,
      createdAt: article.created_at,
      updatedAt: article.updated_at,
      likes: article.likes.length,
      comments: article.comments.reduce((total, comment) => {
        return total + 1 + (comment.replies ? comment.replies.length : 0);
      }, 0),
      author: article.author,
    };

    return h
      .response({
        success: true,
        data: transformedArticle,
      })
      .code(200);
  } catch (error) {
    console.error("Error fetching article by slug:", error);
    return h
      .response({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
      .code(500);
  }
};
// CREATE ARTICLE
const createArticleOri = async (request, h) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      title,
      slug,
      content_html,
      province,
      city,
      author_id,
      categories = [], // array of category IDs
      images = [], // array of image objects with url, alt_text, caption, order
      active = true,
    } = request.payload;

    // Validate required fields
    if (!title || !slug || !content_html || !author_id) {
      await transaction.rollback();
      return h
        .response({
          success: false,
          message: "Title, slug, content_html, and author_id are required",
        })
        .code(400);
    }

    // Check if author exists
    const author = await User.findByPk(author_id);
    if (!author) {
      await transaction.rollback();
      return h
        .response({
          success: false,
          message: "Author not found",
        })
        .code(404);
    }

    // Check if slug already exists
    const existingArticle = await Article.findOne({ where: { slug } });
    if (existingArticle) {
      await transaction.rollback();
      return h
        .response({
          success: false,
          message: "Article with this slug already exists",
        })
        .code(409);
    }

    // Create article
    const article = await Article.create(
      {
        title,
        slug,
        content_html,
        province,
        city,
        author_id,
        active,
      },
      { transaction }
    );

    // Create article images if provided
    if (images && images.length > 0) {
      const imageData = images.map((img) => ({
        article_id: article.id,
        image_url: img.image_url,
        alt_text: img.alt_text || "",
        caption: img.caption || "",
        order: img.order || 0,
      }));

      await ArticleImage.bulkCreate(imageData, { transaction });
    }

    // Create article category mappings if provided
    if (categories && categories.length > 0) {
      // Validate categories exist
      const validCategories = await Category.findAll({
        where: { id: categories },
        transaction,
      });

      if (validCategories.length !== categories.length) {
        await transaction.rollback();
        return h
          .response({
            success: false,
            message: "One or more categories not found",
          })
          .code(404);
      }

      const categoryMappings = categories.map((categoryId) => ({
        article_id: article.id,
        category_id: categoryId,
      }));

      await ArticleCategoryMap.bulkCreate(categoryMappings, { transaction });
    }

    await transaction.commit();

    // Fetch the created article with all relations
    const createdArticle = await Article.findByPk(article.id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email"],
        },
        {
          model: ArticleImage,
          as: "images",
          attributes: ["id", "image_url", "alt_text", "caption", "order"],
          order: [["order", "ASC"]],
        },
        {
          model: ArticleCategoryMap,
          as: "category_maps",
          include: [
            {
              model: Category,
              as: "category",
              attributes: ["id", "name", "slug", "color"],
            },
          ],
        },
      ],
    });

    return h
      .response({
        success: true,
        message: "Article created successfully",
        data: createdArticle,
      })
      .code(201);
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating article:", error);
    return h
      .response({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
      .code(500);
  }
};

// Create new article
const createArticle = async (request, h) => {
  try {
    const articleData = request.payload;
    const article = await articleService.createArticle(articleData);

    return h
      .response({
        statusCode: 201,
        success: true,
        message: "Article created successfully",
        data: article,
      })
      .code(201);
  } catch (error) {
    console.error("Create Article Error:", error);
    return h
      .response({
        statusCode: 500,
        status: "error",
        message: error.message || "Internal Server Error",
      })
      .code(500);
  }
};

// UPDATE ARTICLE
const updateArticle = async (request, h) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = request.params;
    const {
      title,
      //slug,
      content_html,
      province,
      city,
      categories = [],
      images = [],
      active,
    } = request.payload;

    let slug = undefined;
    if (title) {
      slug = await articleService.generateUniqueSlug(title);
    }

    // Find existing article
    const article = await Article.findByPk(id, { transaction });
    if (!article) {
      await transaction.rollback();
      return h
        .response({
          success: false,
          message: "Article not found",
        })
        .code(404);
    }

    // Check if slug already exists (exclude current article)
    // if (slug && slug !== article.slug) {
    //   const existingArticle = await Article.findOne({
    //     where: { slug, id: { [Op.ne]: id } },
    //     transaction,
    //   });
    //   if (existingArticle) {
    //     await transaction.rollback();
    //     return h
    //       .response({
    //         success: false,
    //         message: "Article with this slug already exists",
    //       })
    //       .code(409);
    //   }
    // }

    // Update article basic fields
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== undefined) updateData.slug = slug;
    if (content_html !== undefined) updateData.content_html = content_html;
    if (province !== undefined) updateData.province = province;
    if (city !== undefined) updateData.city = city;
    if (active !== undefined) updateData.active = active;

    await article.update(updateData, { transaction });

    // Update images if provided
    if (images && images.length >= 0) {
      // Delete existing images
      await ArticleImage.destroy({
        where: { article_id: id },
        transaction,
      });

      // Create new images if any
      if (images.length > 0) {
        const imageData = images.map((img) => ({
          article_id: id,
          image_url: img.image_url,
          alt_text: img.alt_text || "",
          caption: img.caption || "",
          order: img.order || 0,
        }));

        await ArticleImage.bulkCreate(imageData, { transaction });
      }
    }

    // Update categories if provided
    if (categories && categories.length >= 0) {
      // Validate categories exist
      if (categories.length > 0) {
        const validCategories = await Category.findAll({
          where: { id: categories },
          transaction,
        });

        if (validCategories.length !== categories.length) {
          await transaction.rollback();
          return h
            .response({
              success: false,
              message: "One or more categories not found",
            })
            .code(404);
        }
      }

      // Delete existing category mappings
      await ArticleCategoryMap.destroy({
        where: { article_id: id },
        transaction,
      });

      // Create new category mappings if any
      if (categories.length > 0) {
        const categoryMappings = categories.map((categoryId) => ({
          article_id: id,
          category_id: categoryId,
        }));

        await ArticleCategoryMap.bulkCreate(categoryMappings, { transaction });
      }
    }

    await transaction.commit();

    // Fetch updated article with all relations
    const updatedArticle = await Article.findByPk(id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email"],
        },
        {
          model: ArticleImage,
          as: "images",
          attributes: ["id", "image_url", "alt_text", "caption", "order"],
          order: [["order", "ASC"]],
        },
        {
          model: ArticleCategoryMap,
          as: "category_maps",
          include: [
            {
              model: Category,
              as: "category",
              attributes: ["id", "name", "slug", "color"],
            },
          ],
        },
      ],
    });

    return h
      .response({
        success: true,
        message: "Article updated successfully",
        data: updatedArticle,
      })
      .code(200);
  } catch (error) {
    await transaction.rollback();
    console.error("Error updating article:", error);
    return h
      .response({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
      .code(500);
  }
};

// DELETE ARTICLE (Soft Delete)
const softDeleteArticle = async (request, h) => {
  try {
    const { id } = request.params;

    const article = await Article.findByPk(id);
    if (!article) {
      return h
        .response({
          success: false,
          message: "Article not found",
        })
        .code(404);
    }

    // Soft delete by setting active to false
    await article.update({ active: false });

    return h
      .response({
        success: true,
        message: "Article deleted successfully (soft delete)",
      })
      .code(200);
  } catch (error) {
    console.error("Error soft deleting article:", error);
    return h
      .response({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
      .code(500);
  }
};

// DELETE ARTICLE (Hard Delete)
const hardDeleteArticle = async (request, h) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = request.params;

    const article = await Article.findByPk(id, { transaction });
    if (!article) {
      await transaction.rollback();
      return h
        .response({
          success: false,
          message: "Article not found",
        })
        .code(404);
    }

    // Delete related records first (due to foreign key constraints)

    // Delete article images
    await ArticleImage.destroy({
      where: { article_id: id },
      transaction,
    });

    // Delete article likes
    await ArticleLikes.destroy({
      where: { article_id: id },
      transaction,
    });

    // Delete article comments (including replies)
    const comments = await ArticleComments.findAll({
      where: { article_id: id },
      transaction,
    });

    for (const comment of comments) {
      // Delete replies first
      await ArticleComments.destroy({
        where: { parent_comment_id: comment.id },
        transaction,
      });
    }

    // Delete parent comments
    await ArticleComments.destroy({
      where: { article_id: id },
      transaction,
    });

    // Delete category mappings
    await ArticleCategoryMap.destroy({
      where: { article_id: id },
      transaction,
    });

    // Finally delete the article
    await article.destroy({ transaction });

    await transaction.commit();

    return h
      .response({
        success: true,
        message: "Article and all related data deleted successfully",
      })
      .code(200);
  } catch (error) {
    await transaction.rollback();
    console.error("Error hard deleting article:", error);
    return h
      .response({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
      .code(500);
  }
};

// RESTORE ARTICLE (for soft deleted articles)
const restoreArticle = async (request, h) => {
  try {
    const { id } = request.params;

    const article = await Article.findByPk(id);
    if (!article) {
      return h
        .response({
          success: false,
          message: "Article not found",
        })
        .code(404);
    }

    if (article.active) {
      return h
        .response({
          success: false,
          message: "Article is already active",
        })
        .code(400);
    }

    await article.update({ active: true });

    return h
      .response({
        success: true,
        message: "Article restored successfully",
      })
      .code(200);
  } catch (error) {
    console.error("Error restoring article:", error);
    return h
      .response({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
      .code(500);
  }
};

// ============= COMMENT CONTROLLERS =============

// GET all comments for an article
const getArticleComments = async (request, h) => {
  try {
    const { article_id } = request.params;
    const { page = 1, limit = 10 } = request.query;
    const offset = (page - 1) * limit;

    // Check if article exists
    const article = await Article.findByPk(article_id);
    if (!article) {
      return h
        .response({
          success: false,
          message: "Article not found",
        })
        .code(404);
    }

    // Get parent comments with replies
    const comments = await ArticleComments.findAndCountAll({
      where: {
        article_id,
        parent_comment_id: null,
        active: true,
      },
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
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true,
    });

    const transformedComments = comments.rows.map((comment) => ({
      id: comment.id,
      content: comment.comments,
      user: comment.user,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      replies_count: comment.replies ? comment.replies.length : 0,
      replies: comment.replies || [],
    }));

    return h
      .response({
        success: true,
        data: {
          comments: transformedComments,
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
    console.error("Error fetching comments:", error);
    return h
      .response({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
      .code(500);
  }
};

// CREATE comment
const createComment = async (request, h) => {
  try {
    const { article_id } = request.params;
    const { user_id, comments, parent_comment_id = null } = request.payload;

    // Check if article exists
    const article = await Article.findByPk(article_id);
    if (!article || !article.active) {
      return h
        .response({
          success: false,
          message: "Article not found or inactive",
        })
        .code(404);
    }

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

    // If this is a reply, check if parent comment exists
    if (parent_comment_id) {
      const parentComment = await ArticleComments.findOne({
        where: {
          id: parent_comment_id,
          article_id,
          active: true,
          parent_comment_id: null, // Only allow reply to parent comments, not nested replies
        },
      });

      if (!parentComment) {
        return h
          .response({
            success: false,
            message: "Parent comment not found or invalid",
          })
          .code(404);
      }
    }

    // Create comment
    const comment = await ArticleComments.create({
      article_id,
      user_id,
      comments,
      parent_comment_id,
      active: true,
    });

    // Fetch created comment with user data
    const createdComment = await ArticleComments.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    return h
      .response({
        success: true,
        message: parent_comment_id
          ? "Reply created successfully"
          : "Comment created successfully",
        data: {
          id: createdComment.id,
          content: createdComment.comments,
          user: createdComment.user,
          parent_comment_id: createdComment.parent_comment_id,
          created_at: createdComment.created_at,
          updated_at: createdComment.updated_at,
        },
      })
      .code(201);
  } catch (error) {
    console.error("Error creating comment:", error);
    return h
      .response({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
      .code(500);
  }
};

// UPDATE comment
const updateComment = async (request, h) => {
  try {
    const { comment_id } = request.params;
    const { user_id, comments } = request.payload;

    const comment = await ArticleComments.findByPk(comment_id);
    if (!comment || !comment.active) {
      return h
        .response({
          success: false,
          message: "Comment not found",
        })
        .code(404);
    }

    // Check if user owns the comment
    if (comment.user_id !== user_id) {
      return h
        .response({
          success: false,
          message: "Unauthorized to edit this comment",
        })
        .code(403);
    }

    await comment.update({ comments });

    // Fetch updated comment with user data
    const updatedComment = await ArticleComments.findByPk(comment_id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    return h
      .response({
        success: true,
        message: "Comment updated successfully",
        data: {
          id: updatedComment.id,
          content: updatedComment.comments,
          user: updatedComment.user,
          parent_comment_id: updatedComment.parent_comment_id,
          created_at: updatedComment.created_at,
          updated_at: updatedComment.updated_at,
        },
      })
      .code(200);
  } catch (error) {
    console.error("Error updating comment:", error);
    return h
      .response({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
      .code(500);
  }
};

// DELETE comment (soft delete)
const deleteComment = async (request, h) => {
  const transaction = await sequelize.transaction();

  try {
    const { comment_id } = request.params;
    const { user_id } = request.payload;

    const comment = await ArticleComments.findByPk(comment_id, { transaction });
    if (!comment || !comment.active) {
      await transaction.rollback();
      return h
        .response({
          success: false,
          message: "Comment not found",
        })
        .code(404);
    }

    // Check if user owns the comment or is admin (you can add admin check here)
    if (comment.user_id !== user_id) {
      await transaction.rollback();
      return h
        .response({
          success: false,
          message: "Unauthorized to delete this comment",
        })
        .code(403);
    }

    // Soft delete the comment
    await comment.update({ active: false }, { transaction });

    // If this is a parent comment, also soft delete all replies
    if (!comment.parent_comment_id) {
      await ArticleComments.update(
        { active: false },
        {
          where: { parent_comment_id: comment_id },
          transaction,
        }
      );
    }

    await transaction.commit();

    return h
      .response({
        success: true,
        message: "Comment deleted successfully",
      })
      .code(200);
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting comment:", error);
    return h
      .response({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
      .code(500);
  }
};

// ============= LIKE CONTROLLERS =============

// GET article likes
const getArticleLikes = async (request, h) => {
  try {
    const { article_id } = request.params;
    const { page = 1, limit = 20 } = request.query;
    const offset = (page - 1) * limit;

    // Check if article exists
    const article = await Article.findByPk(article_id);
    if (!article) {
      return h
        .response({
          success: false,
          message: "Article not found",
        })
        .code(404);
    }

    const likes = await ArticleLikes.findAndCountAll({
      where: { article_id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return h
      .response({
        success: true,
        data: {
          total_likes: likes.count,
          likes: likes.rows.map((like) => ({
            id: like.id,
            user: like.user,
            created_at: like.created_at,
          })),
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(likes.count / limit),
            totalItems: likes.count,
            itemsPerPage: parseInt(limit),
          },
        },
      })
      .code(200);
  } catch (error) {
    console.error("Error fetching likes:", error);
    return h
      .response({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
      .code(500);
  }
};

// TOGGLE like (like/unlike)
const toggleLike = async (request, h) => {
  try {
    const { article_id } = request.params;
    const { user_id } = request.payload;

    // Check if article exists
    const article = await Article.findByPk(article_id);
    if (!article || !article.active) {
      return h
        .response({
          success: false,
          message: "Article not found or inactive",
        })
        .code(404);
    }

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

    // Check if user already liked this article
    const existingLike = await ArticleLikes.findOne({
      where: { article_id, user_id },
    });

    if (existingLike) {
      // Unlike - remove the like
      await existingLike.destroy();

      // Get updated likes count
      const likesCount = await ArticleLikes.count({
        where: { article_id },
      });

      return h
        .response({
          success: true,
          message: "Article unliked successfully",
          data: {
            liked: false,
            total_likes: likesCount,
          },
        })
        .code(200);
    } else {
      // Like - create new like
      await ArticleLikes.create({
        article_id,
        user_id,
      });

      // Get updated likes count
      const likesCount = await ArticleLikes.count({
        where: { article_id },
      });

      return h
        .response({
          success: true,
          message: "Article liked successfully",
          data: {
            liked: true,
            total_likes: likesCount,
          },
        })
        .code(201);
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return h
      .response({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
      .code(500);
  }
};

// CHECK if user liked an article
const checkUserLike = async (request, h) => {
  try {
    const { article_id, user_id } = request.params;

    // Check if article exists
    const article = await Article.findByPk(article_id);
    if (!article) {
      return h
        .response({
          success: false,
          message: "Article not found",
        })
        .code(404);
    }

    // Check if user liked this article
    const like = await ArticleLikes.findOne({
      where: { article_id, user_id },
    });

    // Get total likes count
    const likesCount = await ArticleLikes.count({
      where: { article_id },
    });

    return h
      .response({
        success: true,
        data: {
          liked: !!like,
          total_likes: likesCount,
          like_id: like ? like.id : null,
        },
      })
      .code(200);
  } catch (error) {
    console.error("Error checking user like:", error);
    return h
      .response({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
      .code(500);
  }
};

// GET user's liked articles
const getUserLikedArticles = async (request, h) => {
  try {
    const { user_id } = request.params;
    const { page = 1, limit = 10 } = request.query;
    const offset = (page - 1) * limit;

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

    const likedArticles = await ArticleLikes.findAndCountAll({
      where: { user_id },
      include: [
        {
          model: Article,
          as: "article",
          where: { active: true },
          include: [
            {
              model: User,
              as: "author",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true,
    });

    const transformedArticles = likedArticles.rows.map((like) => ({
      like_id: like.id,
      liked_at: like.created_at,
      article: {
        id: like.article.id,
        title: like.article.title,
        slug: like.article.slug,
        description:
          like.article.content_html.replace(/<[^>]*>/g, "").substring(0, 150) +
          "...",
        author: like.article.author,
        created_at: like.article.created_at,
      },
    }));

    return h
      .response({
        success: true,
        data: {
          liked_articles: transformedArticles,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(likedArticles.count / limit),
            totalItems: likedArticles.count,
            itemsPerPage: parseInt(limit),
          },
        },
      })
      .code(200);
  } catch (error) {
    console.error("Error fetching user liked articles:", error);
    return h
      .response({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
      .code(500);
  }
};
// Helper function untuk mendapatkan range tahun dinamis
const getYearRange = async () => {
  const result = await Article.findOne({
    attributes: [
      [
        sequelize.fn(
          "MIN",
          sequelize.fn("EXTRACT", sequelize.literal("YEAR FROM created_at"))
        ),
        "minYear",
      ],
      [
        sequelize.fn(
          "MAX",
          sequelize.fn("EXTRACT", sequelize.literal("YEAR FROM created_at"))
        ),
        "maxYear",
      ],
    ],
    where: { active: true },
  });

  const currentYear = new Date().getFullYear();
  const minYear = result?.get("minYear") || currentYear;
  const maxYear = Math.max(result?.get("maxYear") || currentYear, currentYear);

  return { minYear, maxYear, currentYear };
};

const getDashboard = async (request, h) => {
  try {
    const { minYear, maxYear, currentYear } = await getYearRange();
    const previousYear = currentYear - 1;

    // Total Users
    const totalUsers = await User.count({
      where: { active: true },
    });

    // Get all active categories
    const categories = await Category.findAll({
      where: { active: true },
      order: [["name", "ASC"]],
    });

    // Get category statistics dinamis
    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        // Count articles for current year
        const currentCount = await ArticleCategoryMap.count({
          include: [
            {
              model: Article,
              as: "article",
              where: {
                active: true,
                created_at: {
                  [Op.gte]: new Date(`${currentYear}-01-01`),
                  [Op.lt]: new Date(`${currentYear + 1}-01-01`),
                },
              },
            },
          ],
          where: { category_id: category.id },
        });

        // Count articles for previous year
        const previousCount = await ArticleCategoryMap.count({
          include: [
            {
              model: Article,
              as: "article",
              where: {
                active: true,
                created_at: {
                  [Op.gte]: new Date(`${previousYear}-01-01`),
                  [Op.lt]: new Date(`${currentYear}-01-01`),
                },
              },
            },
          ],
          where: { category_id: category.id },
        });

        return {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          color: category.color,
          current: currentCount,
          previous: previousCount,
        };
      })
    );

    // Get total articles by year untuk timeline (dinamis berdasarkan data)
    const articlesByYear = [];
    for (let year = minYear; year <= maxYear; year++) {
      const count = await Article.count({
        where: {
          active: true,
          created_at: {
            [Op.gte]: new Date(`${year}-01-01`),
            [Op.lt]: new Date(`${year + 1}-01-01`),
          },
        },
      });
      articlesByYear.push({ year, count });
    }

    // Get additional stats
    const totalArticles = await Article.count({
      where: { active: true },
    });

    // Get most popular categories (top 5)
    const popularCategories = await ArticleCategoryMap.findAll({
      attributes: [
        "category_id",
        [
          sequelize.fn("COUNT", sequelize.col("ArticleCategoryMap.id")),
          "article_count",
        ],
      ],
      include: [
        {
          model: Category,
          as: "category",
          where: { active: true },
          attributes: ["id", "name", "slug", "color"],
        },
        {
          model: Article,
          as: "article",
          where: { active: true },
          attributes: [],
        },
      ],
      group: ["category_id", "category.id"],
      order: [[sequelize.literal("article_count"), "DESC"]],
      limit: 5,
    });

    // Recent articles count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentArticlesCount = await Article.count({
      where: {
        active: true,
        created_at: { [Op.gte]: thirtyDaysAgo },
      },
    });

    // Get growth statistics
    const growthStats = {
      thisYear: await Article.count({
        where: {
          active: true,
          created_at: {
            [Op.gte]: new Date(`${currentYear}-01-01`),
            [Op.lt]: new Date(`${currentYear + 1}-01-01`),
          },
        },
      }),
      lastYear: await Article.count({
        where: {
          active: true,
          created_at: {
            [Op.gte]: new Date(`${previousYear}-01-01`),
            [Op.lt]: new Date(`${currentYear}-01-01`),
          },
        },
      }),
    };

    // Calculate growth percentage
    const growthPercentage =
      growthStats.lastYear > 0
        ? Math.round(
            ((growthStats.thisYear - growthStats.lastYear) /
              growthStats.lastYear) *
              100
          )
        : 0;

    // Format response
    const response = {
      totalUsers: totalUsers,
      totalArticles: totalArticles,
      recentArticlesCount: recentArticlesCount,
      yearRange: { minYear, maxYear, currentYear },
      growthStats: {
        ...growthStats,
        growthPercentage,
      },
      categories: categoryStats,
      popularCategories: popularCategories.map((item) => ({
        id: item.category.id,
        name: item.category.name,
        slug: item.category.slug,
        color: item.category.color,
        articleCount: parseInt(item.get("article_count")),
      })),
      articleTimeline: articlesByYear,
    };

    return {
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return h
      .response({
        success: false,
        message: "Internal server error",
        error: error.message,
        timestamp: new Date().toISOString(),
      })
      .code(500);
  }
};
const getLikedArticlesByUser = async (request, h) => {
  try {
    const { userId } = request.params;

    const likedArticles = await ArticleLikes.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Article,
          as: "article",
          attributes: {
            include: [
              [
                Sequelize.literal(`(
                  SELECT COUNT(*)
                  FROM "Article_likes" AS "al"
                  WHERE "al"."article_id" = "article"."id"
                )`),
                "like_count",
              ],
              [
                Sequelize.literal(`(
                  SELECT COUNT(*)
                  FROM "Article_comments" AS "ac"
                  WHERE "ac"."article_id" = "article"."id"
                )`),
                "comment_count",
              ],
            ],
          },
        },
      ],
    });

    const response = {
      user_id: userId,
      liked_articles: likedArticles.map((like) => ({
        ...like.article.dataValues,
        liked_at: like.created_at,
      })),
    };

    return h.response(response).code(200);
  } catch (error) {
    console.error("Error getting liked articles:", error);
    return h.response({ error: "Failed to get liked articles" }).code(500);
  }
};
const getSavedArticlesByUser = async (request, h) => {
  try {
    const { userId } = request.params;

    const savedArticles = await ArticleSaved.findAll({
      where: { user_id: userId }, // Pastikan field name sesuai dengan DB schema
      include: [
        {
          model: Article,
          as: "article", // Pastikan alias sesuai dengan association
          attributes: {
            include: [
              [
                // Subquery: count all likes for this article
                Sequelize.literal(`(
                  SELECT COUNT(*)
                  FROM "Article_saved" AS "al"
                  WHERE "al"."article_id" = "article"."id"
                )`),
                "saved_count",
              ],
              [
                // Total comment count for each article
                Sequelize.literal(`(
                  SELECT COUNT(*)
                  FROM "Article_comments" AS "ac"
                  WHERE "ac"."article_id" = "article"."id"
                )`),
                "comment_count",
              ],
            ],
          },
        },
      ],
    });

    const response = {
      user_id: userId,
      saved_articles: savedArticles.map((saved) => ({
        ...saved.article.dataValues,
        saved_at: saved.created_at,
      })),
    };

    return h.response(response).code(200);
  } catch (error) {
    console.error("Error getting saved articles:", error);
    return h.response({ error: "Failed to get saved articles" }).code(500);
  }
};
const getArticlesByIds = async (request, h) => {
  try {
    console.log("Request method:", request.method); // Debug log
    console.log("Request path:", request.path); // Debug log
    console.log("Request payload:", request.payload); // Debug log
    console.log("Request params:", request.params); // Debug log

    // Ambil IDs dari request body (untuk POST)
    let ids;

    // Pastikan mengambil dari payload, bukan dari parameter path
    if (request.payload && request.payload.ids) {
      ids = request.payload.ids;
    } else {
      return h
        .response({
          success: false,
          message: "Request payload is missing or invalid",
        })
        .code(400);
    }

    console.log("Extracted IDs:", ids); // Debug log

    // Validasi IDs
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return h
        .response({
          success: false,
          message: "IDs parameter is required and must be an array",
        })
        .code(400);
    }

    // Validasi format UUID untuk setiap ID
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const invalidIds = ids.filter((id) => !uuidRegex.test(id));

    if (invalidIds.length > 0) {
      return h
        .response({
          success: false,
          message: "Invalid UUID format detected",
          invalid_ids: invalidIds,
        })
        .code(400);
    }

    // Pagination parameters
    const page = parseInt(request.query?.page) || 1;
    const limit = parseInt(request.query?.limit) || 10;
    const offset = (page - 1) * limit;

    console.log("Validated IDs:", ids); // Debug log
    console.log("Pagination:", { page, limit, offset }); // Debug log

    // Query articles berdasarkan IDs dengan Op.in
    const { Op } = require("sequelize");

    const articles = await Article.findAndCountAll({
      where: {
        id: {
          [Op.in]: ids, // Menggunakan Op.in untuk array IDs
        },
        active: true,
      },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email"],
        },
        {
          model: ArticleImage,
          as: "images",
          attributes: ["id", "image_url"],
        },
        {
          model: ArticleLikes,
          as: "likes",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: ArticleComments,
          as: "comments",
          where: { parent_comment_id: null },
          required: false,
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name"],
            },
            {
              model: ArticleComments,
              as: "replies",
              include: [
                {
                  model: User,
                  as: "user",
                  attributes: ["id", "name"],
                },
              ],
            },
          ],
        },
        {
          model: ArticleCategoryMap,
          as: "category_maps",
          include: [
            {
              model: Category,
              as: "category",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      limit: limit,
      offset: offset,
      order: [["created_at", "DESC"]], // Urutkan berdasarkan tanggal terbaru
    });

    console.log("Found articles count:", articles.count); // Debug log

    if (!articles.rows || articles.rows.length === 0) {
      return h
        .response({
          success: false,
          message: "No articles found for the provided IDs",
          meta: {
            requested_ids: ids,
            found_count: 0,
            not_found_ids: ids,
          },
        })
        .code(404);
    }

    const transformedArticles = articles.rows.map((article) => {
      const primaryCategory =
        article.category_maps?.[0]?.category?.name || "Uncategorized";
      const images = article.images.map((img) => img.image_url);
      const mainImage = images.length > 0 ? images[0] : "/images/default.png";

      return {
        id: article.id,
        category: primaryCategory,
        title: article.title,
        slug: article.slug,
        description:
          article.content_html.replace(/<[^>]*>/g, "").substring(0, 150) +
          "...",
        content_html: article.content_html,
        province: article.province,
        city: article.city,
        active: article.active,
        thumbnail_url: mainImage,
        images: images,
        createdAt: article.created_at,
        updatedAt: article.updated_at,
        likes: article.likes.length,
        comments: article.comments.length,
        author: article.author,
      };
    });

    return h
      .response({
        success: true,
        data: {
          articles: transformedArticles,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(articles.count / limit),
            totalItems: articles.count,
            itemsPerPage: parseInt(limit),
          },
        },
      })
      .code(200);
  } catch (error) {
    console.error("Error fetching articles by IDs:", error);
    console.error("Error stack:", error.stack); // Debug log
    return h
      .response({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
      .code(500);
  }
};
module.exports = {
  getArticles,
  getArticleById,
  getArticleBySlug,
  createArticle,
  updateArticle,
  softDeleteArticle,
  hardDeleteArticle,
  restoreArticle,
  // Comment controllers
  getArticleComments,
  createComment,
  updateComment,
  deleteComment,
  // Like controllers
  getArticleLikes,
  toggleLike,
  checkUserLike,
  getUserLikedArticles,
  // Dashboard
  getDashboard,
  getLikedArticlesByUser,
  getSavedArticlesByUser,
  getArticlesByIds,
};
