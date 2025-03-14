import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Region } from './schema/region.schema';
import { Model } from 'mongoose';

@Injectable()
export class RegionService {
  constructor(@InjectModel(Region.name) private regionModel: Model<Region>) {}

  async create(createRegionDto: CreateRegionDto) {
    try {
      let data = await this.regionModel.create(createRegionDto);
      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async findAll() {
    try {
      let data = await this.regionModel.find();
      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async findOne(id: string) {
    try {
      let data = await this.regionModel.findById(id);
      if (!data) {
        return new NotFoundException('Not found region');
      }
      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }

  async update(id: string, updateRegionDto: UpdateRegionDto) {
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

  async remove(id: string) {
    try {
      let data = await this.regionModel.findByIdAndDelete(id);
      if (!data) {
        return new NotFoundException('Not found region');
      }
      return { data };
    } catch (error) {
      return new BadRequestException(error.message);
    }
  }
}
