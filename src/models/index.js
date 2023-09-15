const sql = require('mssql');

const defineDynamicModel = (table) => {
  return sequelize.define(table, {}, { timestamps: false });
};

module.exports = {
  defineDynamicModel,
};
