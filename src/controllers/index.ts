import AuthController from "./AuthController";
import CommentController from "./CommentController";
import ConversationController from "./ConversationController";
import IndexController from "./IndexController";
import PostController from "./PostController";
import UserController from "./UserController";

export const controllers = [
  IndexController,
  UserController,
  AuthController,
  PostController,
  CommentController,
  ConversationController,
];
