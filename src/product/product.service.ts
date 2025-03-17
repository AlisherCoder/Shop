import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Product } from './schema/product.schema';
import { Model } from 'mongoose';
import { Category } from 'src/category/schema/category.schema';
import { User } from 'src/user/schema/user.schema';
import * as fs from 'fs';
import * as path from 'path';
import { Request } from 'express-serve-static-core';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createProductDto: CreateProductDto, req: Request) {
    let user = req['user'];

    try {
      createProductDto['user'] = user.id;

      let category = await this.categoryModel.findById(
        createProductDto.category,
      );
      if (!category) {
        return new NotFoundException('Not found category');
      }

      let product = await this.productModel.create(createProductDto);

      await this.userModel.findByIdAndUpdate(product.user, {
        $push: { products: product._id },
      });

      await this.categoryModel.findByIdAndUpdate(product.category, {
        $push: { products: product._id },
      });

      return { data: product };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async findAll(query: any) {
    let {
      page = 1,
      limit = 5,
      orderBy = 'asc',
      sortBy = 'name',
      maxPrice,
      minPrice,
      ...filter
    } = query;
    let skip = (page - 1) * limit;

    if (filter.name) {
      filter.name = { $regex: filter.name, $options: 'i' };
    }

    if (maxPrice && minPrice) {
      filter.price = { $gte: minPrice, $lte: maxPrice };
    }

    if (maxPrice) {
      filter.price = { $lte: maxPrice };
    }

    if (minPrice) {
      filter.price = { $gte: minPrice };
    }

    try {
      let data = await this.productModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort([[sortBy, orderBy]])
        .populate([
          {
            path: 'user',
            select: ['-products', '-orders', '-comments'],
            populate: { path: 'region', select: '-users' },
          },
          { path: 'category', select: '-products' },
        ])
        .select('-comments')
        .exec();
      if (!data.length) {
        return new NotFoundException('Not found category');
      }
      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      let data = await this.productModel
        .findById(id)
        .populate([
          {
            path: 'user',
            select: ['-products', '-orders', '-comments'],
            populate: { path: 'region', select: '-users' },
          },
          { path: 'category', select: '-products' },
        ])
        .exec();
      if (!data) {
        throw new NotFoundException('Not found product');
      }
      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, req: Request) {
    let user = req['user'];

    try {
      let product = await this.productModel.findById(id);
      if (!product) {
        throw new NotFoundException('Not found product');
      }

      if (product.user != user.id) {
        return new ForbiddenException('Not allowed');
      }

      let data = await this.productModel.findByIdAndUpdate(
        id,
        updateProductDto,
        { new: true },
      );

      if (updateProductDto.image) {
        let filepath = path.join('uploads', product.image);
        try {
          fs.unlinkSync(filepath);
        } catch (error) {}
      }

      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async remove(id: string, req: Request) {
    let user = req['user'];
    try {
      let product = await this.productModel.findById(id);
      if (!product) {
        throw new NotFoundException('Not found product');
      }

      if (product.user != user.id) {
        return new ForbiddenException('Not allowed');
      }

      await this.productModel.findByIdAndDelete(id);

      let filepath = path.join('uploads', product.image);
      try {
        fs.unlinkSync(filepath);
      } catch (error) {}

      await this.categoryModel.updateMany(
        { products: product._id },
        { $pull: { products: product._id } },
      );

      await this.userModel.updateMany(
        { products: product._id },
        { $pull: { products: product._id } },
      );

      return { data: product };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }
}
