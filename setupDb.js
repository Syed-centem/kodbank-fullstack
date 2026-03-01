require('dotenv').config();
const mysql = require('mysql2/promise');

async function initializeDatabase() {
    try {
        console.log("Connecting to TiDB Serverless...");
        
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT,
            ssl: {
                minVersion: 'TLSv1.2',
                rejectUnauthorized: true
            }
        });

        console.log("Connected successfully! Creating tables...");

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS KodUser (
                uid INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                balance DECIMAL(10, 2) DEFAULT 100000.00,
                phone VARCHAR(20) NOT NULL,
                role ENUM('Customer', 'Manager', 'Admin') DEFAULT 'Customer'
            );
        `);
        console.log("✅ KodUser table is ready.");

        await connection.execute(`
            CREATE TABLE IF NOT EXISTS UserToken (
                tid INT AUTO_INCREMENT PRIMARY KEY,
                token VARCHAR(512) NOT NULL,
                uid INT NOT NULL,
                expairy VARCHAR(50),
                FOREIGN KEY (uid) REFERENCES KodUser(uid) ON DELETE CASCADE
            );
        `);
        console.log("✅ UserToken table is ready.");
        console.log("🎉 Database setup is 100% complete!");
        
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error("❌ Error setting up database:", error.message);
        process.exit(1);
    }
}

initializeDatabase();