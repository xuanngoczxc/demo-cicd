import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { Photo } from "./photo.entity"
import { Role } from "src/auth/enums/rol.enum";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name:string;
y
    @Column({ unique: true, nullable: false})
    email: string;

    @Column({ nullable: false})
    password: string;

    @Column({
        type: 'enum',
        enum: Role,
        default: Role.User,
      })
      role: Role;

    @Column({ nullable: true })
    refreshToken: string;

    @OneToMany(() => Photo, photo => photo.user)
    photos: Photo[];
}