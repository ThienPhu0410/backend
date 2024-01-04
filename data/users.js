import bcrypt from "bcryptjs";

const users = [
  { name: "Admin user", email: "admin@email.com", password: bcrypt.hashSync("123456", 10), isAdmin: true, avatar: "/images/admin.png" },
  { name: "John Doe", email: "john@email.com", password: bcrypt.hashSync("123456", 10), isAdmin: false, avatar: "john_avatar_url.jpg" },
  { name: "Pham Duc Toan", email: "toanyasuo2020.az@gmail.com", password: bcrypt.hashSync("123456", 10), isAdmin: false, avatar: "toan_avatar_url.jpg" },
  { name: "phạm đức toàn", email: "toanyasuo20201@gmail.com", password: bcrypt.hashSync("123456", 10), isAdmin: false, avatar: "toan_2_avatar_url.jpg" },
  { name: "admin", email: "thienphubinhduong0410@gmail.com", password: bcrypt.hashSync("123456", 10), isAdmin: false, avatar: "toan_2_avatar_url.jpg" },
];

export default users;
