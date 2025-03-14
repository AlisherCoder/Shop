import {
  BadRequestException,
  ConflictException,
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

  async findAll() {
    try {
      let data = await this.userModel.find();
      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      let data = await this.userModel.findById(id);
      if (!data) {
        return new NotFoundException('Not found user');
      }
      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      let data = await this.userModel.findByIdAndUpdate(id, updateUserDto, {
        new: true,
      });
      if (!data) {
        return new NotFoundException('Not found user');
      }
      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async remove(id: string) {
    try {
      let data = await this.userModel.findByIdAndDelete(id);
      if (!data) {
        return new NotFoundException('Not found user');
      }
      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }
}
