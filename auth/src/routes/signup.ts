import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { validateRequest, BadRequestError } from '@rpdtickets/common';
import { User } from '../models/user';
// import { RequestValidationError } from '../errors/request-validation-error';
// import { DatabaseConnectionError } from "../errors/database-connection-error";

const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Email in use ');
      // return res.send({});
      throw new BadRequestError('Email already in use');
    }

    const user = User.build({ email, password });
    await user.save();

    //Generate JWT
    const userJwt = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_KEY!
    );

    //Store it in session object
    req.session = { jwt: userJwt };

    console.log('Creating a user...');
    // throw new DatabaseConnectionError();

    res.status(201).send(user);
  }
);

export { router as signupRouter };
