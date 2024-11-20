import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '@/types/error';

export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message
    });
  }

  // 處理其他未預期的錯誤
  console.error(err);
  res.status(500).json({
    error: 'Internal server error'
  });
};