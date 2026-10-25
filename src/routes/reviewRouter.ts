import { Router } from 'express';
import { ReviewController } from '../controllers/reviewController.ts';
import { authenticate } from '../middlewares/authenticate.ts';
import { authorize } from '../middlewares/authorize.ts';
import { validate } from '../middlewares/validate.ts';
import { idParams } from '../dtos/stallDto.ts';
import { listReviewsQuery } from '../dtos/reviewDto.ts';

const reviewRouter = Router();
const reviewController = new ReviewController();

reviewRouter.get('/', validate({ query: listReviewsQuery }), (req, res, next) => {
  // #swagger.parameters['stallId'] = { in: 'query', type: 'integer' }
  // #swagger.responses[200] = { description: 'Daftar review (JOIN nama user)' }
  // #swagger.responses[400] = { description: 'Validasi gagal' }
  return reviewController.getReviews(req, res, next);
});

reviewRouter.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validate({ params: idParams }),
  (req, res, next) => {
    // #swagger.security = [{ "bearerAuth": [] }]
    // #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer' }
    // #swagger.responses[200] = { description: 'Review terhapus' }
    // #swagger.responses[401] = { description: 'Belum login / token tidak valid' }
    // #swagger.responses[403] = { description: 'Hanya admin' }
    // #swagger.responses[404] = { description: 'Review tidak ditemukan' }
    return reviewController.deleteReview(req, res, next);
  },
);

export { reviewRouter };