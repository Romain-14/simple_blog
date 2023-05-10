import { Router } from "express";

import { homeView } from "../controller/home.js";
import { storiesView } from "../controller/story.js";
import { storyView } from "../controller/story.js";
import { addComment } from "../controller/story.js";

const router = Router();

// HOME PAGE
// afficher 3 stories uniquement
router.get("/", homeView);

// STORIES PAGE
// les afficher toutes
router.get("/stories", storiesView);

// STORY PAGE
router.get("/story/:id", storyView);
// send comment
router.post("/comment/send/:id", addComment);

// ENTRY USER

// app.get("/user/entry", (req, res, next) => {
//     if(req.query.sign === "in" || req.query.sign === "up") {
//         res.status(200).render("layout", { template: "user/entry", ...req.query, msg: null });
//     } else if(req.query.sign === "out"){
//         req.session.destroy();    
//         res.redirect(301, "/");
//     }
//     else next();
// });

// create user
// app.post("/user/entry/signup", async (req,res) => {
//     try {
//         const { alias, email, password } = req.body;
//         const query = `INSERT INTO user (alias, email, pwd, regDate, id_role) VALUES (?, ?, ?, now(), 3 )`;
//         const hashPWD = await bcrypt.hash(password, saltRounds);
//         await pool.execute(query, [alias, email, hashPWD]);
//         res.status(200).render("layout", {template: "user/entry", sign: "in", msg: null});
//     } catch (error) {
//         console.log(error);
//         if(error.sqlMessage?.includes("alias")){
//             res.render("layout", { template: "user/entry", sign: "up", msg: "alias already exists !" });
//         }
//         // ... traitements d'autres messages d'erreurs
//     }    
// });

// app.post("/user/entry/signin", async (req, res) => {
//     try {
//         let msg = null;
//         const {email, password} = req.body;
//         const query = "SELECT alias, email, pwd FROM user WHERE email = ?";
        
//         const [[user]] = await pool.execute(query, [email]);
        
//         if(user) {
//             const isSame = await bcrypt.compare(password, user.pwd);
//             if(isSame) {
//                 req.session.isLogged = true;
//                 req.session.alias = user.alias;
//                 res.redirect(301, "/");
//                 return;
//             } else msg = "bad password";
//         } else msg = "no account with this email";

//         res.status(200).render("layout", {template: "user/entry", sign: "in", msg: msg});
    
//     } catch (error) {
//         console.log(error);
//     }
// });



// ADMIN 
// A FAIRE 


// app.get("/*", (req,res)=>{
//     res.render("notFound");
// });

export default router;