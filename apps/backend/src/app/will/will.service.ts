import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Will } from './will.entity';

@Injectable()
export class WillService {
  private willRepository: Repository<Will>;

  constructor(private readonly dataSource: DataSource) {
    this.willRepository = this.dataSource.getRepository(Will);
  }

  async create(file: Express.Multer.File) {
    const will = new Will();

    will.buffer = file.buffer.toString('base64');
    will.mimeType = file.mimetype;
    will.size = file.size;
    will.createdAt = new Date();
    will.updatedAt = new Date();

    return this.willRepository.save(will);
  }

  async updateFromFile(id: number, file: Express.Multer.File) {
    const will = await this.findOne(id);

    will.buffer = file.buffer.toString('base64');
    will.mimeType = file.mimetype;
    will.size = file.size;
    will.updatedAt = new Date();

    return this.willRepository.save(will);
  }
  findOne(id: number) {
    return this.willRepository.findOne({ where: { id } });
  }
}
