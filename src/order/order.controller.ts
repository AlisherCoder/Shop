import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { Request } from 'express';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/user/schema/user.schema';
import { RoleGuard } from 'src/auth/roles.guard';
import { SelfGuard } from 'src/auth/self.guard';

@ApiBearerAuth()
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Roles(Role.client)
  @UseGuards(RoleGuard)
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    return this.orderService.create(createOrderDto, req);
  }

  @UseGuards(SelfGuard)
  @UseGuards(AuthGuard)
  @Delete(':userid')
  remove(@Param('userid') userid: string) {
    return this.orderService.remove(userid);
  }
}
