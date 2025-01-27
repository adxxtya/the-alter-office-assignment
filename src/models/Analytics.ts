import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../utils/sequelizeInstance";

const Analytics = sequelize.define("Analytics", {
  alias: { type: DataTypes.STRING, allowNull: false },
  totalClicks: { type: DataTypes.INTEGER, defaultValue: 0 },
  uniqueUsers: { type: DataTypes.INTEGER, defaultValue: 0 },
  clicksByDate: { type: DataTypes.JSON },
  osType: { type: DataTypes.JSON },
  deviceType: { type: DataTypes.JSON },
});

export { Analytics };
