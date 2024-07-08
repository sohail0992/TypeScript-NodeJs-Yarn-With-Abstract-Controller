import { CommonRoutesConfig } from '../common/common.routes.config';
import CaptchaController from '../controllers/captcha.controller';
import express from 'express';

export class CaptchaRoutes extends CommonRoutesConfig {
    constructor(app: express.Application) {
        super(app, 'CaptchasRoutes');
    }

    configureRoutes() {
        this.app.route(`/captcha/callback`)
        .post(
            CaptchaController.callBack.bind(CaptchaController));

        this.app.route(`/captcha`)
            .post(
                CaptchaController.create.bind(CaptchaController));

        this.app.route(`/captcha/find-with-conditions`)
            .post(CaptchaController.getData.bind(CaptchaController));

        this.app.route(`/captcha/:id`)
            .put(
                CaptchaController.updateCaptcha.bind(CaptchaController));
        
        return this.app;
    }
}