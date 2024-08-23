import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from 'src/users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt'
import { access } from 'fs';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ){}

    async register({name, email, password}: RegisterDto) {
        
        const user = await this.usersService.findOneByEmail(email);
        
        if(user) {
            throw new BadRequestException('Người dùng đã tồn tại')
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // const createUserDto: CreateUserDto = {
        //     name: name,
        //     email: email,
        //     password: hashedPassword
        // }
        // await this.usersService.create(createUserDto);

        await this.usersService.registerUser({
            name, email , password: await bcrypt.hash(password, 10),
        });

        return {
            name,
            email,
            password,
        }

        // return {
        //     message: "User created successfully"
        // }
    }

    async login({email, password}: LoginDto) {
        const user = await this.usersService.findOneByEmail(email);
        if(!user) {
            throw new UnauthorizedException('email không đúng');
        }
        // const isPasswordValid = await bcrypt.compare(password, user.password) 
        let isPasswordValid = false;

        if(user.password.startsWith('$2b$')) {
            isPasswordValid = await bcrypt.compare(password, user.password);
        } else {
            isPasswordValid = password === user.password;
        }

        if(!isPasswordValid){
            throw new UnauthorizedException('password không đúng');
        }

        const payload = { email: user.email, id: user.id, role: user.role};
        const accessToken = await this.jwtService.signAsync(payload,{
            expiresIn: '2m'
        });

        const refreshToken = await this.jwtService.signAsync(payload,{
            expiresIn: '10m'
        });

        return { 
            access_token: accessToken,
            refresh_token: refreshToken
        };
    }

    async refresh(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const { email, id } = payload;
    
            const newPayload = { email, id };
            const newAccessToken = await this.jwtService.signAsync(newPayload, { expiresIn: '2m' });
            const newRefreshToken = await this.jwtService.signAsync(newPayload, { expiresIn: '10m' });
    
            return {
                access_token: newAccessToken,
                refresh_token: newRefreshToken,
            };
        } catch (e) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async profile({ email, id, role}: {email: string, id: number, role: string}) {

        // if(role !== 'admin') {
        //     throw new UnauthorizedException(
        //         'You are not authorized to access this resource',
        //     );
        // }
        return await this.usersService.findOneByEmail(email);
    }
}
