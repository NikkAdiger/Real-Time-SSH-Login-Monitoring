export interface IConfigApi {
	port: number;
}

export interface IConfigDb {
	host: string;
	port: number;
	username: string;
	password: string;
	database: string;
	synchronize: boolean,
	logging: boolean,
	runMigrations?: boolean | string;
}

export interface IConfig {
	api: IConfigApi;
	db: IConfigDb;
}