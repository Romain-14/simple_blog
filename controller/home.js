import Query from "../model/index.js";

const homeView = async (req, res) => {
    try {
        const query = `
                    SELECT title, content, date 
                    FROM story
                    LIMIT 3        
                `;
        // invoquer la méthode traitant la requête SQL
        const stories = await Query.find(query);

        res.status(200).render("layout", {
            template: "home",
            stories: stories,
        });
    } catch (error) {
        console.log(error);
    }
};

export { homeView };
