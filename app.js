import express from "express";
import session from "express-session";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || process.env.LOCAL_PORT;

// replacer dans le fichier requis !!!!!!
import bcrypt from "bcrypt";
import router from "./router/index.js";
const saltRounds = 10;

// configurer les views ( moteur de rendu)
app.set("views", "./views").set("view engine", "ejs");

// couches express middlewares
app.use(session({
        secret: process.env.SK,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000,
        },
    }))
    .use(express.static("public"))
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .use((req, res, next) => {
        if (!req.session.isLogged) req.session.isLogged = false;
        res.locals.isLogged = req.session.isLogged;
        res.locals.alias = req.session.alias;
        next();
    });

// LES ROUTES
app.use(router);





app.listen(PORT, () => console.log("http://localhost:" + PORT));