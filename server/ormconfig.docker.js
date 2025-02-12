const path = require('path');

const appRootDir = path.join(__dirname, 'dist');

console.log(appRootDir);

process.env['NODE_CONFIG_DIR'] = path.join(appRootDir, '/config/');

const config = require('config');
const { DataSource } = require('typeorm');
const dbConfig = config.get('db');

module.exports = {
	default: new DataSource({
		type: 'postgres',
		...dbConfig,
		entities: [
			appRootDir + `/**/entities/*.js`,
		],
		migrationsTableName: 'migrations',
		migrations: [
			appRootDir + `/migrations/**/*.js`,
		],
	}),
};
