import {
  Controller,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { WillService } from './will.service';
import { Response } from 'express';

@Controller('will')
export class WillController {
  constructor(private readonly willService: WillService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  createWill(@UploadedFile() file: Express.Multer.File) {
    return this.willService.createFromFile(file);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('file'))
  updateWill(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.willService.updateFromFile(id, file);
  }

  @Get(':id')
  async getDocument(@Param('id') id: number, @Res() res: Response) {
    const will = await this.willService.findOne(id);
    res.setHeader('Content-Type', will.mimeType);
    return res.send(Buffer.from(will.buffer, 'base64'));
  }
}
