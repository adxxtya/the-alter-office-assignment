import { Sequelize } from "sequelize";
import config from "../config/config";

const sequelize = new Sequelize(config.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
});

export default sequelize;
