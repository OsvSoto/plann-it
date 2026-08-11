import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import { UsuarioService } from './usuario.service';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';

@Controller('usuarios')
export class UsuarioController {
  constructor(
    private readonly usuarioService:
      UsuarioService,
  ) {}

  @Post()
  crear(
    @Body()
    crearUsuarioDto: CrearUsuarioDto,
  ) {
    return this.usuarioService.crear(
      crearUsuarioDto,
    );
  }
}