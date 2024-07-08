const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Organisation } = require('../models/associations'); // Updated to import from associations
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();

// User Registration
router.post('/register', [
  body('firstName').not().isEmpty().withMessage('First name is required'),
  body('lastName').not().isEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }

  const { firstName, lastName, email, password, phone } = req.body;

  try {
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ errors: [{ field: 'email', message: 'User already exists' }] });
    }

    user = User.build({
      firstName,
      lastName,
      email,
      password,
      phone
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // Create organisation for the user
    const organisationName = `${firstName}'s Organisation`;
    const organisation = await Organisation.create({ 
      name: organisationName,
      creatorId: user.userId  // Set the creatorId to the user's ID
    });

    // Add user to organisation
    await user.addOrganisation(organisation);

    const payload = {
      user: {
        id: user.userId
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// User Login
router.post('/login', [
    body('email').isEmail().withMessage('Please include a valid email'),
    body('password').exists().withMessage('Password is required'),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }
  
    const { email, password } = req.body;
  
    try {
      let user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          status: 'Bad request',
          message: 'Authentication failed',
          statusCode: 401
        });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          status: 'Bad request',
          message: 'Authentication failed',
          statusCode: 401
        });
      }
  
      const payload = {
        user: {
          id: user.userId
        }
      };
  
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '5h' },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: {
              accessToken: token,
              user: {
                userId: user.userId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
              }
            }
          });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });


module.exports = router;
