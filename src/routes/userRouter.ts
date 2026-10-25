import { Router } from 'express';
import { UserController } from '../controllers/userController.ts';
import { authenticate } from '../middlewares/authenticate.ts';
import { authorize } from '../middlewares/authorize.ts';
import { validate } from '../middlewares/validate.ts';
import { idParams } from '../dtos/stallDto.ts';
import { createUserBody } from '../dtos/userDto.ts';

const userRouter = Router();
const userController = new UserController();

userRouter.get('/', authenticate, authorize('admin'), (req, res, next) => {
  // #swagger.security = [{ "bearerAuth": [] }]
  // #swagger.responses[200] = { description: 'Daftar user' }
  // #swagger.responses[401] = { description: 'Belum login / token tidak valid' }
  // #swagger.responses[403] = { description: 'Hanya admin' }
  return userController.getUsers(req, res, next);
});

userRouter.get(
  '/:id',
  authenticate,
  authorize('admin'),
  validate({ params: idParams }),
  (req, res, next) => {
    // #swagger.security = [{ "bearerAuth": [] }]
    // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
    // #swagger.responses[200] = { description: 'Detail user' }
    // #swagger.responses[401] = { description: 'Belum login / token tidak valid' }
    // #swagger.responses[403] = { description: 'Hanya admin' }
    // #swagger.responses[404] = { description: 'User tidak ditemukan' }
    return userController.getUserById(req, res, next);
  },
);

userRouter.post(
  '/',
  authenticate,
  authorize('admin'),
  validate({ body: createUserBody }),
  (req, res, next) => {
    // #swagger.security = [{ "bearerAuth": [] }]
    // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/UserInput' } }
    // #swagger.responses[201] = { description: 'User dibuat' }
    // #swagger.responses[400] = { description: 'Validasi gagal' }
    // #swagger.responses[401] = { description: 'Belum login / token tidak valid' }
    // #swagger.responses[403] = { description: 'Hanya admin' }
    // #swagger.responses[409] = { description: 'Email sudah terdaftar' }
    return userController.createUser(req, res, next);
  },
);

export { userRouter };