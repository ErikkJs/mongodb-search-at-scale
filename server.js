const { MongoClient, ObjectID} = require("mongodb");
const Keys = require("./config/keys")
const Express = require("express");
const Cors = require('cors');
const BodyParser = require("body-parser");
const { response } = require("express");


const client = new MongoClient(Keys.mongoURI, {
    useUnifiedTopology: true
})
const server = Express();

server.use(Express.static(__dirname + '/public'));
server.use(BodyParser.json());
server.use(BodyParser.urlencoded({ extended: true }));
server.use(Cors());
server.set('view engine', 'ejs');

let collection;

server.get("/search", async (req, res) => {
    try {
        let result = await collection.aggregate([{
            "$search": {
                "autocomplete": {
                    "query": `${req.query.term}`,
                    "path": "name",
                    "fuzzy": {
                        "maxEdits": 2
                    }
                }
            }
        }]).toArray()
        res.send(result)
    } catch (e) {
        res.send('')
    }
})

server.get("/get/:id", async (req, res) => {
    try {
        let fetchedFile = await collection.findOne({
            "_id": ObjectID(req.params.id)
        })
        res.send(fetchedFile)
    } catch (e) {
        response.status(500).send({
            errorMessage: e.message
        })
    }
})

server.get("/", async (req, res) => {
    res.render("index")
})

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
    try {
        console.log(`Taking requests at Port: http://localhost:${PORT}` )
        await client.connect();
        collection = client.db("Files").collection("FileMetaData");
    } catch (e) {
        console.error(e)
    }
})