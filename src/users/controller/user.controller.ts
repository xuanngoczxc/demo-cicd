import { Body, Controller, Delete, Get, Param, ParseArrayPipe, ParseIntPipe, Post, Put, Query, Search, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { UsersService } from "../services/users.service";
import { CreateUserDto } from "../dto/create-user.dto";
import { PaginationDto } from "../dto/pagination.dto";
import { User } from "../entity/user.entity";
import { ApiQuery } from "@nestjs/swagger";
import { UpdateUserDto } from "../dto/update-user.dto";
import { Roles } from "src/auth/decorators/roles.decorator";
import { Role } from "src/auth/enums/rol.enum";
import { AuthGuard } from "src/auth/guard/auth.guard";
import { RolesGuard } from "src/auth/guard/roles.guard";
import { Photo } from "../entity/photo.entity";

@Controller('users')
export class UserController {
    constructor(private readonly userService: UsersService){}

    @Post()
    @Roles(Role.Admin)
    @UseGuards(AuthGuard, RolesGuard)
    create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    // @Post()
    // create(@Body(new ParseArrayPipe({ items: CreateUserDto })) createUserDtos: CreateUserDto[]) {
    //     return this.userService.create(createUserDtos);
    // }

    @Get()
    @UsePipes(new ValidationPipe({ transform: true }))
    async findAll(
        @Query() paginationDto: PaginationDto,
        @Query('search') search?: string,
    ): Promise<{ users: User[]; total: number; totalPages: number; currentPage: number;
    }> {
        return await this.userService.findAll(paginationDto, search);
    } 

    @Get('pagination')
    @UsePipes(new ValidationPipe({ transform: true }))
    async searchPaginated(
        @Query() paginationDto: PaginationDto,
    ): Promise<{ users: User[]; total: number; totalPages: number; currentPage: number;
    }> {
        const result = await this.userService.findAllPaginated(paginationDto);
        return result;
    }

    @Get('name/:name')
    async findUsers(@Param('name') name: string): Promise<User[]> {
        return await this.userService.findSearchUsers(name);
    }
    
    @Get('id/:id')
    findOne(@Param('id') id: number) {
        return this.userService.findOne(id);
    }

    @Put(':id')
    @Roles(Role.Admin)
    @UseGuards(AuthGuard, RolesGuard)
    async update(
        @Param('id') id: number,
        @Body() updateUserDto: UpdateUserDto,
        @Body('photos') photos?: Photo[],
    ): Promise<User> {
        return this.userService.update(id, updateUserDto, photos);
    }
  
    @Delete(':id')
    @Roles(Role.Admin)
    @UseGuards(AuthGuard, RolesGuard)
    remove(@Param('id') id: string) {
        return this.userService.remove(+id);
    }

}