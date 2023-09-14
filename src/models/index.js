const sequelize = require('../../config/database');

const defineDynamicModel = (table) => {
  return sequelize.define(table, {}, { timestamps: false });
};

module.exports = {
  defineDynamicModel,
};
