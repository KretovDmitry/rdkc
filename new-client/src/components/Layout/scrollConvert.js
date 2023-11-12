const fs = require("fs");
const postcss = require("postcss");
const scrollbar = require("postcss-scrollbar");

let input = fs.readFileSync("input.css", "utf8");

postcss()
  .use(scrollbar)
  .process(input)
  .then((result) => {
    fs.writeFileSync("output.css", result.css);
  });
