import express from 'express'

const AuthenticationRoutes = express.Router();

AuthenticationRoutes.route('/').get((req, res) => {
    res.json({ message: 'This is the authentication route' });
})

export default AuthenticationRoutes;