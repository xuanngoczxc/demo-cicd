import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Photo } from "../entity/photo.entity";
import { Repository } from "typeorm";
import { User } from "../entity/user.entity";
import { CreatePhotoDto } from "../dto/create-photo.dto";

@Injectable()
export class PhotoService {
    constructor(
        @InjectRepository(Photo)
        private readonly photoRepository: Repository<Photo>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async create(createPhotoDto: CreatePhotoDto): Promise<Photo> {
        const photo = new Photo();
        photo.url = createPhotoDto.url;
    
        const user = await this.userRepository.findOne({
          where: { id: createPhotoDto.userId }
        });
        if (!user) {
          throw new NotFoundException('User not found');
        }
        photo.user = user;
        return this.photoRepository.save(photo);
    }

    findAll(): Promise<Photo[]> {
        return this.photoRepository.find({ relations: ['user'] });
    }
    
    findOne(id: number): Promise<Photo> {
        return this.photoRepository.findOne({ 
            where: { id },
            relations: ['user'] 
        });
    }
    
    async remove(id: number): Promise<void> {
        await this.photoRepository.delete(id);
    }
}