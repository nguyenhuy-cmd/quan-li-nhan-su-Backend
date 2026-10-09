import { NotFoundException } from "@nestjs/common";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty({message: 'Username  phải đc ghi'})
    username: string;

    @IsNotEmpty({message: 'Email phải đc ghi'})
    @IsEmail()
    email: string;

    @IsNotEmpty({message: 'Mật khẩu phải đc ghi'})
    @IsString()
    @MinLength(6, {
        message: 'Mật khẩu phải ít nhất 6 kí tự'
    })
    password: string;
}
