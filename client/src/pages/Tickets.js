import React, { useEffect, useState } from 'react';
import { useHttp } from '../hooks/http.hook';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import classes from './styles.module.css';


const Tickets = () => {
    const { error, request, clearError } = useHttp();
    const [tickets, setTickets] = useState([]);
    const [isAddClicked, setIsAddClicked] = useState(false);
    const [isInputEnable, setIsInputEnable] = useState({
        isEnable: false,
        rowNumber: 0
    })
    const [rowData, setRowData] = useState({
        trips_count: 0,
        balance: 0,
        fit_to: ''
    })

    useEffect(() => {
        async function ticketsLoad() {
            const data = await request('http://localhost:5000/api/tickets', 'GET');
            setTickets(data.tickets);
        }

        ticketsLoad();
    }, [request]);

    const onChangeHandler = async (id, index) => {
        if (!isAddClicked) {
            let newData = {
                ticket_id: id,
                trips_count: tickets[index].trips_count,
                balance: tickets[index].balance,
                fit_to: tickets[index].fit_to
            };

            if (isInputEnable.isEnable && isInputEnable.rowNumber !== index) {
                setRowData(newData);
                setIsInputEnable(prev => ({
                    ...prev,
                    rowNumber: index
                }))
            } else if (isInputEnable.isEnable && isInputEnable.rowNumber === index) {
                newData = {
                    ticket_id: id,
                    trips_count: parseInt(rowData.trips_count),
                    balance: parseFloat(rowData.balance),
                    fit_to: rowData.fit_to
                }
                try {
                    const resp = await request(`http://localhost:5000/api/tickets/${id}`, 'PUT', JSON.stringify(newData), { 'Content-Type': 'application/json' });
                    if (resp.message === 'Ticket updated') {
                        const newTickets = tickets.slice();
                        newTickets[index] = newData;
                        setTickets(newTickets);
                        clearError();
                    }
                } catch (e) {
                    console.log(e.message);
                }
                setIsInputEnable(prev => ({
                    isEnable: !prev.isEnable,
                    rowNumber: index
                }))
            } else {
                setRowData(newData);
                setIsInputEnable(prev => ({
                    isEnable: !prev.isEnable,
                    rowNumber: index
                }))
            }
        } else {
            if (isInputEnable.isEnable) {
                try {
                    const resp = await request(`http://localhost:5000/api/tickets`, 'POST', JSON.stringify(rowData), { 'Content-Type': 'application/json' });
                    if (resp.message === 'New ticket added') {
                        const newTickets = tickets.slice();
                        newTickets[index] = rowData;
                        setTickets(newTickets);
                        clearError();
                    }
                } catch (e) {
                    console.log(e.message);
                    setTickets(prev => (prev.slice(0, prev.length - 1)));
                }
                setIsAddClicked(false);
            }
            setIsInputEnable(prev => ({
                isEnable: !prev.isEnable,
                rowNumber: index
            }))
        }
    }

    const onDeleteHandler = async (id) => {
        if (id) {
            const resp = await request(`http://localhost:5000/api/tickets/${id}`, 'DELETE');
            if (resp.message === 'Ticket was deleted') {
                setTickets(prev => (prev.slice(0, prev.length - 1)));
                clearError();
            }
        } else {
            setIsInputEnable(prev => ({
                ...prev,
                isEnable: false,
            }))
            setRowData({
                trips_count: 0,
                balance: 0,
                fit_to: ''
            });
            setIsAddClicked(true);
            setTickets(prev => (prev.slice(0, prev.length - 1)));
        }
    }

    const onInputChange = (value, name) => {
        setRowData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const onAddClickHandler = () => {
        setTickets(prev => [...(prev || []), {
            trips_count: 0,
            balance: 0,
            fit_to: ''
        }])
        setIsInputEnable({
            isEnable: true,
            rowNumber: tickets ? tickets.length : 0
        })
        setRowData({
            trips_count: 0,
            balance: 0,
            fit_to: ''
        });
        setIsAddClicked(true);
    }

    return (
        <div>
            <Button
                variant='secondary'
                style={{
                    margin: '5px 0'
                }}
                onClick={onAddClickHandler}
            >Добавить</Button>
            <Table striped bordered hover variant='dark'>
                <thead align='center'>
                    <tr>
                        <th width='50px'>№</th>
                        <th width='150px'>Количество поездок</th>
                        <th width='150px'>Баланс</th>
                        <th width='150px'>Действует до</th>
                        <th width='150px'>Изменить</th>
                        <th width='150px'>Удалить</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        tickets ?
                            tickets.map((st, index) => {
                                if (isInputEnable.isEnable && isInputEnable.rowNumber === index) {
                                    return (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td className={classes.rowInput}><input name='trips_count' type='text' value={rowData.trips_count} onChange={(e) => onInputChange(e.target.value, e.target.name)} /></td>
                                            <td className={classes.rowInput}><input name='balance' type='text' value={rowData.balance} onChange={(e) => onInputChange(e.target.value, e.target.name)} /></td>
                                            <td className={classes.rowInput}><input name='fit_to' type='text' value={rowData.fit_to} onChange={(e) => onInputChange(e.target.value, e.target.name)} /></td>
                                            <td>
                                                <Button
                                                    variant='secondary'
                                                    onClick={() => onChangeHandler(st.ticket_id, index)}
                                                >
                                                    Сохранить
                                                </Button>
                                            </td>
                                            <td>
                                                <Button
                                                    variant='secondary'
                                                    onClick={() => onDeleteHandler(st.ticket_id)}
                                                >
                                                    Удалить
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                }
                                return (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{st.trips_count}</td>
                                        <td>{st.balance}</td>
                                        <td>{st.fit_to}</td>
                                        <td>
                                            <Button
                                                variant='secondary'
                                                onClick={() => onChangeHandler(st.ticket_id, index)}
                                            >
                                                Изменить
                                                </Button>
                                        </td>
                                        <td>
                                            <Button
                                                variant='secondary'
                                                onClick={() => onDeleteHandler(st.ticket_id)}
                                            >
                                                Удалить
                                                </Button>
                                        </td>
                                    </tr>
                                );
                            })
                            :
                            <></>
                    }
                </tbody>
            </Table>
            {
                error ?
                    <Alert variant='danger'>
                        {error}
                    </Alert>
                    :
                    <></>
            }
        </div>
    );
}

export default Tickets;