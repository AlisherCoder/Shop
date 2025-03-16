import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 4.5 })
  @IsNotEmpty()
  @IsNumber()
  star: number;

  @ApiProperty({ example: 'Yaxshi mahsulot' })
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiProperty({ example: '67d278ae9d977b7d929f9a17' })
  @IsNotEmpty()
  @IsMongoId()
  product: string;
}
