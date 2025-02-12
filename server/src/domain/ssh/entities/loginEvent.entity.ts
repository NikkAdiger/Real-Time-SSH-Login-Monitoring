import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import { ILoginEvent } from '../types/interfaces';
import { networkInterfaces } from 'os';

@Entity('history')
export class LoginEventEntity implements ILoginEvent {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'timestamptz' })
	timestamp: Date;

	@Column({ type: 'varchar', nullable: true })
	username: string;

	@Column({ type: 'inet', nullable: true })
	ip: string;

	@Column({ type: 'varchar', length: 100, nullable: true })
	host: string;

	@Column({ type: 'varchar', length: 50, nullable: true })
	status: string;

	@Column({ name: 'auth_method', type: 'varchar', length: 50, nullable: true })
	authMethod: string;

	@CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
	createdAt: Date;
}