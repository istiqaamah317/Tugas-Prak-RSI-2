import type { Request, Response, NextFunction } from 'express';
import { ReviewService } from '../services/reviewService.ts';

export class ReviewController {
  constructor(private reviewService: ReviewService = new ReviewService()) {}

  getReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { stallId } = res.locals.valid.query;
      const reviews = await this.reviewService.getAllReviews(stallId);
      res.status(200).json({ status: 'success', data: reviews });
    } catch (error) {
      next(error);
    }
  };

  createReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const review = await this.reviewService.createReview(
        res.locals.user,
        res.locals.valid.params.id,
        res.locals.valid.body,
      );
      res.status(201).json({ status: 'success', data: review });
    } catch (error) {
      next(error);
    }
  };

  deleteReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const review = await this.reviewService.deleteReview(res.locals.valid.params.id);
      res.status(200).json({ status: 'success', data: review });
    } catch (error) {
      next(error);
    }
  };
}