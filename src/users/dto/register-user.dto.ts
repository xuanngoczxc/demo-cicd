import { IsNotEmpty } from "class-validator";

export class RegisterUserDto {
    
    @IsNotEmpty()
    readonly name?: string;

    @IsNotEmpty()
    readonly email: string;

    @IsNotEmpty()
    readonly password: string;

}