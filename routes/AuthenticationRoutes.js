import express from 'express'
import { addRecoveryEmail, changePassword, loginUser, registerUser } from '../controller/AuthenticationController.js';

const AuthenticationRoutes = express.Router();

AuthenticationRoutes.route('/').post(registerUser).get(loginUser).patch(addRecoveryEmail)
AuthenticationRoutes.route('/password').patch(changePassword)

export default AuthenticationRoutes;