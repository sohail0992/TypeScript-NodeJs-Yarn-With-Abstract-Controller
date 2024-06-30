import express from "express";

export function verifyToken(req: express.Request, res: express.Response, next: express.NextFunction) {
    const token = process.env.TOKEN || "t0k3n";
    if (req.headers['x-api-key'] !== token) {
        res.status(401).send('Invalid API token');
        return;
    }
    next();
}