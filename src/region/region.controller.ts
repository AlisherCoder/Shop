import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RegionService } from './region.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { Request } from 'express';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/user/schema/user.schema';
import { RoleGuard } from 'src/auth/roles.guard';

@ApiBearerAuth()
@Controller('region')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Roles(Role.admin)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createRegionDto: CreateRegionDto) {
    return this.regionService.create(createRegionDto);
  }

  @ApiQuery({
    name: 'orderBy',
    required: false,
    type: String,
    enum: ['asc', 'desc'],
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'name', required: false, type: String })
  @Get()
  findAll(@Query() query?: any) {
    return this.regionService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.regionService.findOne(id);
  }

  @Roles(Role.admin)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRegionDto: UpdateRegionDto
  ) {
    return this.regionService.update(id, updateRegionDto);
  }

  @Roles(Role.admin)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.regionService.remove(id);
  }
}
