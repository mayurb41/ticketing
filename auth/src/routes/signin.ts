import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { Password } from '../services/password';
// import { RequestValidationError } from '../errors/request-validation-error';
import { validateRequest, BadRequestError } from '@rpdtickets/common';

const router = express.Router();

router.post(
  '/api/users/signin',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('You must supply a password'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const {email, password} = req.body;

    const existingUser = await User.findOne({email});
    if(!existingUser){
      console.log('Email not in use ');
      // return res.send({});
      throw new BadRequestError('Email not in use');
    }

    const passwordMatch = await Password.compare(existingUser.password, password)
    if(!passwordMatch){
      throw new BadRequestError("Invalid credentails")
    }
    //Generate JWT
    const userJwt = jwt.sign(
      {
        id: existingUser._id,
        email: existingUser.email,
      },
      process.env.JWT_KEY!
    );

    //Store it in session object
    req.session = { jwt: userJwt };
    res.status(200).send(existingUser);
  }
);

export { router as signinRouter };
