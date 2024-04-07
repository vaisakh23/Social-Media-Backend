import { Application } from "express";
import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import { ACCESS_TOKEN_SECRET } from "../configs";
import { authenticateCredential } from "./auth/authenticateCredential";
import { authenticateToken } from "./auth/authenticateToken";

export const initialisePassport = (app: Application) => {
  app.use(passport.initialize());
  passport.use(
    new LocalStrategy({ usernameField: "email" }, authenticateCredential)
  );
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: ACCESS_TOKEN_SECRET,
      },
      authenticateToken
    )
  );
};
