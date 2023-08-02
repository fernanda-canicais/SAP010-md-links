#!/usr/bin/env node

const { mdLinks } = require("./index");

const path = process.argv[2];

const options = {
  validate: process.argv.includes("--validate"),
  stats: process.argv.includes("--stats"),
};

function printLinks(links) {
  if (!options.validate && !options.stats) {
    links.forEach((link) => {
      console.log(`File:${link.file}`);
      console.log(`Text:${link.text}`);
      console.log(`Url:${link.url}`);
      console.log("---------------------");
    });
  } else if (options.validate && !options.stats) {
    links.forEach((link) => {
      console.log(`File:${link.file}`);
      console.log(`Url:${link.url}`);
      console.log(`Text:${link.text}`);
      console.log(`Link:${link.ok}`);
      console.log(`Status:${link.status}`);
      console.log("---------------------");
    });
  } else if (options.stats && !options.validate) {
    const totalLinks = links.length;
    const uniqueLinks = new Set(links.map((link) => link.url)).size;

    console.log(`Total de links encontrados: ${totalLinks}`);
    console.log(`Total de links únicos: ${uniqueLinks}`);
  } else if (options.validate && options.stats) {
    let brokenLinks = links.filter((link) => link.ok !== "ok");
    const totalLinks = links.length;
    const uniqueLinks = new Set(links.map((link) => link.url)).size;
    const uniqueBrokenLinks = new Set(brokenLinks.map((link) => link.href))
      .size;

    console.log(`Total de links encontrados: ${totalLinks}`);
    console.log(`Total de links únicos: ${uniqueLinks}`);
    console.log(`Total de links quebrados: ${uniqueBrokenLinks}`);
  }
}

mdLinks(path, options)
  .then((links) => {
    printLinks(links);
  })
  .catch((error) => {
    console.error(error);
  });
