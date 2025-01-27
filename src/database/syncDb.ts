import { sequelize } from "../config/database";

const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false }); // Change `force` to true for resetting tables during development
    console.log("Database synchronized successfully.");
  } catch (error) {
    console.error("Error synchronizing database:", error);
  }
};

syncDatabase();
