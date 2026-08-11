import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';

export class CrearUsuarioDto {
  @IsString()
  @IsNotEmpty()
  usuarioNombre: string;

  @IsEmail()
  usuarioCorreo: string;

  @IsString()
  @MinLength(6)
  usuarioPassword: string;
}