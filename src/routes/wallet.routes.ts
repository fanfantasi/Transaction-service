import { Router } from "express";
import walletController from "../controller/wallet.controller";
import isAuth from "./../middleware";
const routes = Router();

routes.get("/", isAuth.isAuthenticated, walletController.getWalletByUserId)
routes.post("/deposit", isAuth.isAuthenticated, walletController.depositWallet)
routes.post("/spend", isAuth.isAuthenticated, walletController.spendWallet)
routes.post("/withdraw", isAuth.isAuthenticated, walletController.withdrawWallet)
export default routes;