import { body, param } from "express-validator";
import { validate } from "../utils/validate";
import User from "../models/User";

class UserValidation {
  fullName() {
    return body("fullname")
      .notEmpty()
      .withMessage("Fullname is required.")
      .bail()
      .isString()
      .withMessage("Fullname must be a string.")
      .bail()
      .trim()
      .isLength({ max: 25 })
      .withMessage("Fullname must be at most 25 characters long.");
  }

  userName() {
    return body("username")
      .notEmpty()
      .withMessage("Username is required.")
      .bail()
      .isString()
      .withMessage("Username must be a string.")
      .bail()
      .trim()
      .isLength({ max: 25 })
      .withMessage("Username must be at most 25 characters long.")
      .bail()
      .custom(async (value) => {
        const existingUser = await User.findOne({ username: value });
        if (existingUser) {
          throw new Error("Username is already taken.");
        }
      });
  }

  email() {
    return body("email")
      .notEmpty()
      .withMessage("Email is required.")
      .bail()
      .isEmail()
      .withMessage("Invalid email format.")
      .bail()
      .normalizeEmail()
      .custom(async (value) => {
        const existingUser = await User.findOne({ email: value });
        if (existingUser) {
          throw new Error("Email is already registered.");
        }
      });
  }

  password() {
    return body("password")
      .notEmpty()
      .withMessage("Password is required.")
      .bail()
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one symbol."
      );
  }

  avatar() {
    return body("avatar")
      .optional()
      .isURL()
      .withMessage("Avatar must be a valid URL.");
  }

  gender() {
    return body("gender")
      .isString()
      .withMessage("Gender must be a string.")
      .bail()
      .isIn(["male", "female", "other"])
      .withMessage("Invalid gender value.");
  }

  mobile() {
    return body("mobile")
      .optional()
      .isLength({ max: 15 })
      .custom((value: string) => {
        if (!/^\+[1-9]\d{1,14}$/.test(value)) {
          return Promise.reject("Invalid contact number");
        }
        return Promise.resolve();
      })
      .withMessage("Mobile must be a valid phone number.");
  }

  refreshToken() {
    return body("refreshToken")
      .notEmpty()
      .withMessage("Refresh token is required.");
  }

  id() {
    return param("id").isMongoId().withMessage("Invalid user ID format.");
  }

  createRules() {
    return validate([
      this.fullName(),
      this.userName(),
      this.email(),
      this.password(),
      this.avatar(),
      this.gender(),
      this.mobile(),
    ]);
  }

  updateRules() {
    return validate([
      this.id(),
      this.fullName().optional(),
      this.userName().optional(),
      this.email().optional(),
      this.password().optional(),
      this.avatar(),
      this.gender().optional(),
      this.mobile(),
    ]);
  }

  loginRules() {
    return validate([this.email(), this.password()]);
  }

  refreshTokenRules() {
    return validate([this.refreshToken()]);
  }

  IdRules() {
    return validate([this.id()]);
  }
}

export default UserValidation;
