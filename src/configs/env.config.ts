import dotenv from 'dotenv';

dotenv.config();

if(!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
}
export const PORT = process.env.PORT || 3000;
export const DATABASE_URL = process.env.DATABASE_URL;
export const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "your_refresh_token_secret";
export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:4200";