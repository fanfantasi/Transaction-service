import express from "express";
var bodyParser = require('body-parser');
const cors=require("cors");
import {
    userRoutes,
    walletRoutes
} from "./routes";
import { requestLogger } from "./request-logger.middleware";
import { requestIdMiddleware } from "./request-id.middleware";

const path = __dirname;

class App {
    public server;

    constructor() {
        this.server = express()

        this.middlewares();
        this.routes();
    }
    

    middlewares(){
        this.server.use(requestIdMiddleware);
        this.server.use(requestLogger);
        this.server.use(express.json());
    }

    routes(){
        this.server.use(cors());

        this.server.use(bodyParser.urlencoded({
            extended: true
        }));

        this.server.use(function (req, res, next) {
            next();
        });

        this.server.use(express.static(path));
        
        this.server.get('/', function (req, res) {
            res.sendFile(path + "/index.html");
        });
        
        this.server.use('/v1/user', userRoutes);
        this.server.use('/v1/wallet', walletRoutes);
    }
}

export default new App().server;