const express = require('express');
const router = express.Router();
const {
  quoteName,
  selectQuery,
  insertQuery,
  updateQuery,
  deleteQuery,
  functionQuery,
} = require('./dynamic-controller');

const RECORD_LIMIT = process.env.RECORD_LIMIT || 1000;

// Create a connection to the database
const connection = await createConnection();

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
  const select = req.query.select || '*';
  const order = req.query.order || '';
  const filters = req.query.filters;
  const limit = req.query.limit || RECORD_LIMIT;
  const offset = req.query.offset || 0;

  // Build the query
  const query = selectQuery({
    schema: 'public',
    name: table,
    select,
    order,
    filters,
    limit,
    offset,
  });
  // Execute the query
  const results = await executeSelectQuery(query, [], connection);

  res.json(results);
});

router.post('/:table', async (req, res) => {
  // Get the table name from the route
  const table = req.params.table;

  // Get the project data from the request body
  const project = JSON.parse(req.body);

  // Build the insert query
  const query = insertQuery({
    schema: 'public',
    name: table,
    columns: ['id', 'name'],
  });

  // Bind the project data to the query parameters
  const parameters = [project.id, project.name];

  // Execute the query
  await executeInsertQuery(query, parameters, connection);

  // Redirect the user to the projects page
  res.redirect(`/` + table);
});

// Export the router
module.exports = router;
