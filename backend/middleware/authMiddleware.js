/**
 * @description JWT認証ミドルウェアを定義するファイルです。
 */

import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.status(401).json({ message: "認証トークンが提供されていません。" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT検証エラー:", err);
      return res.status(403).json({ message: "無効な認証トークンです。" });
    }
    req.user = user;
    next();
  });
};
