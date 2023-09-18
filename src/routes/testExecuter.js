const express = require('express');
const router = express.Router();
const {
  quoteName,
  selectQuery,
  insertQuery,
  updateQuery,
  deleteQuery,
  functionQuery,
} = require('../controllers/dynamicController');

const RECORD_LIMIT = process.env.RECORD_LIMIT || 1000;

// Create a connection to the database
const { createConnection } = require('../../config/database');

// req query params
// select: string
// order: string
// filters: string
// limit: number
// offset: number
// examples of query params
// select: id,name
// order: name
// filters: name=eq.project1
// example url with query params
// http://localhost:3000/projects?select=id,name&order=name&filters=name=eq.project1

// Define the routes
router.get('/:table', async (req, res) => {
  // Get the table name from the route
  const table = req.params.table;

  // Get the query parameters
  const select = req.query.select;
  const order = req.query.order || '';
  const filters = req.query.filters || '';
  const limit = req.query.limit || RECORD_LIMIT;
  const offset = req.query.offset || 0;

  // Build the query
  const query = selectQuery({
    table,
    filters,
    select,
    order,
    limit,
    offset,
  });

  // Execute the query
  try {
    const result = await createConnection().then((pool) => {
      return pool.request().query(query);
    });
    res.status(200).json(result.recordset);
  } catch (error) {
    res.status(error.number).json({ error: error.originalError.info });
  }
});

const conditionsGeneratior = (filters) => {
  if (Array.isArray(filters)) {
    filters.map((filter) => {
      // Use regular expressions to split the filter string
      const matches = filter.match(/([^=]+)=([^=.]+)\.([^=]+)/);

      if (!matches || matches.length !== 4) {
        throw new Error('Invalid filter format: ' + filter);
      }
      const column = matches[1];
      const operator = matches[2];
      const value = matches[3];
      return { column, operator, value };
    });
  } else {
    const matches = filters.match(/([^=]+)=([^=.]+)\.([^=]+)/);

    if (!matches || matches.length !== 4) {
      throw new Error('Invalid filter format: ' + filters);
    }
    const column = matches[1];
    const operator = matches[2];
    const value = matches[3];
    return { column, operator, value };
  }
};

router.delete('/:table', async (req, res) => {
  // Execute the query with parameterized placeholders
  try {
    const table = req.params.table;
    const filters = req.query.filters;

    if (!table) {
      res.status(400).json({ error: 'Table name is required' });
      return;
    }
    if (!filters) {
      res.status(400).json({ error: 'Filters are required' });
      return;
    }

    // Convert the filters into an array of objects
    const filterConditions = conditionsGeneratior(filters);
    // Build the query using the filter conditions
    const query = deleteQuery({
      table,
      filters: filterConditions,
    });
    // Create a parameter object based on the filter conditions
    const params = {};
    // if filterConditions is an array
    if (Array.isArray(filterConditions)) {
      filterConditions.forEach((condition, index) => {
        params[`@${condition.column}${index}`] = condition.value;
      });
    } else {
      params[`@${filterConditions.column}`] = filterConditions.value;
    }
    const pool = await createConnection();
    const request = pool.request();

    // Add parameters to the request
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });
    const result = await request.query(query);
    if (!result) {
      res.status(400).json({ error: 'Delete failed' });
      return;
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(error.number).json({ error: error.message });
  }
});

// router.post('/:table', async (req, res) => {
//   // Get the table name from the route
//   const table = req.params.table;

//   // Get the project data from the request body
//   const project = JSON.parse(req.body);

//   // Build the insert query
//   const query = insertQuery({
//     schema: 'public',
//     name: table,
//     columns: ['id', 'name'],
//   });

//   // Bind the project data to the query parameters
//   const parameters = [project.id, project.name];

//   // Execute the query
//   await executeInsertQuery(query, parameters, connection);

//   // Redirect the user to the projects page
//   res.redirect(`/` + table);
// });

// Export the router
module.exports = router;
