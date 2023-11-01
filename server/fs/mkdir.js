const { mkdir } = require("node:fs");
const { join } = require("node:path");

async function makeDirectory(path, dirName) {
  const folder = join(path, dirName);
  await mkdir(folder, (err) => {
    if (err && err.code === "EEXIST") {
      const today = new Date().toLocaleDateString("ru");
      let newDirName;
      if (dirName.includes(today)) {
        const prevDirName = dirName.split(" ");
        newDirName = prevDirName[0] + " " + prevDirName[1] + " " + 2;
        if (prevDirName.length > 2) {
          newDirName =
            prevDirName[0] +
            " " +
            prevDirName[1] +
            " " +
            (Number(prevDirName[2]) + 1);
        }
      } else {
        newDirName = dirName + " " + today;
      }
      makeDirectory(newDirName);
    } else if (err) {
      console.error(err.message);
    }
  });
}

module.exports = { makeDirectory };
