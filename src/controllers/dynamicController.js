// Desc: This file contains the functions to build the SQL queries dynamically

// Quote name function
function quoteName(s) {
  return '[' + s.replace(/]/g, ']]') + ']';
}

// Select qurey builder
function selectQuery({ table, filters, select, order, limit, offset }) {
  // example parameters
  // table = { schema: "dbo", name: "table1" }
  // filters = {
  //   column1: { op: { literal: '=', sql: '=' }, value: 'value1' },
  //   column2: { op: { literal: '=', sql: '=' }, value: 'value2' },
  // };
  // select = ["column1", "column2", "column3"]
  // order = [{ identifier: "column1", dir: "ASC" }, { identifier: "column2", dir: "DESC" }]
  // limit = 10
  // offset = 0

  const builder = ['SELECT'];

  if (limit) {
    builder.push(`TOP ${limit}`);
  }
  // if columns are not specified, select all columns
  if (!select) {
    builder.push('*');
  } else {
    // example output ["SELECT", "column1", "column2", "column3"]
    builder.push(select?.map((s) => quoteName(s)).join(', '));
  }

  // add FROM clause
  builder.push(`FROM ${quoteName('dbo')}.${quoteName(table)}`);
  // add WHERE clause using whereFragment function
  builder.push(whereFragment(filters));

  if (order.length > 0) {
    builder.push(
      'ORDER BY ' +
        order.map((o) => quoteName(o.identifier) + (o.dir ? ` ${o.dir}` : '')).join(', ')
    );
  }

  if (offset) {
    builder.push(`OFFSET ${offset}`);
  }

  return builder.join(' ');
}

// Insert query builder
function insertQuery(table, columns) {
  // example parameters
  // table = { schema: "dbo", name: "table1" }
  // columns = ["column1", "column2", "column3"]

  const builder = ['INSERT INTO'];
  // declare the table name
  builder.push(`${quoteName(table.schema)}.${quoteName(table.name)}`);

  if (columns.length > 0) {
    builder.push(`(${columns.map((s) => quoteName(s)).join(', ')})`);
    builder.push(`VALUES (${columns.map(() => '?').join(', ')})`);
  } else {
    // if columns are not specified, insert default values
    builder.push('DEFAULT VALUES');
  }

  return builder.join(' ');
}

// Update query builder
function updateQuery(table, vals, filters) {
  // example parameters
  // table = { schema: "dbo", name: "table1" }
  // vals = ["column1", "column2", "column3"]
  // filters = {
  //   column1: { op: { literal: '=', sql: '=' }, value: 'value1' },
  //   column2: { op: { literal: '=', sql: '=' }, value: 'value2' },
  // };

  const builder = ['UPDATE'];
  // set the table name
  builder.push(`${quoteName(table.schema)}.${quoteName(table.name)}`);
  // set the values to be updated
  builder.push('SET ' + vals.map((v) => `${quoteName(v)} = ?`).join(', '));
  // add WHERE clause using whereFragment function
  builder.push(whereFragment(filters));

  return builder.join(' ');
}

// Delete query builder
function deleteQuery({ table, filters }) {
  // example parameters
  // table = { schema: "dbo", name: "table1" }
  // filters = {
  //   column1: { op: { literal: '=', sql: '=' }, value: 'value1' },
  //   column2: { op: { literal: '=', sql: '=' }, value: 'value2' },
  // };
  const builder = ['DELETE FROM'];
  // set the table name
  builder.push(`${quoteName('dbo')}.${quoteName(table)}`);
  // add WHERE clause using whereFragment function
  builder.push(whereFragment(filters));

  return builder.join(' ');
}

// Function query builder
// This function is used for both stored procedures and functions
function functionQuery(routine) {
  // example parameters
  // routine = { schema: "dbo", name: "function1", parameters: [{ name: "param1", type: "int" }, { name: "param2", type: "varchar" }], returnType: "TABLE" }

  let builder;

  if (routine.isFunction()) {
    if (routine.returnType !== 'TABLE') {
      builder = ['SELECT'];
    } else {
      builder = ['SELECT * FROM'];
    }

    builder.push(`${quoteName(routine.schema)}.${quoteName(routine.name)}`);
    builder.push('(');
    const questionParams = Array(routine.parameters.length).fill('?');
    builder.push(questionParams.join(', '));
    builder.push(')');
  } else {
    builder = ['{call'];
    builder.push(`${quoteName(routine.schema)}.${quoteName(routine.name)}`);
    builder.push('(');
    const questionParams = Array(routine.parameters.length).fill('?');
    builder.push(questionParams.join(', '));
    builder.push(')}');
  }

  return builder.join(' ');
}

const operatorCase = (value) => {
  let operator;
  switch (value) {
    case 'eq':
      operator = '=';
      break;
    case 'neq':
      operator = '<>';
      break;
    case 'gt':
      operator = '>';
      break;
    case 'lt':
      operator = '<';
      break;
    case 'gte':
      operator = '>=';
      break;
    case 'lte':
      operator = '<=';
      break;
    case 'like':
      operator = 'LIKE';
      break;
    case 'nlike':
      operator = 'NOT LIKE';
      break;
    case 'in':
      operator = 'IN';
      break;
    case 'nin':
      operator = 'NOT IN';
      break;
    default:
      throw new Error('Invalid operator: ' + filter.operator);
  }
  return operator;
};

// Where clause builder
function whereFragment(filters) {
  if (Array.isArray(filters)) {
    const whereClause = filters
      .map((filter) => {
        const operator = operatorCase(filter.operator);
        return `${quoteName(filter.column)} ${operator} ? @${filter.column}`;
      })
      .join(' AND ');

    return `WHERE ${whereClause}`;
  } else if (filters) {
    const operator = operatorCase(filters.operator);
    return `WHERE ${quoteName(filters.column)} ${operator} @${filters.column}`;
  } else {
    return '';
  }
}

// Export the functions as a module
module.exports = {
  quoteName,
  selectQuery,
  insertQuery,
  updateQuery,
  deleteQuery,
  functionQuery,
};
