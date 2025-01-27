import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  "postgres", // Database name
  "postgres.sbedwaumpigldwnjtoxm", // Username
  "10021190", // Password
  {
    host: "aws-0-ap-south-1.pooler.supabase.com",
    port: 6543,
    dialect: "postgres",
    logging: true, // Disable logging, useful for production
  }
);

export const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log(
      "Connection to the database has been established successfully."
    );
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};
