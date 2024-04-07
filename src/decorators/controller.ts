import { MetadataKeys } from "../utils/MetadataKeys ";

export type BaseMetadata = {
  basePath: string;
  middlewares?: ((...args: any[]) => any)[];
};

const Controller = (
  basePath: string,
  middlewares?: ((...args: any[]) => any)[]
): ClassDecorator => {
  return (target) => {
    const baseMetadata: BaseMetadata = { basePath, middlewares };
    Reflect.defineMetadata(MetadataKeys.BASE_PATH, baseMetadata, target);
  };
};
export default Controller;
