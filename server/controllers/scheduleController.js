const { Schedule } = require("../models/models");
const ApiError = require("../error/ApiError");
const { Op } = require("sequelize");

class ScheduleController {
  async create(req, res, next) {
    try {
      const newSchedule = await Schedule.create({ ...req.body });
      return res.json(newSchedule);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getBetween(req, res, next) {
    const { startDate, endDate } = req.params;
    try {
      const schedule = await Schedule.findAll({
        where: {
          date: {
            [Op.between]: [startDate, endDate],
          },
        },
      });
      return res.json(schedule);
    } catch (e) {
      return next(ApiError.badRequest(e.message));
    }
  }
  async getExact(req, res, next) {
    const { date } = req.params;
    try {
      const schedule = await Schedule.findAll({ where: { date } });
      return res.json(schedule);
    } catch (e) {
      return next(ApiError.badRequest(e.message));
    }
  }
}

module.exports = new ScheduleController();
