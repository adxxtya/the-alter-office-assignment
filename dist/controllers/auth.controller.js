"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleLogin = void 0;
const google_auth_1 = require("../config/google-auth");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const googleLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.body;
    try {
        const googleUser = yield (0, google_auth_1.verifyGoogleToken)(token);
        // Check if user already exists in the database
        if (!googleUser) {
            throw new Error("No google user found.");
        }
        let user = yield prisma.user.findUnique({
            where: { email: googleUser.email },
        });
        if (!user) {
            // Create a new user if not found
            user = yield prisma.user.create({
                data: {
                    email: googleUser.email,
                    name: googleUser.name,
                    googleId: googleUser.sub, // Use Google user ID as unique identifier
                    avatarUrl: googleUser.picture,
                },
            });
        }
        // Generate JWT
        const jwtToken = (0, google_auth_1.createJWT)(user);
        return res.json({ token: jwtToken, user });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Google authentication failed" });
    }
});
exports.googleLogin = googleLogin;
