import { Router } from "express";
import userController from "../controller/user.controller";
import isAuth from "./../middleware";
const routes = Router();

routes.post("/login", userController.login)
routes.get("/", isAuth.isAuthenticated, userController.getCurrentUser)
routes.post("/registrasi", userController.register)

export default routes;