const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/users");
require("dotenv").config();

const registerHandler = async (request, h) => {
  const { name, email, password, google_id, image } = request.payload;
  const isLoginGoogle = !!google_id;
  // Cari user berdasarkan email
  const existingUser = await User.findOne({ where: { email } });

  if (isLoginGoogle) {
    if (existingUser) {
      // Update data user jika sudah terdaftar
      await existingUser.update({
        name,
        google_id,
        profile_picture: image || existingUser.profile_picture,
      });

      // Generate JWT
      const token = jwt.sign(
        {
          id: existingUser.id,
          email: existingUser.email,
          admin: existingUser.admin,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return h
        .response({
          statusCode: "200",
          status: "success",
          message: "User login via Google successful",
          user: {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            admin: existingUser.admin,
            token: token,
          },
        })
        .code(200);
    } else {
      // Buat user baru untuk login Google
      const user = await User.create({
        name,
        email,
        password: "", // kosongkan password jika login via Google
        google_id,
        profile_picture: image || null, // opsional
      });

      // Generate JWT
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          admin: user.admin,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return h
        .response({
          statusCode: "201",
          status: "success",
          message: "User registered via Google successfully",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            admin: user.admin,
            token: token,
          },
        })
        .code(200);
    }
  } else {
    // Proses registrasi biasa
    if (existingUser) {
      return h
        .response({
          statusCode: "409",
          status: "fail",
          message: "Email already registered",
        })
        .code(200);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        admin: user.admin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return h
      .response({
        statusCode: "201",
        status: "success",
        message: "User registered successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          admin: user.admin,
          token: token,
        },
      })
      .code(200);
  }
};

const registerHandlerOld = async (request, h) => {
  const { name, email, password } = request.payload;

  // Cek apakah email sudah terdaftar

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return h
      .response({
        statusCode: "409",
        status: "fail",
        message: "Email already registered",
      })
      .code(409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Buat user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  // Generate JWT
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      admin: user.admin,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return h
    .response({
      statusCode: "201",
      status: "success",
      message: "User registered successfully",
      token: token,
    })
    .code(201);
};

const loginHandler = async (request, h) => {
  const { email, password } = request.payload;

  // Cek apakah user ada
  const user = await User.findOne({ where: { email } });
  if (!user || !user.active) {
    return h
      .response({
        statusCode: "401",
        status: "fail",
        message: "Invalid email or account inactive",
      })
      .code(401);
  }

  // Cek password
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return h
      .response({
        statusCode: "401",
        status: "fail",
        message: "Incorrect password",
      })
      .code(401);
  }

  // Buat token
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      admin: user.admin,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return h
    .response({
      statusCode: "200",
      status: "success",
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        admin: user.admin,
        token: token,
      },
    })
    .code(200);
};

module.exports = { registerHandler, loginHandler };
