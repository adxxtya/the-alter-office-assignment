import { DataTypes, Model } from "sequelize";
import sequelize from "../database/connection";

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    googleId: {
      type: DataTypes.STRING,
      unique: true,
    },
  },
  { sequelize, modelName: "User", timestamps: true }
);

export default User;
