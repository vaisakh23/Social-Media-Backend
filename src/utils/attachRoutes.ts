import express from "express";
import { BaseMetadata } from "../decorators/controller";
import { RouterMetadata } from "../decorators/methods";
import { MetadataKeys } from "./MetadataKeys ";

export const attachRoutes = (controllers: any[]) => {
  const router = express.Router();

  controllers.forEach((controllerClass) => {
    const controllerInstance = new controllerClass();

    const basePath: BaseMetadata = Reflect.getMetadata(
      MetadataKeys.BASE_PATH,
      controllerClass
    );
    const routers: RouterMetadata[] = Reflect.getMetadata(
      MetadataKeys.ROUTERS,
      controllerClass
    );

    const exRouter = express.Router();

    routers.forEach(({ method, path, middlewares, handlerName }) => {
      middlewares =
        basePath.middlewares?.concat(middlewares || []) || middlewares;
      exRouter[method](
        path,
        middlewares ? [...middlewares] : [],
        controllerInstance[String(handlerName)].bind(controllerInstance)
      );
    });

    router.use(basePath.basePath, exRouter);
  });
  return router;
};
