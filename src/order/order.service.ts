import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/user/schema/user.schema';
import { Model } from 'mongoose';
import { Product } from 'src/product/schema/product.schema';
import { Request } from 'express';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  async create(createOrderDto: CreateOrderDto, req: Request) {
    let user = req['user'];
    let { products } = createOrderDto;
    let newProducts: any[] = [];
    let sellerId: any = '';

    try {
      for (let obj of products) {
        let prd = await this.productModel.findById(obj.product);
        if (!prd) {
          return new NotFoundException('Not found product');
        }
        newProducts.push({ ...obj, product: prd });
        sellerId = prd.user;
      }

      createOrderDto.products = newProducts;
      await this.userModel.findByIdAndUpdate(user.id, {
        $push: { orders: createOrderDto },
      });

      await this.userModel.findByIdAndUpdate(sellerId, {
        $push: { orders: createOrderDto },
      });

      return { data: createOrderDto };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async remove(userid: string) {

    try {
      await this.userModel.findByIdAndUpdate(userid, {
        $set: { orders: [] },
      });

      return { data: 'Cleared orders' };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }
}
