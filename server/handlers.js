"use strict";
const companyData = require("../server/data/companies.json");
const productData = require("../server/data/items.json");
const { MongoClient } = require("mongodb");
const MAX_DELAY = 1000;
const FAILURE_ODDS = 0.05;

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

const getCountries = async (req, res) => {
  const client = new MongoClient("mongodb://localhost:27017", {
    useUnifiedTopology: true,
  });
  const uniqueCountries = getCountryList();
  res.status(200).send({ countries: uniqueCountries });
};

const getCountryList = () => {
  const countryList = companyData.map((country) => {
    return country.country;
  });
  const uniqueCountries = Array.from(new Set(countryList));
  return uniqueCountries;
};

module.exports = { simulateProblems, getCountryList, getCountries };
