const {
  ReanimationPeriod,
  CurrentReanimationPeriod,
} = require("../models/models");
const { Request } = require("../models/models");
const ApiError = require("../error/ApiError");

class ReanimationPeriodsController {
  async testCRP(req, res, next) {
    try {
      const newReanimationPeriod = await CurrentReanimationPeriod.create({
        ...req.body,
      });
      return res.json({
        id: newReanimationPeriod.id,
        newReanimationPeriod,
      });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async testRP(req, res, next) {
    try {
      const newReanimationPeriod = await ReanimationPeriod.create({
        ...req.body,
      });
      return res.json({
        id: newReanimationPeriod.id,
        newReanimationPeriod,
      });
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async create(req, res, next) {
    try {
      const { dataValues } = await CurrentReanimationPeriod.findOne({
        where: { emiasPatientId: req.body.emiasPatientId },
        attributes: {
          exclude: ["id", "createdAt", "updatedAt"],
        },
      });
      const doesExist = await ReanimationPeriod.findOne({
        where: { emiasPatientId: req.body.emiasPatientId },
      });
      if (!doesExist || dataValues.emiasId !== doesExist.dataValues.emiasId) {
        // Создаём РП, если он отсутствует или был у пациента раньше
        // даже если он загрузился с ошибкой
        const newReanimationPeriod = await ReanimationPeriod.create({
          ...dataValues,
        });
        return res.json({
          id: newReanimationPeriod.id,
          newReanimationPeriod,
        });
      } else {
        if (!dataValues.error && doesExist.dataValues.error) {
          // Заменяем ошибочный РП новым, если он сам загрузился без ошибок
          // Может пригодиться, если создали новую заявку, а мы уже сохранили ошибочные данные до этого
          const newReanimationPeriod = await ReanimationPeriod.create({
            ...dataValues,
          });
          await Request.update(
            { ReanimationPeriodId: newReanimationPeriod.id },
            {
              where: {
                ReanimationPeriodId: doesExist.dataValues.id,
              },
            },
          );
          await ReanimationPeriod.destroy({
            where: { id: doesExist.dataValues.id },
          });
          return res.json({
            id: newReanimationPeriod.id,
            newReanimationPeriod,
          });
        }
        return res.json({
          // Возвращаем существующий РП, даже если он с ошибкой
          // Если так и не удалось получить корректные данные
          id: doesExist.dataValues.id,
          existingReanimationPeriod: doesExist.dataValues,
        });
      }
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getAll(req, res, next) {
    try {
      const reanimationPeriods = await CurrentReanimationPeriod.findAll();
      return res.json(reanimationPeriods);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
  async getOne(req, res, next) {
    const { status } = req.params;
    try {
      const patient = await Request.findOne({ where: { id } });
      return res.json(patient);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }
}

module.exports = new ReanimationPeriodsController();
