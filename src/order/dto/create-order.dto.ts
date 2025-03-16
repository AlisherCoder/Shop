import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsPositive } from 'class-validator';
import { Item } from 'src/user/schema/user.schema';

export class CreateOrderDto {
  @ApiProperty({ example: 200 })
  @IsNotEmpty()
  @IsPositive()
  totalPrice: number;

  @ApiProperty({
    example: [{ product: '67d278ae9d977b7d929f9a17', count: 4, totalSum: 200 }],
  })
  @IsNotEmpty()
  @IsArray()
  products: Item[];
}
