import { compare as bcryptCompare, hash as bcryptHash } from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import {
	ACCESS_TOKEN_SECRET,
	ACCESS_TOKEN_TIMOUT,
	REFRESH_TOKEN_SECRET,
	REFRESH_TOKEN_TIMOUT,
} from "../configs";
import HttpException from "../exceptions/HttpException";
import UnauthorizedException from "../exceptions/UnauthorizedException";
import User from "../models/User";
import UserToken from "../models/UserToken";
import UserType from "../types/UserType";
import { verifyRefreshToken } from "../utils/verifyRefreshToken";

class AuthService {
	/**
	 * Secure Refresh Token Rotation System
	 * ---------------------------------------------------
	 * 🔐 Concept:
	 * Each device that logs in creates a "session" stored in DB (UserToken).
	 * A session is identified by a stable `jti` (per device), while the
	 * refresh token itself is rotated (replaced) every time it is used.
	 *
	 * Only the latest (hashed) refresh token is stored for that device.
	 * If a previous token is ever reused, the session is revoked and the
	 * user must log in again — protecting against stolen token attacks.
	 *
	 * 🧩 Key Security Features Implemented:
	 * - Multi-device login: one session per device (via unique jti)
	 * - Token rotation: new refresh token issued every refresh request
	 * - Token reuse detection: hash mismatch = token stolen → revoke
	 * - Revocation flag: allows logout on specific device only
	 * - Metadata tracking: device info, IP, user-agent for monitoring
	 *
	 * 🔁 Session Lifecycle:
	 * - Login → Create session for device → Store hashed refresh token
	 * - Refresh request → Validate session + rotate token
	 * - Logout or breach → Mark session revoked → block further token usage
	 *
	 * This approach ensures strong protection against replay attacks while
	 * supporting a smooth user experience across multiple devices.
	 */

	private user = User;
	private userToken = UserToken;

	public async signup(userData: UserType, reqInfo: any) {
		const findUser: UserType | null = await this.user.findOne({
			email: userData.email,
		});
		if (findUser)
			throw new HttpException(
				`This email ${userData.email} already exists`,
				409
			);

		const hashedPassword = await bcryptHash(userData.password, 10);
		const createUserData = await this.user.create({
			...userData,
			password: hashedPassword,
		});
		const userObject = createUserData.toObject();
		const tokens = await this.generateTokens(userObject, reqInfo);
		return { user: userObject, ...tokens };
	}

	public async login(user: UserType, reqInfo: any) {
		const tokens = await this.generateTokens(user, reqInfo);
		return { user, ...tokens };
	}

	/**
	 * Refresh Token Rotation Flow
	 * -------------------------------------
	 * Validates and rotates refresh tokens safely while supporting:
	 * - Multi-device login (1 refresh token per device)
	 * - Token theft/reuse detection
	 * - Session revocation on breach or logout
	 */
	public async refreshToken(refreshToken: string) {
		// 1️⃣ Decode token ignoring expiration
		let payload: any;

		try {
			payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, {
				ignoreExpiration: true,
			});
		} catch (error) {
			throw new UnauthorizedException("Invalid refresh token");
		}

		const { _id: userId, jti, exp } = payload;
		if (!jti) throw new UnauthorizedException("Invalid refresh token");

		// 2️⃣ Find refresh token session in DB
		const tokenDoc = await this.userToken.findOne({ user: userId, jti });
		if (!tokenDoc) {
			// Not gonna happen if happens
			// TODO: Log a "security breach alert" for admin monitoring
			throw new UnauthorizedException("Invalid refresh token");
		}

		// 3️⃣ Ensure the session is still active
		if (tokenDoc.revoked) {
			throw new UnauthorizedException("Session removed - Login again");
		}

		// 4️⃣ Detect token reuse by hash mismatch
		const isMatch = await bcryptCompare(refreshToken, tokenDoc.tokenHash);
		if (!isMatch) {
			tokenDoc.revoked = true;
			await tokenDoc.save();
			throw new UnauthorizedException("Session removed - Login again");
		}

		// 5️⃣ Verify JWT-expired token manually
		if (exp && Date.now() >= exp * 1000) {
			tokenDoc.revoked = true;
			await tokenDoc.save();
			throw new UnauthorizedException("Refresh token expired - Login again");
		}

		// 6️⃣ Rotate token — jti remains the same for device
		const newRefreshToken = jwt.sign(
			{ _id: userId, jti },
			REFRESH_TOKEN_SECRET,
			{ expiresIn: REFRESH_TOKEN_TIMOUT }
		);
		const newHash = await bcryptHash(newRefreshToken, 10);

		tokenDoc.tokenHash = newHash;
		await tokenDoc.save();

		// 7️⃣ Issue new access token
		const newAccessToken = jwt.sign({ _id: userId }, ACCESS_TOKEN_SECRET, {
			expiresIn: ACCESS_TOKEN_TIMOUT,
		});

		return { accessToken: newAccessToken, refreshToken: newRefreshToken };
	}

	private async generateTokens(user: any, reqInfo: any) {
		/** TODO
		 * Change the payload
		 * Remove the email ,store role permision
		 */
		const { _id } = user;
		const accessToken = jwt.sign({ _id }, ACCESS_TOKEN_SECRET, {
			expiresIn: ACCESS_TOKEN_TIMOUT,
		});

		const jti = uuidv4();
		// user id , email not need for that
		const refreshToken = jwt.sign({ _id, jti }, REFRESH_TOKEN_SECRET, {
			expiresIn: REFRESH_TOKEN_TIMOUT,
		});

		const tokenHash = await bcryptHash(refreshToken, 10);

		await this.userToken.create({
			user: _id,
			jti,
			tokenHash,
			...reqInfo,
		});

		return { accessToken, refreshToken };
	}

	public async logout(refreshToken: string) {
		const payload: any = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
		const tokenDoc = await this.userToken.findOne({
			user: payload._id,
			jti: payload.jti,
		});
		if (!tokenDoc) {
			throw new UnauthorizedException("Invalid refresh token");
		}
		tokenDoc.revoked = true;
		await tokenDoc.save();
	}
}

export default AuthService;
