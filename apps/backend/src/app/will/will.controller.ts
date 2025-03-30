import {
  Controller,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { WillService } from './will.service';
import { Will } from './will.entity';

@Controller('will')
export class WillController {
  constructor(private readonly willService: WillService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  createWill(@UploadedFile() file: Express.Multer.File) {
    return this.willService.createFromFile(file);
  }

  @Put(':id')
  updateWill(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.willService.update(id, file);
  }

  @Get(':id')
  getDocument(@Param('id') id: number) {
    return this.willService.findOne(id);
  }
}
