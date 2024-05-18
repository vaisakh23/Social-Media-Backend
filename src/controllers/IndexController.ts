import { NextFunction, Request, Response } from "express";
import Controller from "../decorators/controller";
import { Get } from "../decorators/methods";

@Controller("")
class IndexController {
  @Get("")
  public index(req: Request, res: Response, next: NextFunction) {
    return res.sendStatus(200);
  }
}
export default IndexController;
