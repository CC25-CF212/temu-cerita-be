const Joi = require("joi");
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserActivation,
  setAdminStatus,
} = require("../controllers/usersController");

const usersRoutes = [
  {
    method: "GET",
    path: "/users",
    handler: getAllUsers,
  },
  {
    method: "POST",
    path: "/users",
    handler: createUser,
    options: {
      validate: {
        payload: Joi.object({
          name: Joi.string().required(),
          email: Joi.string().email().required(),
          password: Joi.string().optional().allow(null),
          google_id: Joi.string().optional().allow(null),
          profile_picture: Joi.string().uri().optional().allow(null),
          active: Joi.boolean().optional(),
          admin: Joi.boolean().optional(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/users/{id}",
    handler: getUserById,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().uuid().required(),
        }),
      },
    },
  },
  {
    method: "PUT",
    path: "/users/{id}",
    handler: updateUser,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().uuid().required(),
        }),
        payload: Joi.object({
          name: Joi.string().required(),
          email: Joi.string().email().required(),
          password: Joi.string().optional().allow(null),
          google_id: Joi.string().optional().allow(null),
          profile_picture: Joi.string().uri().optional().allow(null),
          active: Joi.boolean().optional(),
          admin: Joi.boolean().optional(),
        }),
      },
    },
  },
  {
    method: "DELETE",
    path: "/users/{id}",
    handler: deleteUser,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().uuid().required(),
        }),
      },
    },
  },
  {
    method: "PATCH",
    path: "/users/{id}/activate",
    handler: toggleUserActivation,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().uuid().required(),
        }),
      },
    },
  },
  {
    method: "PATCH",
    path: "/users/{id}/admin",
    handler: setAdminStatus,
    options: {
      validate: {
        params: Joi.object({
          id: Joi.string().uuid().required(),
        }),
        payload: Joi.object({
          isAdmin: Joi.boolean().required(),
        }),
      },
    },
  },
];

module.exports = usersRoutes;
