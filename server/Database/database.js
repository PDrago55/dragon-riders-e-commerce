const { MongoClient } = require("mongodb");
const assert = require("assert");
const companyData = require("../../server/data/companies.json");
const productData = require("../../server/data/items.json");

const mainDatabase = async (req, res) => {
  const client = new MongoClient("mongodb://localhost:27017", {
    useUnifiedTopology: true,
  });
  await client.connect();
  console.log("connected database");
  const db = await client.db("dragonDb");
  await db.collection("companyData").insertOne({ companyData });
  await db.collection("productData").insertOne({ productData });

  await client.close();
  console.log("Closed");
};

mainDatabase();
