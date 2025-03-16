import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category } from './schema/category.schema';
import { Model } from 'mongoose';
import { Request } from 'express';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, req: Request) {
    let user = req['user'];
    if (user.role != 'ADMIN') return new ForbiddenException('Not allowed');

    try {
      let data = await this.categoryModel.create(createCategoryDto);
      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async findAll(query: any) {
    let { page = 1, limit = 5, orderBy = 'asc', ...filter } = query;
    let skip = (page - 1) * limit;
    if (filter.name) filter.name = { $regex: filter.name, $options: 'i' };

    try {
      let data = await this.categoryModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort([['name', orderBy]])
        .select('-products')
        .exec();
      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      let data = await this.categoryModel
        .findById(id)
        .populate({
          path: 'products',
          select: '-comments',
          populate: {
            path: 'user',
            select: ['-products', '-comments', '-orders'],
            populate: { path: 'region', select: '-users' },
          },
        })
        .exec();
      if (!data) {
        return new NotFoundException('Not found category');
      }
      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, req: Request) {
    let user = req['user'];
    if (user.role != 'ADMIN') return new ForbiddenException('Not allowed');

    try {
      let data = await this.categoryModel.findByIdAndUpdate(
        id,
        updateCategoryDto,
        { new: true },
      );
      if (!data) {
        return new NotFoundException('Not found category');
      }
      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async remove(id: string, req: Request) {
    let user = req['user'];
    if (user.role != 'ADMIN') return new ForbiddenException('Not allowed');

    try {
      let data = await this.categoryModel.findByIdAndDelete(id);
      if (!data) {
        return new NotFoundException('Not found category');
      }
      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }
}
