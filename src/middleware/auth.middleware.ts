import { Request, Response, NextFunction } from 'express';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;

  if (!token || token !== 'Bearer mysecrettoken') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};
