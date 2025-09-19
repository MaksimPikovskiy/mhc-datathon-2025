export const fixTitle = (title: string) => {
  return title
    .split("_")
    .map((word) => {
      if (word.toLowerCase() === "id") {
        return "ID";
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
};
