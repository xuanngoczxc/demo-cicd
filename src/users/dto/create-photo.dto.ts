import { IsNotEmpty } from "class-validator";

export class CreatePhotoDto {
    @IsNotEmpty()
    readonly url: string;

    @IsNotEmpty()
    readonly userId: number;
}