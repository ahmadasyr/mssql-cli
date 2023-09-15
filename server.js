const express = require('express');
const app = express();
const cors = require('cors');
const testExecuter = require('./src/routes/testExecuter');

app.use(cors());
app.use(express.json());

// Use dynamic routes
app.use('/api', testExecuter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
