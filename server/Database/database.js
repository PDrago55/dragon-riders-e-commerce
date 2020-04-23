const { MongoClient } = require("mongodb");
const assert = require("assert");
const fs = require("file-system");

const companyData = JSON.parse(fs.readFileSync("./data/companies.json"));
const productData = JSON.parse(fs.readFileSync("./data/items.json"));

const mainDatabase = async (req, res) => {
  const client = new MongoClient("mongodb://localhost:27017", {
    useUnifiedTopology: true,
  });
  await client.connect();
  console.log("connected database");
  const db = await client.db("dragonDb");
  await db.collection("companyData").insertMany(companyData);
  await db.collection("productData").insertMany(productData);
  await client.close();
  console.log("Closed");
};

mainDatabase();
