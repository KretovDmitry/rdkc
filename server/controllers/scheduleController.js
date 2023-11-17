const { Schedule, Staff } = require("../models/models");
const ApiError = require("../error/ApiError");
const { Op } = require("sequelize");

class ScheduleController {
  async create(req, res, next) {
    try {
      const { start, end } = req.body;
      if (end <= start) {
        return res
          .status(422)
          .json({ message: "Окончание смены не может быть до её начала" });
      }
      const newSchedule = await Schedule.create({ ...req.body });
      return res.json({ newSchedule });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async get(req, res, next) {
    const { start, end } = req.query;
    try {
      const schedule = await Schedule.findAll({
        include: [
          {
            model: Staff,
            required: true,
          },
        ],
        where: {
          start: {
            [Op.and]: {
              [Op.gte]: start,
              [Op.lte]: end,
            },
          },
        },
      });
      return res.json(schedule);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
}

module.exports = new ScheduleController();
