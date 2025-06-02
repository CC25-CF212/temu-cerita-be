const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");

const authRoutes = require("./src/routes/auth");
const articleRoute = require("./src/routes/articles");
const authMiddleware = require("./src/middleware/authMiddleware");
const sequelize = require("./src/models/index");
require("dotenv").config();

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
  });

  await server.register(Jwt);
  // server.auth.strategy("jwt", "jwt", authMiddleware);
  // server.auth.default("jwt");

  server.route(authRoutes);
  server.route(articleRoute);

  await sequelize.sync();

  return server;
};

// Export init untuk dipakai di tempat lain
module.exports = { init };

// Jika file ini dijalankan langsung, baru start server-nya
if (require.main === module) {
  init()
    .then((server) => {
      server.start();
      console.log("Server running on %s", server.info.uri);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
