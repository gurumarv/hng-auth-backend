const express = require('express');
const auth = require('../middlewares/authMiddleware');
const { body, validationResult } = require('express-validator');
const Organisation = require('../models/Organisation');
const User = require('../models/User');
const authenticateToken = require('../middlewares/authMiddleware');
const UserOrganisations = require('../models/UserOrganisations');

const router = express.Router();

// Get Organisations for Logged In User
router.get('/my-organisations', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: Organisation
    });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user.Organisations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// [GET] /api/organisations
router.get('/organisations', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.id;
  
      // Fetch organisations created by the user
      const createdOrganisations = await Organisation.findAll({
        where: { creatorId: userId }
      });
  
      // Fetch organisations the user belongs to
      const user = await User.findByPk(userId, {
        include: {
          model: Organisation
        }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const belongingOrganisations = user.Organisations;
  
      // Combine the two sets of organisations, ensuring uniqueness
      const allOrganisations = [...createdOrganisations, ...belongingOrganisations];
      const uniqueOrganisations = Array.from(new Set(allOrganisations.map(org => org.orgId)))
                                      .map(orgId => {
                                        return allOrganisations.find(org => org.orgId === orgId);
                                      });
  
      // Format the response
      const organisationsData = uniqueOrganisations.map(org => ({
        orgId: org.orgId,
        name: org.name,
        description: org.description
      }));
  
      res.status(200).json({
        status: 'success',
        message: 'Organisations retrieved successfully',
        data: {
          organisations: organisationsData
        }
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  });

  router.get('/organisations/:orgId', authenticateToken, async (req, res) => {
    const { orgId } = req.params;
  
    try {
      // Fetch the organization by orgId
      const organisation = await Organisation.findByPk(orgId, {
        include: [{
          model: User,
          through: { attributes: [] } // Exclude join table attributes
        }]
      });
  
      // If organisation is not found
      if (!organisation) {
        return res.status(404).json({
          status: 'error',
          message: 'Organisation not found'
        });
      }
  
      // Check if the authenticated user is the creator of the organisation or belongs to it
      const isCreator = organisation.creatorId === req.user.id;
      const isMember = organisation.Users.some(user => user.userId === req.user.id);
  
      if (!isCreator && !isMember) {
        return res.status(403).json({
          status: 'error',
          message: 'Access denied'
        });
      }
  
      // Successful response
      res.status(200).json({
        status: 'success',
        message: 'Organisation retrieved successfully',
        data: {
          orgId: organisation.orgId,
          name: organisation.name,
          description: organisation.description
        }
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  });

// Create a new organisation
router.post('/organisations', [
    auth,
    body('name').not().isEmpty().withMessage('Name is required'),
    body('description').optional().isString()
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'Bad Request',
        message: 'Client error',
        errors: errors.array()
      });
    }
  
    const { name, description } = req.body;
  
    try {
      // Create a new organisation
      const newOrganisation = await Organisation.create({
        name,
        description,
        creatorId: req.user.id
      });
  
      res.status(201).json({
        status: 'success',
        message: 'Organisation created successfully',
        data: {
          orgId: newOrganisation.orgId,
          name: newOrganisation.name,
          description: newOrganisation.description
        }
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  });

// Add a user to a particular organisation
router.post('/organisations/:orgId/users', [
    auth,
    body('userId').not().isEmpty().withMessage('User ID is required')
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'Bad Request',
        message: 'Client error',
        errors: errors.array()
      });
    }
  
    const { orgId } = req.params;
    const { userId } = req.body;
  
    try {
      // Check if the organisation exists
      const organisation = await Organisation.findByPk(orgId);
      if (!organisation) {
        return res.status(404).json({
          status: 'error',
          message: 'Organisation not found'
        });
      }
  
      // Check if the user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User not found'
        });
      }
  
      // Add the user to the organisation
      await UserOrganisations.create({ userId, orgId });
  
      res.status(200).json({
        status: 'success',
        message: 'User added to organisation successfully'
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  });

// [GET] /api/users/:id
router.get('/users/:id', authenticateToken, async (req, res) => {
  const requestedUserId = req.params.id;

  try {
      // Fetch the user by userId
      const user = await User.findByPk(requestedUserId);
      console.log('Requested User:', user);

      // If user is not found
      if (!user) {
          return res.status(404).json({
              status: 'error',
              message: 'User not found'
          });
      }

      // Fetch organisations where the authenticated user is the creator
      const userOrgs = await Organisation.findAll({
          where: { creatorId: req.user.id },
          include: {
              model: User,
              attributes: ['userId'], // Ensure we use 'userId' here
              through: { attributes: [] } // Ensure the join table attributes are not included
          }
      });
      console.log('User Organisations:', JSON.stringify(userOrgs, null, 2));

      // Check if the authenticated user is the same as the requested user or belongs to any organization created by the authenticated user
      const isAuthorized = (user.userId === req.user.id) || userOrgs.some(org => org.Users.some(u => u.userId === req.user.id));
      console.log('Is Authorized:', isAuthorized);

      // If not authorized
      if (!isAuthorized) {
          return res.status(403).json({
              status: 'error',
              message: 'Access denied'
          });
      }

      // Successful response
      res.status(200).json({
          status: 'success',
          message: 'User retrieved successfully',
          data: {
              userId: user.userId,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone,
          }
      });
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
  }
});


module.exports = router;
