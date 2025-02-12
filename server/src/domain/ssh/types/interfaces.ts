export interface IGetLoginEvents {
	search?: string;
	page: number;
	limit: number;
}

export interface ILoginEvent {
	id?: number;
	timestamp: Date;
	username: string;
	ip: string;
	host: string;
	status: string;
	authMethod: string;
}
export interface ILoginEventHistory {
	data: ILoginEvent[];
	total: number;
	page: number;
	limit: number;
}