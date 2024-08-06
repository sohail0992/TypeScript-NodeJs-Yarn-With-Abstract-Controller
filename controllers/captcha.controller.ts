import express from 'express';
import { Abstract } from '../services/abstract.service';
import Captcha from '../models/captcha.model';
import debug from 'debug';
import axios from 'axios';
const log: debug.IDebugger = debug('app:captcha-controller');

class CaptchaController {
    abstractService = new Abstract(Captcha);

    async list(req: express.Request, res: express.Response) {
        const data = await this.abstractService.list(10, 0, req.body.projections || {});
        res.status(200).send(data);
    }

    async getData(req: express.Request, res: express.Response) {
        const data = await this.abstractService.getByConditions(req.body.conditions || {}, req.body.projections || {}, req.body.populate || {});
        res.status(200).send(data);
    }

    async create(req: express.Request, res: express.Response) {
        try {
            const data = req.body as any;
            const result = await this.createCaptchaWithTaskId(data, false);
            res.status(200).send({ existingRecord: false, result: result });
        } catch (err) {
            console.error(err, 'errro on create')
            log(err, 'error on add Data');
            res.status(500).send(err);
        }
    }

    async createAndSolve(req: express.Request, res: express.Response) {
        try {
            const data = req.body as any;
            const result = await this.createCaptchaWithTaskId(data, true);
            res.status(200).send(result);
        } catch (err) {
            console.error(err, 'error on createAndSolve')
            log(err, 'error on createAndSolve');
            res.status(500).send(err);
        }
    }

    async createCaptchaWithTaskId(data: any, waitForAnswer: boolean) {
        try {
            const existingRecord = <any>await this.findByBase64(data.image);
            if (existingRecord) {
                if (existingRecord?.answer) {
                    return { existingRecord: true, answer: existingRecord.answer, taskId: existingRecord.taskId };
                }
                const timeSofar = new Date().getTime() - new Date(existingRecord.updatedAt).getTime();
                console.info(timeSofar, 'timeSofar')
                // if time so far is less than 15 min then return the existing record
                if (timeSofar < 900000) {
                    console.info('Time is less than 15 min, wait for answer ', waitForAnswer)
                    if (waitForAnswer) {
                        const resp = await this.getTheAnswer(existingRecord);
                        return resp;
                    }
                    return { existingRecord: false, taskId: existingRecord.taskId, err: 'Time is less than 15 min you have to wait and submit again' };
                }
            }
            const response = await axios.post(process.env.CAPTCHA_SERVICE + '/createTask', {
                "clientKey": process.env.CAPTCHA_SERVICE_KEY,
                "task": {
                    "type": "ImageToTextTask",
                    "body": data.image,
                    "phrase": false,
                    "case": true,
                    "numeric": 0,
                    "math": false,
                    "minLength": 1,
                    "maxLength": 5,
                    "comment": ""
                },
                "languagePool": "en"
            });
            if (response?.data?.errorCode) throw response.data.errorCode + ' ' + response.data.errorDescription;
            data.taskId = response.data.taskId;
            const result = <any>await Captcha.findOneAndUpdate({ image: data.image }, { $set: data }, { upsert: true, new: true }).lean();
            if (waitForAnswer) {
                const resp = await this.getTheAnswer(result);
                return resp;
            }
            return { existingRecord: false, taskId: result?.taskId, answer: result?.answer };
        } catch (err) {
            console.error(err, 'error on createCaptchaWithTaskId')
            log(err, 'error on createCaptchaWithTaskId');
            throw err;
        }
    }

    async getTheAnswer(existingRecord: any) {
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        for (const waitTime of [0, 2000, 4000, 6000, 10000]) {
            await delay(waitTime);
            console.info('Waiting for answer at', new Date().toTimeString(), 'for task', existingRecord.taskId, ' at delay ', waitTime);
            try {
                const result = <any>await this.getCaptchaAnswer(existingRecord.taskId, waitTime === 0);
                if (result?.answer) {
                    return { existingRecord: result.existingRecord, answer: result.answer, taskId: existingRecord.taskId };
                }
            } catch (error) {
               throw 'error on getTheAnswer on ' + waitTime + ' for task' + existingRecord.taskId + ' ' + error;
            }
        }
        throw { existingRecord: false, taskId: existingRecord.taskId, err: 'Captcha solution failed' };
    }

    async callBack(req: express.Request, res: express.Response) {
        try {
            const data = req.query as any;
            await Captcha.findOneAndUpdate({ taskId: data.id }, { $set: { answer: data.answer } });
            res.status(200).send({ succss: true });
        } catch (err) {
            log(err, 'error on add Data');
            res.status(500).send(err);
        }
    }

    async getCaptchByToken(req: express.Request, res: express.Response) {
        try {
            const data = req.query as any;
            const answer = await this.getCaptchaAnswer(data.token);
            res.status(200).send({ succss: true, answer: answer });
        } catch (err) {
            log(err, 'error on add Data');
            res.status(500).send(err);
        }
    }


    async updateCaptcha(req: express.Request, res: express.Response) {
        try {
            const data = req.body as any;
            const result = await this.abstractService.updateById({ ...data, id: req.params.id });
            res.status(200).send(result);
        } catch (err) {
            log(err, 'error while updating Data');
            res.status(500).send(err);
        }
    }

    async getCaptchaAnswer(token: Number, shouldCheckDb: boolean = false) {
        try {
            if (shouldCheckDb) {
                console.log('checking solution in db', 'token');
                const existingRecord = <any>await this.findByToken(token);
                if (existingRecord && existingRecord?.answer) {
                    return {
                        existingRecord: true,
                        answer: existingRecord.answer
                    };
                }
            }
            console.info('getting the solution from service');
            const response = await axios.post(process.env.CAPTCHA_SERVICE + '/getTaskResult', {
                "clientKey": process.env.CAPTCHA_SERVICE_KEY,
                "taskId": token
            });
            if (response?.data?.errorCode) throw response.data.errorCode + ' ' + response.data.errorDescription;
            // update answer in db
            if (response.data?.solution?.text) {
                Captcha.findOneAndUpdate({ taskId: token }, { $set: { answer: response.data.solution.text } }).then(() => console.info('udpated'));
                console.info('got the solution', response.data?.solution?.text);
            }
            return {
                existingRecord: false,
                answer: response.data?.solution?.text
            };
        } catch (err) {
            log(err, 'error while getting captcha answer');
            throw err;
        }

    }

    async findByBase64(base64: string) {
        const result = await Captcha.findOne({ image: base64 });
        return result;
    }

    async findByToken(token: Number) {
        try {
            console.log('finding captcha by token', token);
            const result = await Captcha.findOne({ taskId: token }, { answer: 1 });
            return result;
        } catch (err) {
            log(err, 'error while finding captcha by token');
            return null
        }
    }
}

export default new CaptchaController();