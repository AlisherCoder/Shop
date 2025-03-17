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
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { Request } from 'express';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/user/schema/user.schema';
import { RoleGuard } from 'src/auth/roles.guard';

@ApiBearerAuth()
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Roles(Role.seller)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createProductDto: CreateProductDto, @Req() req: Request) {
    return this.productService.create(createProductDto, req);
  }

  @ApiQuery({
    name: 'orderBy',
    required: false,
    type: String,
    enum: ['asc', 'desc'],
  })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'price', required: false, type: Number })
  @ApiQuery({ name: 'new', required: false, type: Boolean })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'name', required: false, type: String })
  @Get()
  findAll(@Query() query: any) {
    return this.productService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req: Request,
  ) {
    return this.productService.update(id, updateProductDto, req);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.productService.remove(id, req);
  }
}
