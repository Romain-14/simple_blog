import express from "express";
const app = express();

import "dotenv/config";

// configurer la BDD
import mysql from "mysql2/promise";

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
});

pool.getConnection().then(res => console.log("bdd -> " + res.config.database));

// ICI LA BDD est connecté | SI pas connecté environnement node planté

// configurer les views ( moteur de rendu)
app.set("views", "./views").set("view engine", "ejs");

app
    .use(express.static("public"))
    .use(express.json())
    .use(express.urlencoded({extended: true}));

// LES ROUTES
// la home page
// j'affiche 3 stories uniquement
app.get("/", async (req, res) => {
    const [result] = await pool.execute(`
        SELECT title, content, date 
        FROM story
        LIMIT 3        
    `);
    res.render( "layout", {
        template: "home",
        stories: result,
    });
});

// la stories page
// les afficher toutes

app.get("/stories", async (req, res)=>{
    try {
        const [result] = await pool.execute(`
            SELECT story.id AS id, story.title AS storyTitle, content, date AS storyDate, alias AS author, category.title AS categoryTitle, url
            FROM story
            JOIN user ON story.id_user = user.id
            JOIN category_story ON story.id = category_story.id_story
            JOIN category ON category_story.id_category = category.id
            JOIN photo ON story.id = photo.id_story
        `);

        res.render("layout", {
            template: "stories",
            stories: result
        });

    } catch (error) {
        console.log(error);
    }
});

app.get("/story/:id", async (req, res) => {
    
    try {
        const [resultStory] = await pool.execute(`
            SELECT story.id, user.id, story.title AS storyTitle, content, date AS storyDate, alias AS author, category.title AS categoryTitle, url
            FROM story
            JOIN user ON story.id_user = user.id
            JOIN category_story ON story.id = category_story.id_story
            JOIN category ON category_story.id_category = category.id
            JOIN photo ON story.id = photo.id_story
            WHERE story.id = ?
        `, [req.params.id]); 
        
        const [resultCom] = await pool.execute(`
                SELECT user, msg, date AS comDate
                FROM com
                WHERE id_story = ?
            `, [req.params.id] );

        res.render("layout", {
            template: "story",
            story: resultStory[0],
            commentaries: resultCom,
        });

    } catch (error) {
        console.log(error);
    }
});

app.post("/comment/send/:id", async (req, res) => {
    try {
        await pool.execute(`
            INSERT INTO com (user, msg, date, id_story)
            VALUES (?, ?, NOW(), ?)`,
            [req.body.alias, req.body.msg, req.params.id]);
        
        res.redirect(301, `/story/${req.params.id}`);        
    } catch (error) {
        console.log(error);
    }
});



app.listen(9000, () => console.log("http://localhost:" + 9000));