import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { LoginEventEntity } from '../entities/loginEvent.entity';
import { IGetLoginEvents } from '../types/interfaces';

@Injectable()
export default class LoginEventRepository {
	constructor(
		@InjectRepository(LoginEventEntity) private loginEventRepository: Repository<LoginEventEntity>,
	) {}

	async getAllLoginEvents({ search, page, limit }: IGetLoginEvents): Promise<{
		data: LoginEventEntity[];
		total: number;
		page: number;
		limit: number;
	}> {
		const offset = (page - 1) * limit;

		const queryBuilder = this.loginEventRepository.createQueryBuilder('events');

		if (search) {
			const likeSearch = `%${search}%`;

			queryBuilder.andWhere(
				new Brackets((qb) => {
					qb.where('events.ip::text ILIKE :likeSearch', { likeSearch })
						.orWhere('events.username ILIKE :likeSearch', { likeSearch });
				}),
			);
		}

		const [data, total] = await queryBuilder
			.orderBy('events.timestamp', 'DESC')
			.skip(offset)
			.take(limit)
			.getManyAndCount();

		return {
			data,
			total,
			page,
			limit,
		};
	}

	async save(entity: Omit<LoginEventEntity, 'id' | 'createdAt'>): Promise<LoginEventEntity> {
		return this.loginEventRepository.save({
			...entity,
		});
	}
}