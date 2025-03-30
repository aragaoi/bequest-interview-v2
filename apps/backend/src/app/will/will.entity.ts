import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Will {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  mimeType: string;

  @Column()
  size: number;

  @Column()
  buffer: string;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}
