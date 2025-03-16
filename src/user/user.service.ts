import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Region } from 'src/region/schema/region.schema';
import * as bcrypt from 'bcrypt';
import * as path from 'path';
import * as fs from 'fs';
import { Request } from 'express';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Region.name) private regionModel: Model<Region>,
    private jwtServise: JwtService,
  ) {}

  async findUser(phone: string) {
    try {
      let user = await this.userModel.findOne({ phone });
      return user;
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async register(createUserDto: CreateUserDto) {
    let { phone, password, region } = createUserDto;
    try {
      let user = await this.findUser(phone);
      if (user) {
        return new ConflictException('User already exists');
      }

      let foundregion = await this.regionModel.findById(region);
      if (!foundregion) {
        return new BadRequestException('Not found region');
      }

      let hash = bcrypt.hashSync(password, 10);

      let newUser = await this.userModel.create({
        ...createUserDto,
        password: hash,
      });

      await this.regionModel.findByIdAndUpdate(region, {
        $push: { users: newUser._id },
      });

      return { data: newUser };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    let { phone, password } = loginUserDto;
    try {
      let user = await this.findUser(phone);
      if (!user) {
        return new UnauthorizedException('Unauthorized');
      }

      let isValid = bcrypt.compareSync(password, user['password']);
      if (!isValid) {
        return new BadRequestException('Password or phone is wrong');
      }

      let token = this.jwtServise.sign({ id: user['_id'], role: user['role'] });

      return { data: token };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async findAll(query: any, req: Request) {
    let user = req['user'];
    if (user.role != 'ADMIN') return new ForbiddenException('Not allowed');

    let {
      page = 1,
      limit = 5,
      orderBy = 'asc',
      sortBy = 'name',
      ...filter
    } = query;
    let skip = (page - 1) * limit;

    if (filter.name) filter.name = { $regex: filter.name, $options: 'i' };

    if (filter.shopname)
      filter.shopname = { $regex: filter.shopname, $options: 'i' };

    if (filter.phone) filter.phone = { $regex: filter.phone, $options: 'i' };

    try {
      let data = await this.userModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort([[sortBy, orderBy]])
        .populate({ path: 'region', select: '-users' })
        .select(['-products', '-orders', '-comments'])
        .exec();

      if (!data.length) {
        return new NotFoundException('Not found data');
      }

      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async findOne(id: string, req: Request) {
    let user = req['user'];
    if (user.role != 'ADMIN' && user.id != id) {
      return new ForbiddenException('Not allowed');
    }

    try {
      let data = await this.userModel
        .findById(id)
        .populate([
          {
            path: 'products',
            select: '-comments',
            populate: { path: 'category', select: '-products' },
          },
          { path: 'region', select: '-users' },
        ])
        .exec();
      if (!data) {
        return new NotFoundException('Not found user');
      }
      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto, req: Request) {
    let user = req['user'];
    if (user.role != 'ADMIN' && user.id != id) {
      return new ForbiddenException('Not allowed');
    }

    try {
      let user = await this.userModel.findById(id);
      if (!user) {
        return new NotFoundException('Not found user');
      }

      if (updateUserDto.role) {
        return new ForbiddenException('Not allowed update role');
      }

      let data = await this.userModel.findByIdAndUpdate(id, updateUserDto, {
        new: true,
      });

      if (updateUserDto.image) {
        let filepath = path.join('uploads', user.image);
        try {
          fs.unlinkSync(filepath);
        } catch (error) {}
      }

      if (updateUserDto.region) {
        let foundregion = await this.regionModel.findById(updateUserDto.region);
        if (!foundregion) {
          return new BadRequestException('Not found region');
        }

        await this.regionModel.updateMany(
          { users: user._id },
          { $pull: { users: user._id } },
        );
        await this.regionModel.findByIdAndUpdate(updateUserDto.region, {
          $push: { users: data!._id },
        });
      }

      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async remove(id: string, req: Request) {
    let user = req['user'];
    if (user.role != 'ADMIN' && user.id != id) {
      return new ForbiddenException('Not allowed');
    }

    try {
      let data = await this.userModel.findByIdAndDelete(id);
      if (!data) {
        return new NotFoundException('Not found user');
      }

      let filepath = path.join('uploads', data.image);
      try {
        fs.unlinkSync(filepath);
      } catch (error) {}

      await this.regionModel.updateMany(
        { users: data._id },
        { $pull: { users: data._id } },
      );
      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }
}
