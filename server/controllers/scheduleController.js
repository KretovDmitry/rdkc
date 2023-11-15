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
  async getCurrentMonth(req, res, next) {
    const { startDate, endDate } = req.query;
    try {
      const schedule = await Schedule.findAll({
        where: {
          startDate: {
            [Op.and]: {
              [Op.gte]: startDate,
              [Op.lte]: endDate,
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
