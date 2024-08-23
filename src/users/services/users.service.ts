import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entity/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { PaginationDto } from '../dto/pagination.dto';
import { Photo } from '../entity/photo.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { RegisterUserDto } from '../dto/register-user.dto';
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  
  constructor(
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
      @InjectRepository(Photo)
      private readonly photoPepository: Repository<Photo>,
  ){}

  // async create(createUserDtos: CreateUserDto[]): Promise<User[]> {
  //   const createdUsers = [];

  //   for (const createUserDto of createUserDtos) {
  //     const { name } = createUserDto;
  //     const user = new User();
  //     user.name = name;
  //     const createdUser = await this.userRepository.save(user);
  //     createdUsers.push(createdUser);
  //   }
  //   return createdUsers;
  // }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10)
    const user = this.userRepository.create({
      ...createUserDto, password: hashedPassword});
    return this.userRepository.save(user);
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    return this.userRepository.save(registerUserDto);
  }

  async findOneByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }

  // async findOneById(id: number): Promise<User | undefined> {
  //   return this.userRepository.findOne({ where: {id} });
  // }

  async findAllPaginated(paginationDto: PaginationDto): Promise<{
    users: User[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const { page = 1, limit = 10, search } = paginationDto;
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.photos','photos')
    if (search) {
        queryBuilder.where('unaccent(user.name) ILIKE unaccent(:search)', { search: `%${search}%` });
    }
    const total = await queryBuilder.getCount();
    const users = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();
    const totalPages = Math.ceil(total / limit);
    return {
        users,
        total,
        totalPages,
        currentPage: page,
    };
  }

  async findSearchUsers(name: string): Promise<User[]> {
    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.photos', 'photo')
      .where('user.name = :name', {name})
      .getMany();
    return users;
  }

  async findAll(paginationDto: PaginationDto, search?: string): Promise<{
    users: User[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const { page = 1, limit = 10 } = paginationDto;
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.photos','photos');

    if (search) {
        queryBuilder.where('unaccent(user.name) ILIKE unaccent(:search)', { search: `%${search}%` });
    }
    const total = await queryBuilder.getCount();
    const users = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();
    const totalPages = Math.ceil(total / limit);
    return {
      users,
      total,
      totalPages,
      currentPage: page,
    };
  }

  async findOne(id: number): Promise<User> {
      return await this.userRepository.findOne({
        where: { id },
        relations: ['photos'],
      });
  }

  // async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
  //     await this.userRepository.update(id, updateUserDto);
  //     return this.userRepository.findOne({ where: {id}, relations: ['photos']});
  // }

  async update(id: number, updateUserDto: UpdateUserDto, photoUpdates?: Photo[]): Promise<User> {
    await this.userRepository.update(id, updateUserDto);

    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['photos'],
    });
    if (!user) {
      throw new Error('User not found');
    }
    if (photoUpdates) {
      for (const photoUpdate of photoUpdates) {
        const photo = user.photos.find(p => p.id === photoUpdate.id);
        if (photo) {
          photo.url = photoUpdate.url;
          await this.photoPepository.save(photo);
        } else {
          const newPhoto = this.photoPepository.create({ ...photoUpdate, user });
          await this.photoPepository.save(newPhoto);
        }
      }
    }
    return this.userRepository.findOne({ where: { id }, relations: ['photos'] });
  }

  // async remove(id: number): Promise<void> {
  //     await this.userRepository.delete(id);
  //   }

  async remove(id: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['photos'],
    });
  
    if (!user) {
      throw new Error('User not found');
    }
    await this.photoPepository.delete(user.photos.map(photo => photo.id));
    await this.userRepository.delete(id);
  }

  async setRefreshToken(id: number, refreshToken: string) {
    await this.userRepository.update(id, { refreshToken});
  }
}