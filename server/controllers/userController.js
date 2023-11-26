const ApiError = require("../error/ApiError");
const { User } = require("../models/models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const generateJwt = (id, login, role) => {
  return jwt.sign({ id, login, role }, process.env.SECRET_KEY, {
    expiresIn: "24h",
  });
};

class UserController {
  async registration(req, res, next) {
    const { login, password, firstName, lastName, middleName } = req.body;
    if (!login || !password) {
      return next(ApiError.badRequest("Некорректный login или password"));
    }
    if (!firstName || !lastName || !middleName) {
      return next(ApiError.badRequest("Требуется указать полное ФИО"));
    }
    const candidate = await User.findOne({ where: { login } });
    if (candidate) {
      return next(
        ApiError.badRequest("Пользователь с таким login уже существует"),
      );
    }
    const hashPassword = await bcrypt.hash(password, 5);
    const user = await User.create({ ...req.body, password: hashPassword });
    const token = generateJwt(user.id, user.login, user.role);
    return res.json({ token });
  }
  async login(req, res, next) {
    const { login, password } = req.body;
    const user = await User.findOne({ where: { login } });
    if (!user) {
      return next(
        ApiError.badRequest("Пользователь с таким логином не найден"),
      );
    }
    let comparePassword = bcrypt.compareSync(password, user.password);
    if (!comparePassword) {
      return next(ApiError.badRequest("Указан неверный пароль"));
    }
    const token = generateJwt(user.id, user.login, user.role);
    return res.json({ token });
  }
  async check(req, res, next) {
    const token = generateJwt(req.user.id, req.user.login, req.user.role);
    res.json({ token });
  }
}

module.exports = new UserController();
