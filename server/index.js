"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const companyData = require("./data/companies.json");
const productData = require("./data/items.json");
const _ = require("lodash");
const {
  simulateProblems,
  productByCountry,
  getCountries,
  getFeatureProducts,
  getOneProduct,
  handleOrder,
} = require("./handlers.js");
const PORT = 4000;
express()
  .use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Methods",
      "OPTIONS, HEAD, GET, PUT, POST, DELETE"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  })
  .use(morgan("tiny"))
  .use(express.static("./server/assets"))
  .use(bodyParser.json())
  .use(express.urlencoded({ extended: false }))
  .use("/", express.static(__dirname + "/"))

  // REST endpoints

  //---Gets Country List in an Array---//

  .get("/countries", getCountries)

  //DO NOT USE THIS ENDPOINT.... YET. Could be used for a company page...

  .get("/companies/:country", (req, res) => {
    const { country } = req.params;
    const companiesByCountry = companyData.filter((company) => {
      return (
        company.country.replace(" ", "").toLowerCase() === country.toLowerCase()
      );
    });
    return simulateProblems(res, { companies: companiesByCountry });
  })

  //----Gets the Products by each country----//
  .get("/products/:country", productByCountry)

  .get("/products/detail/:productId", getOneProduct)

  //---A countries Featured Products, Sorted By Lowest Price---//

  .get("/countries/:country/featuredproducts", getFeatureProducts)

  //Order-Form Validation

  .post("/order", handleOrder)

  //---Gets Categories, Organized by Country---//

  .get("/categories/:country", (req, res) => {
    const { country } = req.params;
    const companiesIdByCountry = companyData
      .map((company) => {
        if (
          company.country.replace(" ", "").toLowerCase() ===
          country.toLowerCase()
        ) {
          return company.id;
        }
      })
      .filter((id) => id !== undefined);
    const productsByCountry = companiesIdByCountry.map((id) => {
      return productData.filter((product) => {
        return product.companyId === id;
      });
    });
    const productsByCategories = _.flatten(productsByCountry).map((product) => {
      return product.category;
    });
    return simulateProblems(res, {
      categories: Array.from(new Set(productsByCategories)),
    });
  })

  .listen(PORT, () => console.info(`Listening on port ${PORT}`));
