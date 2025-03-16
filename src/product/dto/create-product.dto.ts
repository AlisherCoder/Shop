import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Lacceti' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Lacceti.png' })
  @IsNotEmpty()
  @IsString()
  image: string;

  @ApiProperty({ example: 'Holati yaxshi' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: true })
  @IsNotEmpty()
  @IsBoolean()
  new: boolean;

  @ApiProperty({ example: 15000 })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ example: '67d565f213a26ee8c7823595' })
  @IsNotEmpty()
  @IsMongoId()
  category: string;
}
