import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn({
    name: 'usuario_id',
  })
  usuarioId: number;

  @Column({
    name: 'usuario_nombre',
    length: 100,
  })
  usuarioNombre: string;

  @Column({
    name: 'usuario_correo',
    length: 150,
    unique: true,
  })
  usuarioCorreo: string;

  @Column({
    name: 'usuario_password_hash',
    length: 255,
  })
  usuarioPasswordHash: string;

  @Column({
    name: 'usuario_fecha_registro',
    type: 'date',
  })
  usuarioFechaRegistro: string;
}