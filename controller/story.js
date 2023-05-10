import Query from "../model/index.js";

const storiesView = async (req, res) => {
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
        const result = await Query.find(query);

        res.status(200).render("layout", {
            template: "stories",
            stories: result,
        });
    } catch (error) {
        console.log(error);
    }
}

const storyView = async (req, res) => {
    try {
        const query1 = `
            SELECT story.id, story.title AS storyTitle, content, date AS storyDate, alias AS author, category.title AS categoryTitle
            FROM story
            JOIN user ON story.id_user = user.id
            JOIN category_story ON story.id = category_story.id_story
            JOIN category ON category_story.id_category = category.id
            WHERE story.id = ?
        `;

        const query2 = `
            SELECT url
            FROM photo            
            WHERE photo.id_story = ?
        `;

        const query3 = `
            SELECT user, msg, date AS comDate
            FROM com
            WHERE id_story = ?
        `;

        const [story] = await Query.findByValue(query1, req.params.id);
        const photos  = await Query.findByValue(query2, req.params.id);
        const com     = await Query.findByValue(query3, req.params.id);
        
        res.status(200).render("layout", {
            template: "story",
            story,
            photos: photos,
            commentaries: com,
        });
    } catch (error) {
        console.log(error);
    }
}

const addComment =  async (req, res) => {
    try {
        const query = `
            INSERT INTO com (user, msg, date, id_story)
            VALUES (?, ?, NOW(), ?)
        `;

        const { alias, msg } = req.body;
        const { id }         = req.params;
        const data = { alias, msg, id,};
        
        const result = await Query.write(query, data);

        res.redirect(301, `/story/${req.params.id}`);
    } catch (error) {
        console.log(error);
    }
}

export { storiesView, storyView, addComment };