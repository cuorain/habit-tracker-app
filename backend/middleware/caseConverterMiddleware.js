import { camelToSnakeCase } from "../utils/caseConverter.js";

export const convertKeysToSnakeCase = (req, res, next) => {
  if (
    req.body &&
    typeof req.body === "object" &&
    Object.keys(req.body).length > 0
  ) {
    req.body = camelToSnakeCase(req.body);
  }
  next();
};
