import { Transform } from "class-transformer";
import { IsEmail, IsString, MinLength } from "class-validator";


export class RegisterDto {

    @Transform(({value}) => value.trim())
    @IsString()
    @MinLength(1)
    name: string;
    
    @IsEmail()
    email: string;
    
    @IsString()
    @MinLength(6)
    @Transform(({value}) => value.trim())
    password: string;

}