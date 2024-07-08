import express from 'express';
import debug from 'debug';
const log: debug.IDebugger = debug('app:user-controller');

class UserMiddleware {
    async validateRequiredFields(req: express.Request, res: express.Response, next: express.NextFunction) {
        if (req.body?.email) {
            next();
        } else {
            res.status(400).send({error: `Missing required fields email`});
        }
    }
}

export default new UserMiddleware();