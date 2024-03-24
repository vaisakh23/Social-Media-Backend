import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import { connect } from "mongoose";
import "reflect-metadata";
import { DB_URL } from "./configs";
import { controllers } from "./controllers";
import errorMiddleware from "./middlewares/errorMiddleware";
import { attachRoutes } from "./utils/attachRoutes";
import logger from "./utils/logger";

class App {
  public app: Express;

  constructor() {
    this.app = express();
    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  public listen(port: number) {
    this.app.listen(port, () => {
      logger.info(`=================================`);
      logger.info(`🚀 App listening on the port ${port}  `);
      logger.info(`=================================`);
    });
  }

  private async connectToDatabase() {
    try {
      await connect(DB_URL);
      logger.info(`=================================`);
      logger.info("Database connected successfully");
      logger.info(`=================================`);
    } catch (error) {
      logger.error(`Database connection error: ${error}`);
    }
  }

  private initializeMiddlewares() {
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes() {
    this.app.use(attachRoutes(controllers));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }
}

export default App;
