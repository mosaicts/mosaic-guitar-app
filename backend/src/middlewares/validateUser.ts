import { Request, Response, NextFunction } from 'express';
import { body, FieldValidationError, validationResult } from 'express-validator';
import { User } from '../entities/User.postgres';
import handleGetRepository from '../utils/handleGetRepository';

const userRepository = handleGetRepository(User);

export const validateUsername = body('username').notEmpty().withMessage('Username is required');

export const validateEmail = body('email')
  .notEmpty()
  .withMessage('Email is required')
  .isEmail() // Validator: check if it's a valid email
  .normalizeEmail() // Sanitizer: normalize the email
  .trim() // Sanitizer: remove leading/trailing spaces
  .withMessage('Please provide a valid email address'); // Custom error message

export const validatePassword = body('password')
  .notEmpty()
  .withMessage('Password must not be empty')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long');

export const validateConfirmPassword = body('confirmPassword')
  .notEmpty()
  .withMessage('Confirm Password must not be empty')
  .custom((value, { req }) => {
    return value === req.body.password;
  });

export const checkUsernameInUse = body('username').custom((value) =>
  userRepository.findOne({ where: { username: value } }).then((user) => {
    if (user) {
      throw new Error('Username already in use');
    }
  })
);

export const checkEmailInUse = body('email').custom((value) =>
  userRepository.findOne({ where: { email: value } }).then((user) => {
    if (user) {
      throw new Error('Email already in use');
    }
  })
);

export const checkConfirmPassword = body('confirmPassword').custom((value) =>
  userRepository.findOne({ where: { email: value } }).then((user) => {
    if (user) {
      throw new Error('Email already in use');
    }
  })
);

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Group errors by field name
    const formattedErrors = {};

    errors.array().forEach((error: FieldValidationError) => {
      if (!formattedErrors[error.path]) {
        formattedErrors[error.path] = [];
      }

      formattedErrors[error.path].push(error.msg);
    });

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors
    });
  }

  next();
};

export const checkRegisterDataExist = (req: Request, res: Response, next: NextFunction) => {
  const { username, email } = req.body;

  userRepository
    .findOne({ where: { username } })
    .then((user) => {
      if (user) {
        res.status(400).json({ success: false, message: 'Username already exists' });
        return Promise.reject('Username already exists');
        // next("Username already existed");
      } else {
        return userRepository.findOne({ where: { email } });
      }
    })
    .then((user) => {
      if (user) {
        res.status(400).json({ success: false, message: 'Email already in use' });
        return Promise.reject('Email already in use');
      } else {
        next();
      }
    })
    .catch(next);
};
