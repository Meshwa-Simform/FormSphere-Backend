import { Router } from 'express';
import { checkAuthentication, login, logout, refreshToken, register } from './controllers.ts';
import { validateLogin, validateRegister } from './middleware.ts';

const router = Router();

router.post('/signup', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.post('/refreshtoken', refreshToken);
router.get('/authenticate', checkAuthentication);

export default router;
