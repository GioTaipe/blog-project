require('dotenv').config();

// AWS Environment Variables
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const AWS_BUCKET_REGION = process.env.AWS_BUCKET_REGION;
const AWS_PUBLIC_KEY = process.env.AWS_PUBLIC_KEY;
const AWS_SECRET_ACCES_KEY = process.env.AWS_SECRET_ACCES_KEY;

// Data Base Environment Variables
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_HOST = process.env.DB_HOST;

module.exports = {
    AWS_BUCKET_NAME,
    AWS_BUCKET_REGION,
    AWS_PUBLIC_KEY,
    AWS_SECRET_ACCES_KEY,
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    DB_HOST
};
