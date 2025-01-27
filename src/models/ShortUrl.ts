import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../utils/sequelizeInstance";

const ShortUrl = sequelize.define("ShortUrl", {
  longUrl: { type: DataTypes.STRING, allowNull: false },
  shortUrl: { type: DataTypes.STRING, allowNull: false },
  alias: { type: DataTypes.STRING, unique: true, allowNull: false },
  topic: { type: DataTypes.STRING },
  createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.fn("NOW") },
});

export default ShortUrl;
