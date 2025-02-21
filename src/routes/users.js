import express from "express";

import AuthMiddleware from "#middlewares/AuthMiddleware.js";
import RequireAdminMiddleware from "#middlewares/RequireAdminMiddleware.js";

import UserController from "#controllers/UserController.js";
import RequireSelfMiddleware from "#middlewares/RequireSelfMiddleware.js";

const routes = express.Router();

routes.use("/users", AuthMiddleware);

routes.post("/users", UserController.add, RequireAdminMiddleware);

routes.get("/users/:id", UserController.read, RequireSelfMiddleware);

routes.get("/users/getToMatch", UserController.getToMatch, RequireAdminMiddleware);

routes.put("/users/:id", UserController.update, RequireSelfMiddleware);

routes.delete("/users/:id", UserController.del, RequireAdminMiddleware);

export default routes;
