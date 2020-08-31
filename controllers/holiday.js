import { Holiday as holiday } from '../models'

export async function index(req, res) {
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
}
export function getById(req, res) {
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
}
export function add(req, res) {
  return Holiday.create({
    class_name: req.body.class_name,
  })
    .then((holiday) => res.status(201).send(holiday))
    .catch((error) => res.status(400).send(error))
}
export function update(req, res) {
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
}
export function destroy(req, res) {
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
}
