import React from 'react';
import {Navbar, Nav} from 'react-bootstrap';
import { Link } from 'react-router-dom';


const Header = () => {
    return (
        <Navbar bg="dark" variant="dark">
            <Nav className="mr-auto">
                <Nav.Link as={Link} to="/staff">Сотрудники</Nav.Link>
                <Nav.Link as={Link} to="/lines">Ветки</Nav.Link>
                <Nav.Link as={Link} to="/stations">Станции</Nav.Link>
                <Nav.Link as={Link} to="/tickets">Билеты</Nav.Link>
                <Nav.Link as={Link} to="/lostthings">Потерянные вещи</Nav.Link>
            </Nav>
        </Navbar>
    );
};

export default Header;