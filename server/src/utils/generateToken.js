import jwt from "jsonwebtoken";

export const generateToken = async (res, user, message) => {
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  user.refreshToken = token; // refresh token
  user.refreshExpire = Date.now() + 3600000;
  await user.save();
  return res
    .status(200)
    .cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    })
    .json({
      success: true,
      message,
      user,
    });
};
