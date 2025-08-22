import express from 'express';
import { Abstract } from '../services/abstract.service';
import User from '../models/user.model';
import debug from 'debug';
const log: debug.IDebugger = debug('app:fiev9-contact-history-controller');
import { UserDTO } from '../dto/user.dto';

class UserController {
  abstractService = new Abstract(User);

  async list(req: express.Request, res: express.Response) {
    const data = await this.abstractService.list(
      10,
      0,
      req.body.projections || {}
    );
    res.status(200).send(data);
  }

  async getData(req: express.Request, res: express.Response) {
    const data = await this.abstractService.getByConditions(
      req.body.conditions || {},
      req.body.projections || {},
      req.body.populate || {}
    );
    res.status(200).send(data);
  }

  async create(req: express.Request, res: express.Response) {
    try {
      const data = req.body as UserDTO;
      const result = await this.abstractService.create(data);
      res.status(200).send(result);
    } catch (err) {
      log(err, 'error on add Data');
      res.status(500).send(err);
    }
  }

  async getUserByEmail(email: string) {
    return this.abstractService.getDataByEmail(email);
  }

  async updateUser(req: express.Request, res: express.Response) {
    try {
      const data = req.body as UserDTO;
      const result = await this.abstractService.updateById({
        ...data,
        id: req.params.id,
      });
      res.status(200).send(result);
    } catch (err) {
      log(err, 'error while updating Data');
      res.status(500).send(err);
    }
  }
}

export default new UserController();
