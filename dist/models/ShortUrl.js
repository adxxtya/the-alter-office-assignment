"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelizeInstance_1 = __importDefault(require("../utils/sequelizeInstance"));
const ShortUrl = sequelizeInstance_1.default.define("ShortUrl", {
    longUrl: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    shortUrl: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    alias: { type: sequelize_1.DataTypes.STRING, unique: true, allowNull: false },
    topic: { type: sequelize_1.DataTypes.STRING },
    createdAt: { type: sequelize_1.DataTypes.DATE, defaultValue: sequelize_1.Sequelize.fn("NOW") },
});
exports.default = ShortUrl;
