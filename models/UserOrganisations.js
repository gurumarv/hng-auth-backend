const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserOrganisations = sequelize.define('UserOrganisations', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  orgId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  timestamps: true,
  tableName: 'UserOrganisations'
});

module.exports = UserOrganisations;
