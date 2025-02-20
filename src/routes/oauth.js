import express from "express";

import AuthMiddleware from "#middlewares/AuthMiddleware.js";
import OauthMiddleware from "#middlewares/OauthMiddleware.js";

import OauthController from "#controllers/OauthController.js";

const routes = express.Router();

routes.use(OauthMiddleware);

routes.post("/auth/login", OauthController.login);

routes.post("/auth/logout", AuthMiddleware, OauthController.logout);

routes.get("/auth/verify", AuthMiddleware, OauthController.verify);

export default routes;
