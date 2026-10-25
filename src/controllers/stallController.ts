import type { Request, Response, NextFunction } from 'express';
import { StallService } from '../services/stallService.ts';

export class StallController {
  private stallService: StallService;

  constructor(stallService: StallService = new StallService()) {
    this.stallService = stallService;
  }

  getStalls = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search, category, page, limit } = res.locals.valid.query;
      const { data, total } = await this.stallService.getAllStalls({ search, category, page, limit });
      res.status(200).json({ status: 'success', meta: { page, limit, total }, data });
    } catch (error) {
      next(error);
    }
  };

  getStallById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stall = await this.stallService.getStallById(res.locals.valid.params.id);
      res.status(200).json({ status: 'success', data: stall });
    } catch (error) {
      next(error);
    }
  };

  createStall = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stall = await this.stallService.createStall(res.locals.user, res.locals.valid.body);
      res.status(201).json({ status: 'success', data: stall });
    } catch (error) {
      next(error);
    }
  };

  updateStall = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stall = await this.stallService.updateStall(
        res.locals.user,
        res.locals.valid.params.id,
        res.locals.valid.body,
      );
      res.status(200).json({ status: 'success', data: stall });
    } catch (error) {
      next(error);
    }
  };

  deleteStall = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stall = await this.stallService.deleteStall(res.locals.valid.params.id);
      res.status(200).json({ status: 'success', data: stall });
    } catch (error) {
      next(error);
    }
  };
}