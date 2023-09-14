const express = require('express');
const app = express();
const cors = require('cors');
const dynamicRoutes = require('./src/routes/dynamicRoutes');

app.use(cors());
app.use(express.json());

// Use dynamic routes
app.use('/:table', dynamicRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
