import { BadRequestException, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { imageUploadOptions } from '../common/upload.options';
import { AiService } from './ai.service';

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
    constructor(private ai: AiService) { }

    @Post('predict')
    @ApiConsumes('multipart/form-data')
    @ApiBody({ schema: { type: 'object', properties: { image: { type: 'string', format: 'binary' } } } })
    @UseInterceptors(FileInterceptor('image', imageUploadOptions))
    predict(@UploadedFile() file?: Express.Multer.File) {
        if (!file) throw new BadRequestException('Foto wajib diunggah (field: image)');
        return this.ai.predict(file);
    }
}