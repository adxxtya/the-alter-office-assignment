"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}
const sequelize = new sequelize_1.Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false,
});
exports.default = sequelize;
