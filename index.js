const express = require("express");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;
const cors = require("cors");
const admin = require("firebase-admin");

const serviceAccount = require("./assignment-10-72af4-firebase-adminsdk-fbsvc-5e7bc47e2c.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use(cors());
app.use(express.json());
const verifation = async (req, res, next) => {
  const userHeader = req.headers.authorization;
  if (!userHeader) {
    return res.status(401).send({ message: `unauthorize user` });
  }
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res.status(401).send({ message: `unauthorize user` });
  }
  try {
    const check = await admin.auth().verifyIdToken(token);
    req.token_email = check.email;
    next();
  } catch (error) {
    return res.status(401).send({ message: `unauthorize user` });
  }
};
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rgj7zze.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const aiModel = client.db("aiModel");
    const model = aiModel.collection("model");
    const purchases = aiModel.collection("purchases");
    app.post("/purchases", async (req, res) => {
      const cursor = req.body;
      const result = await purchases.insertOne(cursor);
      res.send(result);
    });
    app.get("/add-model", async (req, res) => {
      const cursor = model.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/add-latest-model", async (req, res) => {
      const cursor = model.find().limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.post("/add-model", verifation, async (req, res) => {
      const cursor = req.body;
      const result = await model.insertOne(cursor);
      res.send(result);
    });
    app.delete("/add-model/:id", verifation, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await model.deleteOne(query);
      res.send(result);
    });
    app.patch("/edit/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const query = { _id: new ObjectId(id) };
      const update = { $set: { name: body.name } };
      const result = await model.updateOne(query, update);
      res.send(result);
    });
    app.get("/mymodel", async (req, res) => {
      const email = req.query.email;
      const query = {};
      if (email) {
        query.createdBy = email;
      }
      const cursor = model.find(query);
      const result = await cursor.toArray(cursor);
      res.send(result);
    });
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(port, () => {
  console.log("mongodb start successfully", port);
});
