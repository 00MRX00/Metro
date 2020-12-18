import React from 'react';
import { useRoutes } from './pages/routes';
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Header from './hoc/Header';

const App = () => {
	return (
		<Container>
			<Header />
			{useRoutes()}
		</Container>
	);
}

export default App;
