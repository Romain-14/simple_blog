import express from "express";
const app = express();
const PORT = process.env.PORT || process.env.LOCAL_PORT;

import "dotenv/config";

import bcrypt from "bcrypt";
const saltRounds = 10;

// configurer la BDD
import mysql from "mysql2/promise";
import session from "express-session";

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
});

pool.getConnection().then((res) =>
    console.log("bdd -> " + res.config.database)
);

// ICI LA BDD est connecté | SI pas connecté environnement node planté

// configurer les views ( moteur de rendu)
app.set("views", "./views").set("view engine", "ejs");

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

// HOME PAGE
// afficher 3 stories uniquement
app.get("/", async (req, res) => {
    const [result] = await pool.execute(`
        SELECT title, content, date 
        FROM story
        LIMIT 3        
    `);
    res.status(200).render("layout", {
        template: "home",
        stories: result,
    });
});

// STORIES PAGE
// les afficher toutes
app.get("/stories", async (req, res) => {
    try {
        const query = `
        SELECT story.id AS id, story.title AS storyTitle, content, date AS storyDate, alias AS author, category.title AS categoryTitle, url
        FROM story
        JOIN user ON story.id_user = user.id
        JOIN category_story ON story.id = category_story.id_story
        JOIN category ON category_story.id_category = category.id
        JOIN photo ON story.id = photo.id_story
        GROUP BY story.id
    `;
        const [result] = await pool.execute(query);

        res.status(200).render("layout", {
            template: "stories",
            stories: result,
        });
    } catch (error) {
        console.log(error);
    }
});

// STORY PAGE
app.get("/story/:id", async (req, res) => {
    try {
        const [resultStory] = await pool.execute(
            `
            SELECT story.id, story.title AS storyTitle, content, date AS storyDate, alias AS author, category.title AS categoryTitle
            FROM story
            JOIN user ON story.id_user = user.id
            JOIN category_story ON story.id = category_story.id_story
            JOIN category ON category_story.id_category = category.id
            WHERE story.id = ?
        `,
            [req.params.id]
        );

        const [resultPhotos] = await pool.execute(
            `
            SELECT url
            FROM photo            
            WHERE photo.id_story = ?
        `,
            [req.params.id]
        );

        const [resultCom] = await pool.execute(
            `
                SELECT user, msg, date AS comDate
                FROM com
                WHERE id_story = ?
            `,
            [req.params.id]
        );

        res.status(200).render("layout", {
            template: "story",
            story: resultStory[0],
            photos: resultPhotos,
            commentaries: resultCom,
        });
    } catch (error) {
        console.log(error);
    }
});
// send comment
app.post("/comment/send/:id", async (req, res) => {
    try {
        await pool.execute(
            `
            INSERT INTO com (user, msg, date, id_story)
            VALUES (?, ?, NOW(), ?)`,
            [req.body.alias, req.body.msg, req.params.id]
        );

        res.redirect(301, `/story/${req.params.id}`);
    } catch (error) {
        console.log(error);
    }
});

// ENTRY USER

app.get("/user/entry", (req, res, next) => {
    if(req.query.sign === "in" || req.query.sign === "up") {
        res.status(200).render("layout", { template: "user/entry", ...req.query, msg: null });
    } else if(req.query.sign === "out"){
        req.session.destroy();    
        res.redirect(301, "/");
    }
    else next();
});

// create user
app.post("/user/entry/signup", async (req,res) => {
    try {
        const { alias, email, password } = req.body;
        const query = `INSERT INTO user (alias, email, pwd, regDate, id_role) VALUES (?, ?, ?, now(), 3 )`;
        const hashPWD = await bcrypt.hash(password, saltRounds);
        await pool.execute(query, [alias, email, hashPWD]);
        res.status(200).render("layout", {template: "user/entry", sign: "in", msg: null});
    } catch (error) {
        console.log(error);
        if(error.sqlMessage?.includes("alias")){
            res.render("layout", { template: "user/entry", sign: "up", msg: "alias already exists !" });
        }
        // ... traitements d'autres messages d'erreurs
    }    
});

app.post("/user/entry/signin", async (req, res) => {
    try {
        let msg = null;
        const {email, password} = req.body;
        const query = "SELECT alias, email, pwd FROM user WHERE email = ?";
        
        const [[user]] = await pool.execute(query, [email]);
        
        if(user) {
            const isSame = await bcrypt.compare(password, user.pwd);
            if(isSame) {
                req.session.isLogged = true;
                req.session.alias = user.alias;
                res.redirect(301, "/");
                return;
            } else msg = "bad password";
        } else msg = "no account with this email";

        res.status(200).render("layout", {template: "user/entry", sign: "in", msg: msg});
    
    } catch (error) {
        console.log(error);
    }
});


// ADMIN 
// A FAIRE 


app.get("/*", (req,res)=>{
    res.render("notFound");
});

app.listen(PORT, () => console.log("http://localhost:" + PORT));
