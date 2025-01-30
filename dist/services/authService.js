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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateGoogleUser = void 0;
const google_auth_library_1 = require("google-auth-library");
const config_1 = __importDefault(require("../config/config"));
const Users_1 = __importDefault(require("../models/Users"));
const client = new google_auth_library_1.OAuth2Client(config_1.default.GOOGLE_CLIENT_ID);
const authenticateGoogleUser = (idToken) => __awaiter(void 0, void 0, void 0, function* () {
    const ticket = yield client.verifyIdToken({
        idToken,
        audience: config_1.default.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload)
        throw new Error("Invalid token");
    const { email, name, sub: googleId } = payload;
    let user = yield Users_1.default.findOne({ where: { googleId } });
    if (!user) {
        user = yield Users_1.default.create({ email, name, googleId });
    }
    return user;
});
exports.authenticateGoogleUser = authenticateGoogleUser;
