import { NextFunction, Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // In dev mode without token, allow mock user
    if (process.env.NODE_ENV === 'development' || process.env.VITEST) {
      req.user = { id: '00000000-0000-0000-0000-000000000001', role: 'OWNER' };
      return next();
    }
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    req.user = {
      id: data.user.id,
      email: data.user.email,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
}
