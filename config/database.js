// configurer la BDD

import mysql from "mysql2/promise";

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
});

pool.getConnection().then((res) =>
    console.log("bdd -> " + res.config.database)
);

export { pool };