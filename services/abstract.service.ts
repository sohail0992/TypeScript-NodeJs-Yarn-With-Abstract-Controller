import debug from 'debug';
import { CRUD } from '../common/interfaces/crud.interface';
const log: debug.IDebugger = debug('app:in-memory-dao');

// Define functions first (not exported yet)
const createData = async (Model: any, Data: any) => {
    try {
        const result = await Model.create(Data);
        return result;
    } catch (err) {
        log(err, 'error on add Data');
        return err;
    }
};

const listData = async (Model: any, list = -1, page = -1, projections: object = {}) => {
    try {
        let results = [];
        if (list > -1) {
            results = await Model.find({}, projections).limit(list).lean();
        } else {
            results = await Model.find({}, projections).lean();
        }
        return results;
    } catch (err) {
        log(err, 'error in getData');
        return err;
    }
};

const readDataById = async (Model: any, DataId: string, projections: object = {}) => {
    try {
        return await Model.findById(DataId, projections).lean();
    } catch (err) {
        log(err, 'error in getDataById');
        return err;
    }
};

const getDataByEmail = async (Model: any, email: string) => {
    try {
        return await Model.findOne({ 'email': email }).lean();
    } catch (err) {
        log(err, 'error in getDataByEmail');
        return err;
    }
};

const getDataByContact = async (Model: any, contact: string) => {
    try {
        return await Model.findOne({ 'contact': contact }).lean();
    } catch (err) {
        log(err, 'error in getDataByContact');
        return err;
    }
};

const updateDataById = async (Model: any, data: any) => {
    try {
        const id = data._id || data.id;
        const query = id ?  { '_id': id } : { 'email': data.email } ;
        const result = await Model.findByIdAndUpdate(query, { '$set': data }, { new: true, upsert: false }).lean();
        return result;
    } catch (err) {
        log(err, 'error in putDataById');
        return err;
    }
};

const deleteDataById = async (Model: any, DataId: string) => {
    try {
        const result = await Model.remove({ '_id': DataId });
        return result;
    } catch (err) {
        log(err, 'error in putDataById');
        return err;
    }
};

const getByConditions = async (Model: any, conditions: object, projections: object, populate: any) => {
    try {
        let result = [];
        if (populate.path) {
            result = await Model.find(conditions, projections).populate(populate).lean();
        } else {
            result = await Model.find(conditions, projections).lean();
        }
        result.forEach((each: any) => {
            each.id = each._id;
        });
        return result;
    } catch (err) {
        log(err, 'error in getByConditions');
        return err;
    }
};

export class Abstract implements CRUD  {
    Model: any;

    constructor(Model: any) {
        this.Model = Model;
        log('Created new instance of DataDao', this.Model?.modelName);
    }

    async create(Data: any) {
        return createData(this.Model, Data);
    }

    async list(list = -1, page = -1, projections: object = {}) {
        return listData(this.Model, list, page, projections);
    }

    async readById(DataId: string, projections: object = {}) {
        return readDataById(this.Model, DataId, projections);
    }

    async getDataByEmail(email: string) {
        return getDataByEmail(this.Model, email);
    }

    async getDataByContact(contact: string) {
        return getDataByContact(this.Model, contact);
    }

    async updateById(data: any) {
        return updateDataById(this.Model, data);
    }

    async deleteById(DataId: string) {
        return deleteDataById(this.Model, DataId);
    }

    async getByConditions(conditions: object, projections: object, populate: any) {
        return getByConditions(this.Model, conditions, projections, populate);
    }
}

// Export all functions at the end
export {
    createData,
    listData,
    readDataById,
    getDataByEmail,
    getDataByContact,
    updateDataById,
    deleteDataById,
    getByConditions
};
