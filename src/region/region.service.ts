import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Region } from './schema/region.schema';
import { Model } from 'mongoose';
import { User } from 'src/user/schema/user.schema';
import { Request } from 'express';

@Injectable()
export class RegionService {
  constructor(
    @InjectModel(Region.name) private regionModel: Model<Region>,
    @InjectModel(User.name) private userModel: Model<Region>,
  ) {}

  async create(createRegionDto: CreateRegionDto, req: Request) {
    let user = req['user'];
    if (user.role != 'ADMIN') return new ForbiddenException('Not allowed');

    try {
      let data = await this.regionModel.create(createRegionDto);
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
      let data = await this.regionModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort([['name', orderBy]])
        .select('-users')
        .exec();
      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      let data = await this.regionModel
        .findById(id)
        .populate({
          path: 'users',
          select: ['-products', '-orders', '-comments'],
        })
        .exec();
      if (!data) {
        return new NotFoundException('Not found region');
      }
      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async update(id: string, updateRegionDto: UpdateRegionDto, req: Request) {
    let user = req['user'];
    if (user.role != 'ADMIN') return new ForbiddenException('Not allowed');

    try {
      let data = await this.regionModel.findByIdAndUpdate(id, updateRegionDto, {
        new: true,
      });
      if (!data) {
        return new NotFoundException('Not found region');
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
      let data = await this.regionModel.findByIdAndDelete(id);
      if (!data) {
        return new NotFoundException('Not found region');
      }

      await this.userModel.updateMany(
        { region: data._id },
        { $set: { region: null } },
      );

      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }
}
