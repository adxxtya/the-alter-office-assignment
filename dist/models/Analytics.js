"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Analytics = void 0;
const sequelize_1 = require("sequelize");
const sequelizeInstance_1 = __importDefault(require("../utils/sequelizeInstance"));
const Analytics = sequelizeInstance_1.default.define("Analytics", {
    alias: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    totalClicks: { type: sequelize_1.DataTypes.INTEGER, defaultValue: 0 },
    uniqueUsers: { type: sequelize_1.DataTypes.INTEGER, defaultValue: 0 },
    clicksByDate: { type: sequelize_1.DataTypes.JSON },
    osType: { type: sequelize_1.DataTypes.JSON },
    deviceType: { type: sequelize_1.DataTypes.JSON },
});
exports.Analytics = Analytics;
