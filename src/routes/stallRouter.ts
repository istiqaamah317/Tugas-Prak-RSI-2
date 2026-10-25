import { ReviewController } from '../controllers/reviewController.ts';
import { createReviewBody } from '../dtos/reviewDto.ts';
import { Router } from 'express';
import { StallController } from '../controllers/stallController.ts';
import { authenticate } from '../middlewares/authenticate.ts';
import { authorize } from '../middlewares/authorize.ts';
import { validate } from '../middlewares/validate.ts';
import { idParams, listStallsQuery, createStallBody, updateStallBody } from '../dtos/stallDto.ts';

const stallRouter = Router();
const stallController = new StallController();
const reviewController = new ReviewController();

stallRouter.get('/', validate({ query: listStallsQuery }), (req, res, next) => {
  // #swagger.parameters['search']   = { in: 'query', type: 'string' }
  // #swagger.parameters['category'] = { in: 'query', type: 'string' }
  // #swagger.parameters['page']     = { in: 'query', type: 'integer' }
  // #swagger.parameters['limit']    = { in: 'query', type: 'integer' }
  // #swagger.responses[200] = { description: 'Daftar warung (filter + pagination)' }
  // #swagger.responses[400] = { description: 'Validasi gagal' }
  return stallController.getStalls(req, res, next);
});

stallRouter.post(
  '/',
  authenticate,
  authorize('owner', 'admin'),
  validate({ body: createStallBody }),
  (req, res, next) => {
    // #swagger.security = [{ "bearerAuth": [] }]
    // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/StallInput' } }
    // #swagger.responses[201] = { description: 'Warung dibuat' }
    // #swagger.responses[400] = { description: 'Validasi gagal' }
    // #swagger.responses[401] = { description: 'Belum login / token tidak valid' }
    // #swagger.responses[403] = { description: 'Role tidak punya akses' }
    return stallController.createStall(req, res, next);
  },
);

stallRouter.get('/:id', validate({ params: idParams }), (req, res, next) => {
  // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
  // #swagger.responses[200] = { description: 'Detail warung' }
  // #swagger.responses[400] = { description: 'Validasi gagal' }
  // #swagger.responses[404] = { description: 'Tidak ditemukan' }
  return stallController.getStallById(req, res, next);
});

stallRouter.put(
  '/:id',
  authenticate,
  authorize('owner', 'admin'),
  validate({ params: idParams, body: updateStallBody }),
  (req, res, next) => {
    // #swagger.security = [{ "bearerAuth": [] }]
    // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
    // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/StallInput' } }
    // #swagger.responses[200] = { description: 'Warung ter-update' }
    // #swagger.responses[400] = { description: 'Validasi gagal' }
    // #swagger.responses[401] = { description: 'Belum login / token tidak valid' }
    // #swagger.responses[403] = { description: 'Bukan warung milikmu / role tidak punya akses' }
    // #swagger.responses[404] = { description: 'Tidak ditemukan' }
    return stallController.updateStall(req, res, next);
  },
);

stallRouter.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate({ params: idParams }),
  (req, res, next) => {
    // #swagger.security = [{ "bearerAuth": [] }]
    // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
    // #swagger.responses[200] = { description: 'Warung terhapus' }
    // #swagger.responses[401] = { description: 'Belum login / token tidak valid' }
    // #swagger.responses[403] = { description: 'Hanya admin' }
    // #swagger.responses[404] = { description: 'Tidak ditemukan' }
    return stallController.deleteStall(req, res, next);
  },
);

stallRouter.post(
  '/:id/reviews',
  authenticate,
  validate({ params: idParams, body: createReviewBody }),
  (req, res, next) => {
    // #swagger.security = [{ "bearerAuth": [] }]
    // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
    // #swagger.parameters['body'] = { in: 'body', required: true, schema: { $ref: '#/definitions/ReviewInput' } }
    // #swagger.responses[201] = { description: 'Review dibuat' }
    // #swagger.responses[400] = { description: 'Validasi gagal' }
    // #swagger.responses[401] = { description: 'Belum login / token tidak valid' }
    // #swagger.responses[404] = { description: 'Warung tidak ditemukan' }
    return reviewController.createReview(req, res, next);
  },
);

export { stallRouter };