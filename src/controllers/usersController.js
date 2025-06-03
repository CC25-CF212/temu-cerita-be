"use strict";
const Joi = require("joi");
const { User } = require("../models/relation");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");

// Validasi input
const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().optional().allow(null),
  google_id: Joi.string().optional().allow(null),
  profile_picture: Joi.string().uri().optional().allow(null),
  active: Joi.boolean().optional(),
  admin: Joi.boolean().optional(),
});

// Create user
const createUser = async (request, h) => {
  try {
    const { error, value } = userSchema.validate(request.payload);
    if (error) {
      return h
        .response({
          statusCode: 400,
          error: error.details[0].message,
          data: null,
        })
        .code(400);
    }

    let hashedPassword = null;
    if (value.password) {
      hashedPassword = await bcrypt.hash(value.password, 10);
    }

    const user = await User.create({
      ...value,
      password: hashedPassword,
      id: uuidv4(),
    });
    user.password = "---";

    return h
      .response({
        statusCode: 201,
        error: null,
        data: user,
      })
      .code(201);
  } catch (err) {
    return h
      .response({
        statusCode: 500,
        error: err.message,
        data: null,
      })
      .code(500);
  }
};

// Get all users
const getAllUsers = async (_request, h) => {
  try {
    const users = await User.findAll();
    return h
      .response({
        statusCode: 200,
        error: null,
        data: users,
      })
      .code(200);
  } catch (err) {
    return h
      .response({
        statusCode: 500,
        error: err.message,
        data: null,
      })
      .code(500);
  }
};

// Get user by ID
const getUserById = async (request, h) => {
  try {
    const user = await User.findByPk(request.params.id);
    if (!user) {
      return h
        .response({
          statusCode: 404,
          error: "User not found",
          data: null,
        })
        .code(404);
    }

    return h
      .response({
        statusCode: 200,
        error: null,
        data: user,
      })
      .code(200);
  } catch (err) {
    return h
      .response({
        statusCode: 500,
        error: err.message,
        data: null,
      })
      .code(500);
  }
};

// Update user
const updateUser = async (request, h) => {
  try {
    const { error, value } = userSchema.validate(request.payload);
    if (error) {
      return h
        .response({
          statusCode: 400,
          error: error.details[0].message,
          data: null,
        })
        .code(400);
    }

    const user = await User.findByPk(request.params.id);
    if (!user) {
      return h
        .response({
          statusCode: 404,
          error: "User not found",
          data: null,
        })
        .code(404);
    }

    await user.update(value);

    return h
      .response({
        statusCode: 200,
        error: null,
        data: user,
      })
      .code(200);
  } catch (err) {
    return h
      .response({
        statusCode: 500,
        error: err.message,
        data: null,
      })
      .code(500);
  }
};

// Delete user
const deleteUser = async (request, h) => {
  try {
    const user = await User.findByPk(request.params.id);
    if (!user) {
      return h
        .response({
          statusCode: 404,
          error: "User not found",
          data: null,
        })
        .code(404);
    }

    await user.destroy();
    return h
      .response({
        statusCode: 200,
        error: null,
        data: { message: "User deleted successfully" },
      })
      .code(200);
  } catch (err) {
    return h
      .response({
        statusCode: 500,
        error: err.message,
        data: null,
      })
      .code(500);
  }
};

// Toggle aktivasi user
const toggleUserActivation = async (request, h) => {
  try {
    const user = await User.findByPk(request.params.id);
    if (!user) {
      return h
        .response({
          statusCode: 404,
          error: "User not found",
          data: null,
        })
        .code(404);
    }

    user.active = !user.active;
    await user.save();

    return h
      .response({
        statusCode: 200,
        error: null,
        data: {
          message: `User ${user.active ? "activated" : "deactivated"}`,
          user,
        },
      })
      .code(200);
  } catch (err) {
    return h
      .response({
        statusCode: 500,
        error: err.message,
        data: null,
      })
      .code(500);
  }
};

// Set admin status
const setAdminStatus = async (request, h) => {
  try {
    const { isAdmin } = request.payload;
    if (typeof isAdmin !== "boolean") {
      return h
        .response({
          statusCode: 400,
          error: "isAdmin must be a boolean",
          data: null,
        })
        .code(400);
    }

    const user = await User.findByPk(request.params.id);
    if (!user) {
      return h
        .response({
          statusCode: 404,
          error: "User not found",
          data: null,
        })
        .code(404);
    }

    user.admin = isAdmin;
    await user.save();

    return h
      .response({
        statusCode: 200,
        error: null,
        data: {
          message: `User admin status set to ${isAdmin}`,
          user,
        },
      })
      .code(200);
  } catch (err) {
    return h
      .response({
        statusCode: 500,
        error: err.message,
        data: null,
      })
      .code(500);
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserActivation,
  setAdminStatus,
};
