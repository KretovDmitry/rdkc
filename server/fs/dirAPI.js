const { mkdir, existsSync } = require("node:fs");
const { join } = require("node:path");

function createFolder(path, dirName) {
  let folder;
  const lastChar = dirName.slice(-1);
  if (lastChar === ".") {
    folder = join(path, dirName.slice(0, -1));
  } else {
    folder = join(path, dirName);
  }
  if (existsSync(folder)) {
    const today = new Date().toLocaleDateString("ru");
    const folderWithDate = join(path, dirName + " " + today);
    if (existsSync(folderWithDate)) {
      return join(
        path,
        dirName + " " + today + " " + Math.round(Math.random() * 1_000_000),
      );
    } else {
      return folderWithDate;
    }
  } else {
    return folder;
  }
}
async function makeDirectory(folder) {
  await mkdir(folder, (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log(folder, "created");
    }
  });
}
async function makeUniqueDirectory(path, dirName) {
  const folder = createFolder(path, dirName);
  await makeDirectory(folder);
  return folder;
}

// makeUniqueDirectory("Z:\\Пациенты все\\Пациенты 2023\\13 Тест", "test T.T.");
module.exports = { makeUniqueDirectory };
