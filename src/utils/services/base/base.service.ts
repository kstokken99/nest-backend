import type { Document, QueryFilter } from 'mongoose';

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';

@Injectable()
export class BaseService<Doc extends Document> {
  create!: Model<Doc>['create'];
  insertMany!: Model<Doc>['insertMany'];
  find!: Model<Doc>['find'];
  findById!: Model<Doc>['findById'];
  findOne!: Model<Doc>['findOne'];
  updateOne!: Model<Doc>['updateOne'];
  updateMany!: Model<Doc>['updateMany'];
  findOneAndUpdate!: Model<Doc>['findOneAndUpdate'];
  delete!: Model<Doc>['deleteOne'];

  constructor(private readonly model: Model<Doc>) {
    this.create = this.model.create.bind(this.model);
    this.insertMany = this.model.insertMany.bind(this.model);
    this.find = this.model.find.bind(this.model);
    this.findById = this.model.findById.bind(this.model);
    this.findOne = this.model.findOne.bind(this.model);
    this.updateOne = this.model.updateOne.bind(this.model);
    this.updateMany = this.model.updateMany.bind(this.model);
    this.findOneAndUpdate = this.model.findOneAndUpdate.bind(this.model);
    this.delete = this.model.deleteOne.bind(this.model);
  }

  async findAndDelete(filter: QueryFilter<Doc>) {
    const documents = await this.model.find(filter);
    const deletedInfo = await this.model.deleteMany(filter);
    return { ...deletedInfo, documents };
  }

  total(...params: Parameters<Model<Doc>['countDocuments']>) {
    return this.model.countDocuments(...params);
  }
}
