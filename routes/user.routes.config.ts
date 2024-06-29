import { CommonRoutesConfig } from '../common/common.routes.config';
import UserController from '../controllers/user.controller';
import UserMiddleware from '../middleware/user.middleware';
import express from 'express';

export class UserRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, 'Five9ContactHistoryRoutes');
    }

    configureRoutes() {
        this.app.route(`/user`)
            .post(
                UserMiddleware.validateRequiredFields,
                UserController.create.bind(UserController));

        this.app.route(`/user/find-with-conditions`)
            .post(UserController.getData.bind(UserController));

        this.app.route(`/user/:id`)
            .put(
                UserController.updateUser.bind(UserController));
        
        return this.app;
    }
}