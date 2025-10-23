export const camelToSnakeCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((v) => camelToSnakeCase(v));
  } else if (obj !== null && typeof obj === "object") {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = key.replace(
        /[A-Z]/g,
        (letter) => `_${letter.toLowerCase()}`
      );
      acc[snakeKey] = camelToSnakeCase(obj[key]);
      return acc;
    }, {});
  }
  return obj;
};
