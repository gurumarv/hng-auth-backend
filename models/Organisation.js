const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Organisation = sequelize.define('Organisation', {
  orgId: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
  },
  creatorId: {
    type: DataTypes.UUID,
    allowNull: false, // Adjust as per your requirements
  },
}, {
  timestamps: true,
  tableName: 'Organisations'
});

module.exports = Organisation;
