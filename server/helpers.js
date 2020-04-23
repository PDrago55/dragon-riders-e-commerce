"use strict";
const companyData = require("../server/data/companies.json");
const productData = require("../server/data/items.json");
const { MongoClient } = require("mongodb");

const getCountryList = async () => {
  const client = new MongoClient("mongodb://localhost:27017", {
    useUnifiedTopology: true,
  });
  try {
    await client.connect();
    console.log("connected - countryList");
    const db = await client.db("dragonDb");
    const countryList = await db.collection("companyData").distinct("country");
    return countryList;
  } catch (err) {
    console.log(err);
  }
  await client.close();
};

module.exports = { getCountryList };
