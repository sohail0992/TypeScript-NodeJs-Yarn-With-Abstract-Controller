export interface CRUD {
    list: (limit: number, page: number, projections: object) => Promise<any>,
    create: (resource: any) => Promise<any>,
    updateById: (resourceId: any) => Promise<string>,
    readById: (resourceId: any) => Promise<any>,
    deleteById: (resourceId: any) => Promise<string>,
    getByConditions(conditions: object, projections: object, populate: object): Promise<any>,
}