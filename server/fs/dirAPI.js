const { mkdir, existsSync } = require("node:fs");
const { join } = require("node:path");

const months = {
  0: "Январь",
  1: "Февраль",
  2: "Март",
  3: "Апрель",
  4: "Май",
  5: "Июнь",
  6: "Июль",
  7: "Август",
  8: "Сентябрь",
  9: "Октябрь",
  10: "Ноябрь",
  11: "Декабрь",
};

const date = new Date();
const today = date.toLocaleDateString("ru");
const currentMonth = date.getMonth();

const pathForCurrentMonth = `Z:\\Пациенты все\\Пациенты 2023\\${
  currentMonth + 1
} ${months[currentMonth]}`;
const testPath = `Z:\\Пациенты все\\Пациенты 2023\\13 Тест`;

function createFolder(dirName) {
  let folder;
  const lastChar = dirName.slice(-1);
  if (lastChar === ".") {
    folder = join(testPath, dirName.slice(0, -1));
  } else {
    folder = join(testPath, dirName);
  }
  if (existsSync(folder)) {
    console.log(folder, "exists");
    const folderWithDate = join(testPath, dirName + " " + today);
    if (existsSync(folderWithDate)) {
      console.log(folderWithDate, "exists");
      return join(
        testPath,
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
  const answersFolder = join(folder, "Ответы специалистов");
  await mkdir(answersFolder, (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log(answersFolder, "created");
    }
  });
}
async function makeUniqueDirectory(dirName) {
  const folder = createFolder(dirName);
  await makeDirectory(folder);
  return folder;
}

module.exports = { makeUniqueDirectory };
// makeUniqueDirectory("Z:\\Пациенты все\\Пациенты 2023\\13 Тест", "test T.T.");
