import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/user/schema/user.schema';
import { Model } from 'mongoose';
import { Product } from 'src/product/schema/product.schema';
import { Comment } from './schema/comment.schema';
import { Request } from 'express';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}

  async create(createCommentDto: CreateCommentDto, req: Request) {
    let user = req['user'].id;
    try {
      let product = await this.productModel.findById(createCommentDto.product);
      if (!product) {
        return new NotFoundException('Not found product');
      }

      createCommentDto['user'] = user;
      let comment = await this.commentModel.create(createCommentDto);

      await this.userModel.findByIdAndUpdate(user, {
        $push: { comments: comment._id },
      });

      await this.productModel.findByIdAndUpdate(comment.product, {
        $push: { comments: comment._id },
      });

      return { data: comment };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, req: Request) {
    let user = req['user'];
    try {
      if (updateCommentDto.product) {
        return new BadRequestException('Not allowed');
      }

      let cmt = await this.commentModel.findById(id);
      if (!cmt) {
        return new NotFoundException('Not found comment');
      }

      if (cmt?.user != user.id) {
        return new BadRequestException('Not allowed');
      }

      let comment = await this.commentModel.findByIdAndUpdate(
        id,
        updateCommentDto,
        { new: true },
      );

      return { data: comment };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async remove(id: string, req: Request) {
    let user = req['user'];
    try {
      let cmt = await this.commentModel.findById(id);
      if (!cmt) {
        return new NotFoundException('Not found comment');
      }

      if (cmt?.user != user.id && user.role != 'ADMIN') {
        return new BadRequestException('Not allowed');
      }

      let comment = await this.commentModel.findByIdAndDelete(id);

      await this.userModel.updateMany(
        { comments: comment?._id },
        { $pull: { comments: comment?._id } },
      );

      await this.productModel.updateMany(
        { comments: comment?._id },
        { $pull: { comments: comment?._id } },
      );

      return { data: comment };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }
}
