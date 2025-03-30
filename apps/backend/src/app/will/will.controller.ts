import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { WillService } from './will.service';

@Controller('will')
export class WillController {
  constructor(private readonly willService: WillService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  saveDocument(@UploadedFile() file: Express.Multer.File) {
    return this.willService.createFromFile(file);
  }

  @Get(':id')
  getDocument(@Param('id') id: number) {
    return this.willService.findOne(id);
  }
}
