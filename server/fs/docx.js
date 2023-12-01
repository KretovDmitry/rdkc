const { createWriteStream, existsSync } = require("node:fs");
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
  if (!existsSync(filePath)) {
    const out = createWriteStream(filePath);

    out.on("error", function (err) {
      console.error(err);
    });
    out.on("close", function () {
      console.log(
        new Date().toLocaleString("ru"),
        "createWord Finished Write Stream",
      );
    });
    docx.generate(out, {
      finalize: function (written) {
        console.log(
          new Date().toLocaleString("ru"),
          `${filePath} создан.\nTotal bytes created: ` + written,
        );
      },
      error: function (err) {
        console.error(err);
      },
    });
  }
}

module.exports = { createWord };
// createWord(
//   "Z:\\Пациенты все\\Пациенты 2023\\11 Ноябрь\\test T.T. 18.18.1818",
//   "Some O.O.",
// );
