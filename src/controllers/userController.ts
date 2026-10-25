import type { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService.ts';

export class UserController {
  constructor(private userService: UserService = new UserService()) {}

  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.userService.getAllUsers();
      res.status(200).json({ status: 'success', data: users });
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.getUserById(res.locals.valid.params.id);
      res.status(200).json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  };

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.createUser(res.locals.valid.body);
      res.status(201).json({ status: 'success', data: user });
    } catch (error) {
      next(error);
    }
  };
}