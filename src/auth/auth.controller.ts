import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './guard/auth.guard';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { Request } from 'express';

interface RequestWithUser extends Request {
    user: {
        email: string;
        id: number;
        role:string
    }
}
@Controller('auth')
export class AuthController {
    constructor (
        private readonly authService: AuthService
    ){}

    @Post('register')
    register(@Body() registerDto: RegisterDto,) {
        return this.authService.register(registerDto)
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Get('profile')
    @UseGuards(AuthGuard)
    profile(@Req() req: RequestWithUser ) { 
        return this.authService.profile(req.user)
    }

    @Post('refresh')
    async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.refresh(refreshTokenDto.refreshToken);
    }
}
