import { Router } from 'express';
import { validate } from '../middlewares/validate.ts';
import { authenticate } from '../middlewares/authenticate.ts';
import { registerBody, loginBody } from '../dtos/authDto.ts';
import { register, login, me } from '../controllers/authController.ts';

export const authRouter = Router();

authRouter.post('/register', validate({ body: registerBody }), (req, res, next) => {
  // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/RegisterInput' } }
  // #swagger.responses[201] = { description: 'Registrasi berhasil (role otomatis customer)' }
  // #swagger.responses[400] = { description: 'Validasi gagal' }
  // #swagger.responses[409] = { description: 'Email sudah terdaftar' }
  return register(req, res, next);
});

authRouter.post('/login', validate({ body: loginBody }), (req, res, next) => {
  // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/LoginInput' } }
  // #swagger.responses[200] = { description: 'Login berhasil, balikin token JWT' }
  // #swagger.responses[400] = { description: 'Validasi gagal' }
  // #swagger.responses[401] = { description: 'Email atau password salah' }
  return login(req, res, next);
});

authRouter.get('/me', authenticate, (req, res, next) => {
  // #swagger.security = [{ "bearerAuth": [] }]
  // #swagger.responses[200] = { description: 'Data user dari token' }
  // #swagger.responses[401] = { description: 'Belum login / token tidak valid' }
  return me(req, res, next);
});