// services/articleService.js

const { Op } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const slugify = require("slugify");
const { Category } = require("../models/category");
const { ArticleCategoryMap } = require("../models/article_category_map");
const { Article } = require("../models/articles");
const { ArticleImage } = require("../models/article_images");
const { User } = require("../models/users");

class ArticleService {
  // Generate unique slug
  async generateUniqueSlug(title) {
    let baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await Article.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  // Create article with images
  async createArticle(articleData) {
    const {
      title,
      content_html,
      province,
      city,
      active,
      category,
      images,
      userId,
    } = articleData;

    const slug = await this.generateUniqueSlug(title);

    let existingCategory = await Category.findOne({
      where: { category: category[0].trim().toLowerCase() },
    });

    if (!existingCategory) {
      existingCategory = await Category.create({
        id: uuidv4(),
        category: category[0].trim().toLowerCase(),
      });
    }

    // Create article
    const article = await Article.create({
      title,
      slug,
      content_html,
      province,
      city,
      active: active !== undefined ? active : true,
      user_id: userId,
      thumbnail_url: images && images.length > 0 ? images[0] : null,
    });

    await ArticleCategoryMap.create({
      id: uuidv4(),
      article_id: article.id,
      article_category_id: existingCategory.id,
    });
    if (images && Array.isArray(images) && images.length > 0) {
      const imagePromises = images.map((imageUrl) =>
        ArticleImage.create({
          image_url: imageUrl,
          article_id: article.id,
        })
      );

      await Promise.all(imagePromises);
    }
    return await this.getArticleById(article.id);
  }

  // Get article by ID with images
  async getArticleById(id) {
    const article = await Article.findByPk(id, {
      include: [
        {
          model: ArticleImage,
          as: "images",
          attributes: ["id", "image_url"],
        },
        // {
        //   model: User,
        //   as: "author",
        //   attributes: ["id", "name", "email"],
        // },
      ],
    });

    return article;
  }

  // Get all articles with pagination
  async getAllArticles(options = {}) {
    const {
      page = 1,
      limit = 10,
      province,
      city,
      active = true,
      search,
      userId,
    } = options;

    const offset = (page - 1) * limit;
    const where = {};

    if (active !== undefined) where.active = active;
    if (province) where.province = province;
    if (city) where.city = city;
    if (userId) where.user_id = userId;

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content_html: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Article.findAndCountAll({
      where,
      include: [
        {
          model: ArticleImage,
          as: "images",
          attributes: ["id", "image_url"],
        },
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return {
      data: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  // Update article
  async updateArticle(id, updateData, userId) {
    const article = await Article.findByPk(id);

    if (!article) {
      throw new Error("Article not found");
    }

    // Check if user owns the article
    if (article.user_id !== userId) {
      throw new Error("Unauthorized to update this article");
    }

    const { title, content_html, province, city, active, images } = updateData;

    // Update slug if title changed
    let slug = article.slug;
    if (title && title !== article.title) {
      slug = await this.generateUniqueSlug(title);
    }

    // Update article
    await article.update({
      title: title || article.title,
      slug,
      content_html: content_html || article.content_html,
      province: province !== undefined ? province : article.province,
      city: city !== undefined ? city : article.city,
      active: active !== undefined ? active : article.active,
      thumbnail_url:
        images && images.length > 0 ? images[0] : article.thumbnail_url,
    });

    // Update images if provided
    if (images && Array.isArray(images)) {
      // Delete existing images
      await ArticleImage.destroy({ where: { article_id: id } });

      // Create new images
      if (images.length > 0) {
        const imagePromises = images.map((imageUrl) =>
          ArticleImage.create({
            image_url: imageUrl,
            article_id: id,
          })
        );

        await Promise.all(imagePromises);
      }
    }

    return await this.getArticleById(id);
  }

  // Delete article
  async deleteArticle(id, userId) {
    const article = await Article.findByPk(id);

    if (!article) {
      throw new Error("Article not found");
    }

    // Check if user owns the article
    if (article.user_id !== userId) {
      throw new Error("Unauthorized to delete this article");
    }

    await article.destroy();
    return { message: "Article deleted successfully" };
  }

  // Get article by slug
  async getArticleBySlug(slug) {
    const article = await Article.findOne({
      where: { slug },
      include: [
        {
          model: ArticleImage,
          as: "images",
          attributes: ["id", "image_url"],
        },
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    return article;
  }
}

module.exports = new ArticleService();
