import debug from 'debug';
import { CRUD } from '../common/interfaces/crud.interface';
const log: debug.IDebugger = debug('app:in-memory-dao');

export class Abstract implements CRUD  {
    Model: any;

    constructor(Model: any) {
        this.Model = Model;
        log('Created new instance of DataDao', this.Model?.modelName);
    }

    async create(Data: any) {
        try {
            const result = await this.Model.create(Data);
            return result;
        } catch (err) {
            log(err, 'error on add Data');
            return err;
        }
    }

    async list(list = -1, page = -1, projections: object = {}) {
        try {
            let results = [];
            if (list > -1) {
                results = await this.Model.find({}, projections).limit(list).lean();
            } else {
                results = await this.Model.find({}, projections).lean();
            }
            return results;
        } catch (err) {
            log(err, 'error in getData');
            return err;
        }
    }

    async readById(DataId: string, projections: object = {}) {
        try {
            return await this.Model.findById(DataId, projections).lean();
        } catch (err) {
            log(err, 'error in getDataById');
            return err;
        }
    }

    async getDataByEmail(email: string) {
        try {
            return await this.Model.findOne({ 'email': email }).lean();
        } catch (err) {
            log(err, 'error in getDataByEmail');
            return err;
        }
    }

    async getDataByContact(contact: string) {
        try {
            return await this.Model.findOne({ 'contact': contact }).lean();
        } catch (err) {
            log(err, 'error in getDataByContact');
            return err;
        }
    }

    async updateById(data: any) {
        try {
            const query = data._id ?  { '_id': data._id } : { 'email': data.email } ;
            const result = await this.Model.findByIdAndUpdate(query, { '$set': data }, { new: true, upsert: false }).lean();
            return result;
        } catch (err) {
            log(err, 'error in putDataById');
            return err;
        }
    }

    async deleteById(DataId: string) {
        try {
            const result = await this.Model.remove({ '_id': DataId });
            return result;
        } catch (err) {
            log(err, 'error in putDataById');
            return err;
        }
    }

    async getByConditions(conditions: object, projections: object, populate: any) {
        try {
            let result = [];
            if (populate.path) {
                result = await this.Model.find(conditions, projections).populate(populate).lean();
            } else {
                result = await this.Model.find(conditions, projections).lean();
            }
            result.forEach((each: any) => {
                each.id = each._id;
            });
            return result;
        } catch (err) {
            log(err, 'error in getByConditions');
            return err;
        }
    }
}
