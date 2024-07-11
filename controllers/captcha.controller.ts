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
            const existingRecord = <any> await this.findByBase64(data.image);
            if (existingRecord) {
                if (existingRecord?.answer) {
                    return res.status(200).send({ existingRecord: true, answer: existingRecord.answer });
                }
                const timeSofar = new Date().getTime() - new Date(existingRecord.updatedAt).getTime();
                console.info(timeSofar, 'timeSofar')
                // if time so far is less than 15 min then return the existing record
                if (timeSofar < 900000) {
                    return res.status(500).send({ existingRecord: false, err: 'Time is less than 15 min you have to wait and sumbit again' });
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
            const result = await Captcha.findOneAndUpdate({ image: data.image }, { $set: data }, { upsert: true, new: true}).lean();
            res.status(200).send({ existingRecord: false , ...result });
        } catch (err) {
            console.error(err, 'errro on create')
            log(err, 'error on add Data');
            res.status(500).send(err);
        }
    }

    async callBack(req: express.Request, res: express.Response) {
        try {
            const data = req.query as any;
            await Captcha.findOneAndUpdate({ taskId: data.id }, { $set: { answer: data.answer }});
            res.status(200).send({ succss: true} );
        } catch (err) {
            log(err, 'error on add Data');
            res.status(500).send(err);
        }
    }

    async getCaptchByToken(req: express.Request, res: express.Response) {
        try {
            const data = req.query as any;
            const answer = await this.getCaptchaAnswer(data.token);
            res.status(200).send({ succss: true, answer: answer});
        } catch (err) {
            log(err, 'error on add Data');
            res.status(500).send(err);
        }
    }


    async updateCaptcha(req: express.Request, res: express.Response) {
        try {
            const data = req.body as any;
            const result = await this.abstractService.updateById({...data, id: req.params.id});
            res.status(200).send(result);
        } catch (err) {
            log(err, 'error while updating Data');
            res.status(500).send(err);
        }
    }

    async getCaptchaAnswer(token: string) {
        try {
            console.log(token, 'token');
            const existingRecord = <any> await this.findByToken(token);
            if (existingRecord) {
                return existingRecord.answer;
            }
            const response = await axios.post(process.env.CAPTCHA_SERVICE + '/getTaskResult', {
                "clientKey": process.env.CAPTCHA_SERVICE_KEY,
                "taskId": token
            });
            if (response?.data?.errorCode) throw response.data.errorCode + ' ' + response.data.errorDescription;
            // update answer in db
            Captcha.findOneAndUpdate({ taskId: token }, { $set: { answer: response.data.solution.text }}).then(() => console.info('udpated'));
            return response.data?.solution?.text;
        } catch(err) {
            log(err, 'error while getting captcha answer');
            throw err;
        }
        
    }

    async findByBase64(base64: string) {
        const result = await Captcha.findOne({ image: base64 });
        return result;
    }

    async findByToken(token: string) {
        const result = await Captcha.findOne({ image: token }, { answer: 1 });
        return result;
    }
}

export default new CaptchaController();