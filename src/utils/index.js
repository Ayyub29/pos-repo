const Joi = require('joi');
const NotFoundError = require('../exceptions/NotFoundError');

function createuuid() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

const validateUuid = (id) => {
  const validator = Joi.object({ id: Joi.string().guid() });
  const validate = validator.validate({ id });
  if (validate.error) {
    throw new NotFoundError('id tidak valid');
  }
};

module.exports = { createuuid, validateUuid };
