import { MetadataKeys } from "../utils/MetadataKeys ";

export enum Methods {
  GET = "get",
  POST = "post",
  PUT = "put",
  DELETE = "delete",
}

export type RouterMetadata = {
  method: Methods;
  path: string;
  middlewares?: ((...args: any[]) => any)[];
  handlerName: string | symbol;
};
const methodDecoratorFactory = (method: Methods) => {
  return (
    path: string,
    middlewares?: ((...args: any[]) => any)[]
  ): MethodDecorator => {
    return (target, propertyKey) => {
      const controllerClass = target.constructor;
      const routers: RouterMetadata[] = Reflect.hasMetadata(
        MetadataKeys.ROUTERS,
        controllerClass
      )
        ? Reflect.getMetadata(MetadataKeys.ROUTERS, controllerClass)
        : [];
      routers.push({
        method,
        path,
        middlewares,
        handlerName: propertyKey,
      });
      Reflect.defineMetadata(MetadataKeys.ROUTERS, routers, controllerClass);
    };
  };
};

export const Get = methodDecoratorFactory(Methods.GET);
export const Post = methodDecoratorFactory(Methods.POST);
export const Put = methodDecoratorFactory(Methods.PUT);
export const Delete = methodDecoratorFactory(Methods.DELETE);
