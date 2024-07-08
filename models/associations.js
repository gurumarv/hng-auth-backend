const User = require('./User');
const Organisation = require('./Organisation');
const UserOrganisations = require('./UserOrganisations');

User.belongsToMany(Organisation, { through: UserOrganisations, foreignKey: 'userId' });
Organisation.belongsToMany(User, { through: UserOrganisations, foreignKey: 'orgId' });

module.exports = { User, Organisation, UserOrganisations };
