"use strict";
const { getCountryList } = require("./helpers");
const { MongoClient } = require("mongodb");
const _ = require("lodash");
const assert = require("assert");
const MAX_DELAY = 1000;
const FAILURE_ODDS = 0.01;

const simulateProblems = (res, data) => {
  const delay = Math.random() * MAX_DELAY;

  setTimeout(() => {
    const shouldError = Math.random() <= FAILURE_ODDS;

    if (shouldError) {
      res.sendStatus(500);
      return;
    }

    res.json(data);
  }, delay);
};

//-------Countries----//

const getCountries = async (req, res) => {
  const uniqueCountries = await getCountryList();
  res.status(200).send({ countries: uniqueCountries });
};

//--------Products by Country--------//

const productByCountry = async (req, res) => {
  const { country } = req.params;
  const client = new MongoClient("mongodb://localhost:27017", {
    useUnifiedTopology: true,
  });
  try {
    await client.connect();
    console.log("Connected -- Products by Country");
    const db = await client.db("dragonDb");
    const companiesId = await db
      .collection("companyData")
      .find({ country: { $regex: new RegExp(country, "i") } })
      .toArray();
    const newArray = [];
    companiesId.forEach((company) => {
      return newArray.push(company._id);
    });

    const productId = await db
      .collection("productData")
      .find({ companyId: { $in: newArray } })
      .toArray();
    res.status(200).json({ products: productId });
  } catch (err) {
    console.log(err);
  }
  client.close();
};

//--------Products Details Page-----------//

const getOneProduct = async (req, res) => {
  const { productId } = req.params;
  const testProduct = parseInt(productId);
  console.log(parseInt(productId));
  const client = new MongoClient("mongodb://localhost:27017", {
    useUnifiedTopology: true,
  });
  client.connect();
  console.log("connected -- getOneProduct");

  try {
    const db = await client.db("dragonDb");
    const productById = await db
      .collection("productData")
      .find({ _id: testProduct })
      .toArray();
    res.status(200).json({ details: productById });
  } catch (err) {
    console.log(err);
  }
};

//-----------------Featured Products----------//

const getFeatureProducts = async (req, res) => {
  const { country } = req.params;
  const client = new MongoClient("mongodb://localhost:27017", {
    useUnifiedTopology: true,
  });

  try {
    client.connect();
    console.log("connected getFeaturedProducts");
    const db = await client.db("dragonDb");
    const companiesId = await db
      .collection("companyData")
      .find({ country: { $regex: new RegExp(country, "i") } })
      .toArray();
    const newArray = [];
    companiesId.forEach((company) => {
      return newArray.push(company._id);
    });
    const productId = await db
      .collection("productData")
      .find({ companyId: { $in: newArray } })
      .toArray();
    const featuredProducts = _.flatten(productId).filter((product) => {
      if (product.numInStock > 0) {
        let newPrice = product.price.slice(1);
        return parseFloat(newPrice) < 20;
      }
    });
    res.status(200).json({ features: featuredProducts });
  } catch (err) {
    res.status(400).json({ error: "Bruh?" });
    console.log(err);
  }

  client.close();
};

//-----------Order Validation---------//

const handleOrder = async (req, res) => {
  const { order_summary } = req.body;
  const client = new MongoClient("mongodb://localhost:27017", {
    useUnifiedTopology: true,
  });
  if (!order_summary.length) {
    return res.status(400).json({ message: "Bad Request" });
  }
  try {
    client.connect();
    console.log("connected--handleOrder");
    const db = client.db("dragonDb");
    const productById = order_summary.map((product) => {
      return product.item_id;
    });
    const products = await db
      .collection("productData")
      .find({ _id: { $in: productById } })
      .toArray();
    let areAllProductsAvailable = false;
    await products.forEach((product, i) => {
      if (product.numInStock >= order_summary[i].quantity) {
        areAllProductsAvailable = true;
      } else {
        areAllProductsAvailable = false;
      }
    });
    console.log(areAllProductsAvailable);
    if (areAllProductsAvailable) {
      await order_summary.forEach(async (product) => {
        await db
          .collection("productData")
          .updateOne(
            { _id: product.item_id },
            { $inc: { numInStock: -product.quantity } }
          );
      });
      client.close();
      return res.status(200).json({ message: "Successful Purchase!" });
    } else {
      client.close();
      return res.status(400).json({ message: "Failure" });
    }
  } catch (err) {
    console.log(err);
  }
  client.close();
  console.log("closed");
};

// const conditionalRes = async (req, res) => {
//   if (await handleOrder(req, res)) {
//     return res.status(200).json({ message: "Successful Purchase!" });
//   } else {
//     return res.status(400).json({ message: "Failure" });
//   }
// };
module.exports = {
  simulateProblems,
  getCountries,
  getOneProduct,
  productByCountry,
  getFeatureProducts,
  handleOrder,
};
