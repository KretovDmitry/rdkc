export const capitalize = (str) => {
  if (typeof str === "string") {
    const words = str.split(" ");
    const capitalized = words.map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    );
    return capitalized.join(" ");
  } else {
    return str;
  }
};
