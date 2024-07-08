const express = require('express');
const { connectDB, sequelize } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const organisationRoutes = require('./routes/organisation');
const authMiddleware = require('./middlewares/authMiddleware');

const app = express();

// Middleware
app.use(express.json());

// Connect to the database and sync
const startServer = async () => {
  try {
    // Ensure database is connected
    await connectDB();
    console.log('PostgreSQL Connected');

    // Sync Sequelize models with database
    await sequelize.sync(); // Remove { force: true } in production

    // Routes
    app.use('/auth', authRoutes);
    app.use('/api', organisationRoutes);

    // Protected Route Example
    app.get('/api/protected', authMiddleware, (req, res) => {
      res.send('This is a protected route');
    });

    // Global Error Handler
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).send('Something broke!');
    });

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Unable to start the server:', err);
    process.exit(1);
  }
};

startServer();
module.exports = app;
