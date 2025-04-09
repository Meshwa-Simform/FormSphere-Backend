import { Router } from 'express';
import { checkAuthentication, login, refreshToken, register } from './controllers';
import { validateRegister } from './middleware';

const router = Router();

router.post('/signup', validateRegister, register);
router.post('/login', login);
router.post('/refreshtoken', refreshToken);
router.get('/authenticate', checkAuthentication);

export default router;
