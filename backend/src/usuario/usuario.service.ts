import {
  ConflictException,
  Injectable,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { Usuario } from './entities/usuario.entity';
import { CrearUsuarioDto } from './dto/crear-usuario.dto';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository:
      Repository<Usuario>,
  ) {}

  async crear(
    crearUsuarioDto: CrearUsuarioDto,
  ) {
    const usuarioExistente =
      await this.usuarioRepository.findOne({
        where: {
          usuarioCorreo:
            crearUsuarioDto.usuarioCorreo,
        },
      });

    if (usuarioExistente) {
      throw new ConflictException(
        'El correo ya está registrado',
      );
    }

    const passwordHash = await bcrypt.hash(
      crearUsuarioDto.usuarioPassword,
      10,
    );

    const usuario =
      this.usuarioRepository.create({
        usuarioNombre:
          crearUsuarioDto.usuarioNombre,

        usuarioCorreo:
          crearUsuarioDto.usuarioCorreo,

        usuarioPasswordHash:
          passwordHash,

        usuarioFechaRegistro:
          new Date()
            .toISOString()
            .slice(0, 10),
      });

    const usuarioGuardado =
      await this.usuarioRepository.save(
        usuario,
      );

    return {
      usuarioId:
        usuarioGuardado.usuarioId,

      usuarioNombre:
        usuarioGuardado.usuarioNombre,

      usuarioCorreo:
        usuarioGuardado.usuarioCorreo,

      usuarioFechaRegistro:
        usuarioGuardado.usuarioFechaRegistro,
    };
  }
}