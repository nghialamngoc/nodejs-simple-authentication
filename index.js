require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.json());

// Giả lập database user
const users = [
  {
    id: 1,
    username: "user1",
    password: "$2a$10$ODbcKY79gqviOgeH0wwdVumKrWgacfKnS6Gh/FTYf/MUOaOfmbv3.", // 'password123'
  },
];

// Lưu trữ refresh tokens (trong thực tế nên dùng database)
let refreshTokens = [];

// API đăng nhập
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  // Kiểm tra user
  const user = users.find((u) => u.username === username);
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  // Kiểm tra password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  // Tạo JWT token
  const accessToken = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );

  // Tạo Refresh token
  const refreshToken = jwt.sign(
    { id: user.id, username: user.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );

  // Lưu refresh token
  refreshTokens.push(refreshToken);

  // Tính thời gian hết hạn
  const expiresIn = new Date(
    Date.now() + ms(process.env.ACCESS_TOKEN_EXPIRY)
  ).getTime();

  res.json({
    accessToken,
    refreshToken,
    expiresIn,
  });
});

// API đăng xuất
app.post("/logout", (req, res) => {
  const { refreshToken } = req.body;

  // Xóa refresh token
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

  res.json({ message: "Logged out successfully" });
});

// Middleware xác thực token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Authentication token is required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// API làm mới token
app.post("/refresh-token", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken || !refreshTokens.includes(refreshToken)) {
    return res
      .status(403)
      .json({ message: "Refresh token not found, login again" });
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const accessToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );

    const expiresIn = new Date(
      Date.now() + ms(process.env.ACCESS_TOKEN_EXPIRY)
    ).getTime();

    res.json({ accessToken, expiresIn });
  });
});

// Route được bảo vệ
app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

// Hàm chuyển đổi chuỗi thời gian thành milliseconds
function ms(s) {
  const map = { s: 1000, m: 60000, h: 3600000, d: 86400000 };

  return s
    .replace(/[smhd]/g, (m) => "*" + map[m] + "+")
    .split("+")
    .filter((x) => x)
    .reduce((sum, curr) => {
      return sum + eval(curr);
    }, 0);
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
