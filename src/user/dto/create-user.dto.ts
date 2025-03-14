import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
enum Role {
  client = 'CLIENT',
  saller = 'SELLER',
}

export class CreateUserDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsString()
  password: string;

  @IsString()
  @IsMongoId()
  region: string;

  @IsString()
  image: string;

  @IsString()
  @IsOptional()
  shopname?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsEnum(Role)
  role: Role;
}

export class LoginUserDto {
  @IsString()
  phone: string;

  @IsString()
  password: string;
}
