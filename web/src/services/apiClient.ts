import axios from 'axios';

const apiClient = axios.create({
	baseURL: `${process.env.REACT_APP_API_URL || 'http://localhost:3010'}/v1`,
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
});

export default apiClient;