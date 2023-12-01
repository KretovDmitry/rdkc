const { mkdir, existsSync } = require("node:fs");
const { join } = require("node:path");
const { ANSWERS_FOLDER, MONTHS } = require("../emias/constants");

const date = new Date();
const currentMonth = date.getMonth();

const pathForCurrentMonth = `Z:\\Пациенты все\\Пациенты 2023\\${
  currentMonth + 1
} ${MONTHS[currentMonth]}`;

// const pathForCurrentMonth = `Z:\\Пациенты все\\Пациенты 2023\\13 Тест`;

function createFolderName(name, birthDate) {
  if (birthDate.slice(-1) === ".") {
    return join(pathForCurrentMonth, name + " " + birthDate.slice(0, -1));
  } else {
    return join(pathForCurrentMonth, name + " " + birthDate);
  }
}
async function makeDirectory(folder) {
  if (!existsSync(folder)) {
    await mkdir(folder, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(folder, "created");
      }
    });
  }
  const answersFolder = join(folder, ANSWERS_FOLDER);
  if (!existsSync(answersFolder)) {
    await mkdir(answersFolder, (err) => {
      if (err) {
        console.error(err.message);
      } else {
        console.log(answersFolder, "created");
      }
    });
  }
}
async function makeUniqueDirectory(patientName, patientBirthDate) {
  const folderName = createFolderName(patientName, patientBirthDate);
  await makeDirectory(folderName);
  return folderName;
}

module.exports = { makeUniqueDirectory };
// makeUniqueDirectory("test T.T.", "18.18.1818");

// if (existsSync(folder)) {
//   console.log(folder, "exists");
//   const folderWithDate = join(
//     pathForCurrentMonth,
//     name + " " + birthDate + " " + today,
//   );
//   if (existsSync(folderWithDate)) {
//     console.log(folderWithDate, "exists");
//     return join(
//       pathForCurrentMonth,
//       name +
//         " " +
//         birthDate +
//         " " +
//         today +
//         " " +
//         Math.round(Math.random() * 1_000_000),
//     );
//   } else {
//     return folderWithDate;
//   }
// } else {
//   return folder;
// }
