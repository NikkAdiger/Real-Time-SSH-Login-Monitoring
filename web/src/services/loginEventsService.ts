import { AxiosResponse } from 'axios';
import apiClient from './apiClient.ts';

export interface ILoginEvent {
    timestamp: string | '';
    username: string | '';
    ip: string | '';
	host: string | '';
    status: string | '';
	authMethod: string | '';
}

export const getLoginEvents = async (search: string, page: number, limit: number): Promise<{data: ILoginEvent[], total: number, page: number, limit: number}> => {
	const response: AxiosResponse<{ data: ILoginEvent[], total: number, page: number, limit: number }> = await apiClient.get('/events', {
		params: {
			search,
			page,
			limit,
		},
	});

	return {
		data: response.data.data,
		total: response.data.total,
		page: response.data.page,
		limit: response.data.limit,
	};
};