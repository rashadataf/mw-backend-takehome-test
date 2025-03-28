import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class ProviderLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    vrm: string;

    @Column()
    provider: string;

    @CreateDateColumn()
    requestTime: Date;

    @Column('int')
    requestDuration: number;

    @Column()
    requestUrl: string;

    @Column('int')
    responseCode: number;

    @Column({ nullable: true })
    errorMessage?: string;
}
