import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

enum Role {
  client = 'CLIENT',
  saller = 'SELLER',
}

export class CreateUserDto {
  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '+998991002030' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: '12345' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: '67d2727bc19c9ab300f1a4c7' })
  @IsNotEmpty()
  @IsMongoId()
  region: string;

  @ApiProperty({ example: 'image.png' })
  @IsNotEmpty()
  @IsString()
  image: string;

  @ApiProperty({ example: 'John shop' })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  shopname?: string;

  @ApiProperty({ example: 'Tashkent Chilanzar' })
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: 'SELLER' })
  @IsNotEmpty()
  @IsString()
  @IsEnum(Role)
  role: Role;
}

export class LoginUserDto {
  @ApiProperty({ example: '+998991002030' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: '12345' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
