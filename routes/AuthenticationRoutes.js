import express from 'express'
import { addRecoveryEmail, loginUser, registerUser } from '../controller/AuthenticationController.js';

const AuthenticationRoutes = express.Router();

AuthenticationRoutes.route('/').post(registerUser).get(loginUser).patch(addRecoveryEmail)

export default AuthenticationRoutes;