import { Module } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { UserController } from '../controller/user.controller';
import { PhotoModule } from './photo.module';
import { Photo } from '../entity/photo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Photo]), PhotoModule],
  providers: [UsersService],
  controllers: [UserController],
  // exports: [TypeOrmModule]
  exports: [UsersService]
})
export class UsersModule {}
