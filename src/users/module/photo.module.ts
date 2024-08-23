import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Photo } from "../entity/photo.entity";
import { PhotoService } from "../services/photo.service";
import { PhotoController } from "../controller/photo.controller";
import { UsersModule } from "./users.module";
import { User } from "../entity/user.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Photo, User])],
    providers: [PhotoService],
    controllers: [PhotoController],
})
export class PhotoModule{}