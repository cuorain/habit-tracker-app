export const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
  res.status(200).json({ message: "Logged out successfully" });
};
