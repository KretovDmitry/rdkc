const { createWriteStream } = require("node:fs");
const { join } = require("node:path");
const officegen = require("officegen");
function createWord(folder, fileName) {
  const today = new Date().toLocaleDateString("ru");
  const docx = officegen({
    type: "docx",
    author: "РДКЦ МО МОНИКИ",
    title: `${fileName}`,
    description: "Протокол ТМК",
    orientation: "landscape",
    pageMargins: { top: 1800, right: 1000, bottom: 1800, left: 1000 },
  });
  const filePath = join(folder, fileName + " " + today + ".docx");
  const out = createWriteStream(filePath);

  out.on("error", function (err) {
    console.error(err);
  });
  out.on("close", function () {
    console.log("Finished Write Stream");
  });
  docx.generate(out, {
    finalize: function (written) {
      console.log("Finish to create a file.\nTotal bytes created: " + written);
    },
    error: function (err) {
      console.error(err);
    },
  });
}

module.exports = { createWord };
// createWord("Z:\\Пациенты все\\Пациенты 2023\\13 Тест", "Some O.O.");
