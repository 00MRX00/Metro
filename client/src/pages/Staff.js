import React, { useEffect, useState } from 'react';
import { useHttp } from '../hooks/http.hook';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import classes from './styles.module.css';


const Staff = () => {
    const { error, request, clearError } = useHttp();
    const [staff, setStaff] = useState([]);
    const [isAddClicked, setIsAddClicked] = useState(false);
    const [isInputEnable, setIsInputEnable] = useState({
        isEnable: false,
        rowNumber: 0
    })
    const [rowData, setRowData] = useState({
        passport: '',
        phone: '',
        firstname: '',
        lastname: '',
        patronymic: ''
    })

    useEffect(() => {
        async function staffLoad() {
            const rowData = await request('http://localhost:5000/api/staff', 'GET');
            setStaff(rowData.staff);
        }

        staffLoad();
    }, [request]);

    const onChangeHandler = async (id, index) => {
        if (!isAddClicked) {
            let newData = {
                passport: staff[index].passport,
                phone: staff[index].phone,
                firstname: staff[index].firstname,
                lastname: staff[index].lastname,
                patronymic: staff[index].patronymic
            };

            if (isInputEnable.isEnable && isInputEnable.rowNumber !== index) {
                setRowData(newData);
                setIsInputEnable(prev => ({
                    ...prev,
                    rowNumber: index
                }))
            } else if (isInputEnable.isEnable && isInputEnable.rowNumber === index) {
                newData = {
                    passport: rowData.passport,
                    phone: rowData.phone,
                    firstname: rowData.firstname,
                    lastname: rowData.lastname,
                    patronymic: rowData.patronymic
                }
                try {
                    const resp = await request(`http://localhost:5000/api/staff/${id}`, 'PUT', JSON.stringify(newData), { 'Content-Type': 'application/json' });
                    if (resp.message === 'Line updated') {
                        const newStaff = staff.slice();
                        newStaff[index] = newData;
                        setStaff(newStaff);
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
                    const resp = await request(`http://localhost:5000/api/staff`, 'POST', JSON.stringify(rowData), { 'Content-Type': 'application/json' });
                    if (resp.message === 'New staff added') {
                        const newStaff = staff.slice();
                        newStaff[index] = rowData;
                        setStaff(newStaff);
                        clearError();
                    }
                } catch (e) {
                    console.log(e.message);
                    setStaff(prev => (prev.slice(0, prev.length - 1)));
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
            const resp = await request(`http://localhost:5000/api/staff/${id}`, 'DELETE');
            if (resp.message === 'Line was deleted') {
                setStaff(prev => (prev.slice(0, prev.length - 1)));
                clearError();
            }
        } else {
            setIsInputEnable(prev => ({
                ...prev,
                isEnable: false,
            }))
            setRowData({
                passport: '',
                phone: '',
                firstname: '',
                lastname: '',
                patronymic: ''
            });
            setIsAddClicked(true);
            setStaff(prev => (prev.slice(0, prev.length - 1)));
        }
    }

    const onInputChange = (value, name) => {
        setRowData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const onAddClickHandler = () => {
        setStaff(prev => [...prev, {
            passport: '',
            phone: '',
            firstname: '',
            lastname: '',
            patronymic: ''
        }])
        setIsInputEnable({
            isEnable: true,
            rowNumber: staff.length
        })
        setRowData({
            passport: '',
            phone: '',
            firstname: '',
            lastname: '',
            patronymic: ''
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
                <thead>
                    <tr>
                        <th width='50px'>№</th>
                        <th width='150px'>Паспорт</th>
                        <th width='150px'>Телефон</th>
                        <th width='150px'>Имя</th>
                        <th width='150px'>Фамилия</th>
                        <th width='150px'>Отчество</th>
                        <th width='150px'>Изменить</th>
                        <th width='150px'>Удалить</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        staff ?
                            staff.map((st, index) => {
                                if (isInputEnable.isEnable && isInputEnable.rowNumber === index) {
                                    return (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td className={classes.rowInput}><input name='passport' type='text' value={rowData.passport} onChange={(e) => onInputChange(e.target.value, e.target.name)} /></td>
                                            <td className={classes.rowInput}><input name='phone' type='text' value={rowData.phone} onChange={(e) => onInputChange(e.target.value, e.target.name)} /></td>
                                            <td className={classes.rowInput}><input name='firstname' type='text' value={rowData.firstname} onChange={(e) => onInputChange(e.target.value, e.target.name)} /></td>
                                            <td className={classes.rowInput}><input name='lastname' type='text' value={rowData.lastname} onChange={(e) => onInputChange(e.target.value, e.target.name)} /></td>
                                            <td className={classes.rowInput}><input name='patronymic' type='text' value={rowData.patronymic} onChange={(e) => onInputChange(e.target.value, e.target.name)} /></td>
                                            <td>
                                                <Button
                                                    variant='secondary'
                                                    onClick={() => onChangeHandler(st.staff_id, index)}
                                                >
                                                    Сохранить
                                                </Button>
                                            </td>
                                            <td>
                                                <Button
                                                    variant='secondary'
                                                    onClick={() => onDeleteHandler(st.staff_id)}
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
                                        <td>{st.passport}</td>
                                        <td>{st.phone}</td>
                                        <td>{st.firstname}</td>
                                        <td>{st.lastname}</td>
                                        <td>{st.patronymic}</td>
                                        <td>
                                                <Button
                                                    variant='secondary'
                                                    onClick={() => onChangeHandler(st.staff_id, index)}
                                                >
                                                    Изменить
                                                </Button>
                                            </td>
                                            <td>
                                                <Button
                                                    variant='secondary'
                                                    onClick={() => onDeleteHandler(st.staff_id)}
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

export default Staff;