	import { useState, useEffect } from 'react';
	import io from 'socket.io-client';
	import { format } from 'date-fns'; // Make sure you have date-fns installed: npm install date-fns
	import React from 'react';
	import { getLoginEvents } from './services/loginEventsService.ts';

	const App = () => {
	const visiblePages = 10;

	interface Event {
		username: string;
		ip: string;
		host: string;
		timestamp: number;
		authMethod: string;
		status: string;
	}

	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(false);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 10,
		total: 0,
		totalNumberOfPages: 0,
	});
	const [ , setSocket] = useState(null);
	const [searchQuery, setSearchQuery] = useState('');
	const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

	const handlePageChange = (page: number) => {
		setPagination((prevState) => ({ ...prevState, page }));
	};

	const fetchEvents = async () => {
		try {
		setLoading(true);
		const eventsData = await getLoginEvents(
			debouncedSearchQuery,
			pagination.page,
			pagination.limit
		);
		setEvents(eventsData.data);
		setPagination((prevState) => ({
			...prevState,
			total: eventsData.total,
			totalNumberOfPages: Math.ceil(eventsData.total / pagination.limit) || 1,
		}));
		} catch (error) {
		console.error("Error in fetchEvents:", error);
		// Consider displaying an error message to the user
		} finally {
		setLoading(false);
		}
	};

	const handleSearchChange = (value: string) => {
		setSearchQuery(value);
	};

	const getPageRange = () => {
		const totalPages = pagination.totalNumberOfPages;
		const currentPage = pagination.page;

		if (totalPages <= visiblePages) {
			return [1, totalPages]; // Show all pages if total is less than or equal to visiblePages
		}

		const halfVisible = Math.floor(visiblePages / 2);
		let startPage = Math.max(1, currentPage - halfVisible);
		let endPage = Math.min(totalPages, currentPage + halfVisible);

		// Adjust start and end if near boundaries
		if (endPage - startPage + 1 < visiblePages) {
			if (currentPage <= halfVisible) {
				endPage = Math.min(totalPages, visiblePages);
			} else {
				startPage = Math.max(1, totalPages - visiblePages + 1);
			}
		}

		return [startPage, endPage];
	};

	useEffect(() => {
		const handler = setTimeout(() => {
		setDebouncedSearchQuery(searchQuery);
		}, 300);
		return () => clearTimeout(handler);
	}, [searchQuery]);

	useEffect(() => {
		if (debouncedSearchQuery.length >= 3 || debouncedSearchQuery.length === 0) {
		fetchEvents();
		}
	}, [debouncedSearchQuery, pagination.page, pagination.limit]);

	useEffect(() => {
		const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:3010';
		console.log('Connecting to WebSocket server:', wsUrl);

		const newSocket = io(wsUrl, { transports: ['websocket'] });

		newSocket.on('login-event', fetchEvents); // Use the same fetchEvents function

		const handleError = (error: Error) => {
		console.error("WebSocket connection error:", error.message);
		};

		newSocket.on('connect_error', handleError);
		newSocket.on('connect', () => {
		console.log('Connected to WebSocket server');
		});
		newSocket.on('disconnect', (reason) => {
		console.log('Disconnected from WebSocket server:', reason);
		});

		setSocket(newSocket);

		return () => {
		if (newSocket) {
			newSocket.off('login-event', fetchEvents);
			newSocket.off('connect_error', handleError);
			newSocket.off('connect');
			newSocket.off('disconnect');
			newSocket.disconnect();
		}
		};
	}, []);

	useEffect(() => {
		fetchEvents();
	}, [pagination.page, pagination.limit]);

	return (
		<div className="container mt-4">
			<div className="d-flex align-items-center justify-content-between mb-3">
				<h1 className="fs-4 mb-0">Real-Time SSH Login Monitoring</h1>
				<div className="d-flex align-items-center">
					<input
						type="text"
						className="form-control me-3"
						placeholder="Search by IP or Username"
						aria-label="Search"
						value={searchQuery}
						onChange={(e) => handleSearchChange(e.target.value)}
					/>
				</div>
			</div>

			{loading ? (
				<div className="text-center">
					<div className="spinner-border" role="status">
						<span className="visually-hidden">Loading...</span>
					</div>
				</div>
			) : (
				<table className="table table-striped table-hover">
					<thead>
						<tr>
							<th>User</th>
							<th>IP</th>
							<th>Host</th>
							<th>Time</th>
							<th>Auth method</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						{events.map((event, idx) => (
							<tr key={idx}>
								<td>{event.username}</td>
								<td>{event.ip}</td>
								<td>{event.host}</td>
								<td>{format(event.timestamp, 'MM/dd/yyyy HH:mm:ss')}</td>
								<td>{event.authMethod}</td>
								<td>
									<span className={`badge ${event.status === 'Accepted' ? 'bg-success' : 'bg-danger'}`}>
										{event.status}
									</span>
								</td>
							</tr>
						))}
						{events.length === 0 && ( // Display a message if no events are found
							<tr>
								<td colSpan={6} className="text-center">No events found.</td>
							</tr>
						)}
					</tbody>
				</table>
			)}

			<nav className="mt-4">
				<ul className="pagination justify-content-center">
					<li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
						<button className="page-link" onClick={() => handlePageChange(1)} aria-label="First">
							&laquo;
						</button>
					</li>
					<li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
						<button className="page-link" onClick={() => handlePageChange(pagination.page - 1)} aria-label="Previous">
							&lt;
						</button>
					</li>

					{(() => {
						const [startPage, endPage] = getPageRange();
						const pages = [];

						for (let i = startPage; i <= endPage; i++) {
							pages.push(
								<li key={i} className={`page-item ${pagination.page === i ? 'active' : ''}`}>
									<button className="page-link" onClick={() => handlePageChange(i)}>
										{i}
									</button>
								</li>
							);
						}
						return pages;
					})()}

					<li className={`page-item ${pagination.page === pagination.totalNumberOfPages ? 'disabled' : ''}`}>
						<button className="page-link" onClick={() => handlePageChange(pagination.page + 1)} aria-label="Next">
							&gt;
						</button>
					</li>
					<li className={`page-item ${pagination.page === pagination.totalNumberOfPages ? 'disabled' : ''}`}>
						<button className="page-link" onClick={() => handlePageChange(pagination.totalNumberOfPages)} aria-label="Last">
							&raquo;
						</button>
					</li>
				</ul>
			</nav>
		</div>
	);
};

export default App;