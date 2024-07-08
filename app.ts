import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname+'/.env' });
import * as http from 'http';
import * as bodyparser from 'body-parser';
import * as winston from 'winston';
import * as expressWinston from 'express-winston';
import serverless from "serverless-http";

import cors from 'cors'
import { CommonRoutesConfig } from './common/common.routes.config';
import { UserRoutes } from './routes/user.routes.config';

import debug from 'debug';
import mongoose from 'mongoose';
import { verifyToken } from './middleware/verify-token';
const app: express.Application = express();
const server: http.Server = http.createServer(app);
const port = process.env.PORT || 3000;
console.info(`Server running at http://localhost:${port}`);
const routes: Array<CommonRoutesConfig> = [];
const debugLog: debug.IDebugger = debug('app');
mongoose.connect(process.env.MONGO_URL || '').catch(console.error);
const db = mongoose.connection;
app.use(bodyparser.json());
app.use(cors());

app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console()
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
    )
}));

app.use(expressWinston.errorLogger({
    transports: [
        new winston.transports.Console()
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.json()
    )
}));

app.use(verifyToken);

app.get('/', (req: express.Request, res: express.Response) => {
    res.status(200).send(`Server running at http://localhost:${port}`)
});

routes.push(new UserRoutes(app));

if (process.env.SERVERLESS === 'true') {
    const lambdaHandler = serverless(app);
    module.exports.handler = lambdaHandler;
} else {
    server.listen(port, () => {
        debugLog(`Server running at http://localhost:${port}`);
        console.info(`Server running at http://localhost:${port}`);
        routes.forEach((route: CommonRoutesConfig) => {
            debugLog(`Routes configured for ${route.getName()}`);
        });
    });
}