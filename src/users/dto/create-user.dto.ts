import { IsEnum, IsNotEmpty } from "class-validator";
import { Role } from "src/auth/enums/rol.enum";

export class CreateUserDto {
    
    @IsNotEmpty()
    readonly name?: string;

    @IsNotEmpty()
    readonly email: string;

    @IsNotEmpty()
    readonly password: string;

    @IsNotEmpty()
    @IsEnum(Role, { message: ''})
    readonly role: Role;

}