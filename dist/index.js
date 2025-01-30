"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const swagger_1 = require("./swagger");
dotenv_1.default.config();
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Too many requests from this IP, please try again later." },
    headers: true,
});
exports.app = (0, express_1.default)();
exports.app
    .use(express_1.default.json())
    .use(routes_1.default)
    .use(limiter)
    .listen(process.env.PORT || 3000, () => {
    console.log(`Listening at http://localhost:${process.env.PORT || 3000}`);
    (0, swagger_1.swaggerDocs)(exports.app, process.env.PORT || 3000);
});
