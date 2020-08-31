const holiday = require('../models').Holiday

module.exports = {
  async index(req, res) {
    return holiday
      .findAll({
        order: [['created_at', 'DESC']],
      })
      .then((holidays) => {
        res.status(200).send(holidays)
      })
      .catch((error) => {
        res.status(400).send(error)
      })
  },

  getById(req, res) {
    return Holiday.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          as: 'students',
        },
      ],
    })
      .then((holiday) => {
        if (!holiday) {
          return res.status(404).send({
            message: 'Holiday Not Found',
          })
        }
        return res.status(200).send(holiday)
      })
      .catch((error) => {
        console.log(error)
        res.status(400).send(error)
      })
  },

  add(req, res) {
    return Holiday.create({
      class_name: req.body.class_name,
    })
      .then((holiday) => res.status(201).send(holiday))
      .catch((error) => res.status(400).send(error))
  },

  update(req, res) {
    return Holiday.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          as: 'students',
        },
      ],
    })
      .then((holiday) => {
        if (!holiday) {
          return res.status(404).send({
            message: 'Holiday Not Found',
          })
        }
        return holiday
          .update({
            class_name: req.body.class_name || holiday.class_name,
          })
          .then(() => res.status(200).send(holiday))
          .catch((error) => res.status(400).send(error))
      })
      .catch((error) => res.status(400).send(error))
  },

  delete(req, res) {
    return Holiday.findByPk(req.params.id)
      .then((holiday) => {
        if (!holiday) {
          return res.status(400).send({
            message: 'Holiday Not Found',
          })
        }
        return holiday
          .destroy()
          .then(() => res.status(204).send())
          .catch((error) => res.status(400).send(error))
      })
      .catch((error) => res.status(400).send(error))
  },
}
