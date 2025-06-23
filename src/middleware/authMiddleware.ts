import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "tajnyklic";

export interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
    [key: string]: any;
  };
}

// 🛡️ Middleware pro ověření JWT tokenu
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) return res.sendStatus(403); // Forbidden

    req.user = {
  userId: decoded.userId,  // 👈 zachováme pro kompatibilitu
  id: decoded.userId,       // 👈 přidáme i "id" kvůli některým funkcím
  role: decoded.role,
};


    console.log("✅ Decoded token:", decoded);
    console.log("➡️ req.user after decoding:", req.user);

    next();
  });
};

// 👮‍♀️ Middleware pro autorizaci podle role
export const authorizeRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.sendStatus(403); // Forbidden
    }
    next();
  };
};
