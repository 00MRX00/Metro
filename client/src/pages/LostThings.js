import React, { useEffect, useState } from 'react';
import { useHttp } from '../hooks/http.hook';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import classes from './styles.module.css';


const LostThings = () => {
    const { error, request, clearError } = useHttp();
    const [lostThings, setLostThings] = useState([]);
    const [staffFound, setStaffFound] = useState([]);
    const [stationFound, setStationFound] = useState([]);
    const [isAddClicked, setIsAddClicked] = useState(false);
    const [isInputEnable, setIsInputEnable] = useState({
        isEnable: false,
        rowNumber: 0
    })
    const [rowData, setRowData] = useState({
        title: '',
        staff_found: 0,
        station_found: 0
    })

    useEffect(() => {
        async function lostThingsLoad() {
            const data = await request('http://localhost:5000/api/lostThings', 'GET');
            setLostThings(data.lostThings);
        }

        async function staffFoundLoad() {
            const data = await request('http://localhost:5000/api/staff', 'GET');
            setStaffFound(data.staff);
        }

        async function stationFoundLoad() {
            const data = await request('http://localhost:5000/api/stations', 'GET');
            setStationFound(data.stations);
        }

        lostThingsLoad();
        staffFoundLoad();
        stationFoundLoad();
    }, [request]);

    const onChangeHandler = async (id, index) => {
        if (!isAddClicked) {
            let newData = {
                title: lostThings[index].title,
                staff_found: lostThings[index].staff_found,
                station_found: lostThings[index].station_found
            };
            // staffFound.forEach(st => {
            //     if (st.name === lostThings[index].staff_found) {
            //         newData.staff_found = st.staff_id;
            //     }
            // })
            stationFound.forEach(st => {
                if (st.name === lostThings[index].station_found) {
                    newData.station_found = st.station_id;
                }
            })

            if (isInputEnable.isEnable && isInputEnable.rowNumber !== index) {
                setRowData(newData);
                setIsInputEnable(prev => ({
                    ...prev,
                    rowNumber: index
                }))
            } else if (isInputEnable.isEnable && isInputEnable.rowNumber === index) {
                newData = {
                    title: rowData.title,
                    staff_found: rowData.staff_found,
                    station_found: rowData.station_found
                }
                try {
                    const resp = await request(`http://localhost:5000/api/lostthings/${id}`, 'PUT', JSON.stringify(newData), { 'Content-Type': 'application/json' });
                    if (resp.message === 'Lost thing updated') {
                        const newLostThings = lostThings.slice();
                        let tmpName2 = '';
                        stationFound.forEach(station => {
                            if (station.station_id === parseInt(newData.station_found)) {
                                tmpName2 = station.name;
                            }
                        })
                        newLostThings[index] = {
                            ...newData,
                            station_found: tmpName2
                        };
                        setLostThings(newLostThings);
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
                    const resp = await request(
                        `http://localhost:5000/api/lostthings`,
                        'POST',
                        JSON.stringify({
                            ...rowData,
                            staff_found: rowData.staff_found || staffFound[0].staff_id,
                            station_found: rowData.station_found || stationFound[0].station_id
                        }),
                        { 'Content-Type': 'application/json' }
                    );
                    if (resp.message === 'New lost thing added') {
                        const newLostThings = lostThings.slice();
                        let tmpName2 = '';
                        const tmp = parseInt(rowData.staff_found) || staffFound[0].staff_id;
                        stationFound.forEach(station => {
                            const tmp = parseInt(rowData.station_found) || stationFound[0].station_id;
                            if (station.station_id === tmp) {
                                tmpName2 = station.name;
                            }
                        })
                        newLostThings[index] = {
                            ...rowData,
                            staff_found: tmp,
                            station_found: tmpName2,
                        };
                        setLostThings(newLostThings);
                        clearError();
                    }
                } catch (e) {
                    console.log(e.message);
                    setLostThings(prev => (prev.slice(0, prev.length - 1)));
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
            const resp = await request(`http://localhost:5000/api/lostthings/${id}`, 'DELETE');
            if (resp.message === 'Lost thing was deleted') {
                setLostThings(prev => (prev.slice(0, prev.length - 1)));
                clearError();
            }
        } else {
            setIsInputEnable(prev => ({
                ...prev,
                isEnable: false,
            }))
            setRowData({
                title: '',
                staff_found: 0,
                station_found: 0
            });
            setIsAddClicked(true);
            setLostThings(prev => (prev.slice(0, prev.length - 1)));
        }
    }

    const onInputChange = (value, name) => {
        setRowData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const onAddClickHandler = () => {
        setLostThings(prev => [...prev, {
            title: '',
            staff_found: 0,
            station_found: 0
        }])
        setIsInputEnable({
            isEnable: true,
            rowNumber: lostThings.length
        })
        setRowData({
            title: '',
            staff_found: 0,
            station_found: 0
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
                        <th width='150px'>Название</th>
                        <th width='150px'>Сотрудник</th>
                        <th width='150px'>Станция</th>
                        <th width='150px'>Изменить</th>
                        <th width='150px'>Удалить</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        lostThings ?
                            lostThings.map((st, index) => {
                                if (isInputEnable.isEnable && isInputEnable.rowNumber === index) {
                                    return (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td className={classes.rowInput}><input name='title' type='text' value={rowData.title} onChange={(e) => onInputChange(e.target.value, e.target.name)} /></td>
                                            <td className={classes.rowInput}>
                                                <select
                                                    onChange={(e) => onInputChange(e.target.value, 'staff_found')}
                                                    value={rowData.staff_found} station
                                                >
                                                    {
                                                        staffFound.map((stf, index) => {
                                                            return (
                                                                <option key={index} value={stf.staff_id}>{`${stf.lastname} - ${stf.passport}`}</option>
                                                            );
                                                        })
                                                    }
                                                </select>
                                            </td>
                                            <td className={classes.rowInput}>
                                                <select
                                                    onChange={(e) => onInputChange(e.target.value, 'station_found')}
                                                    value={rowData.station_found}
                                                >
                                                    {
                                                        stationFound.map((stf, index) => {
                                                            return (
                                                                <option key={index} value={stf.station_id}>{stf.name}</option>
                                                            );
                                                        })
                                                    }
                                                </select>
                                            </td>
                                            <td>
                                                <Button
                                                    variant='secondary'
                                                    onClick={() => onChangeHandler(st.thing_id, index)}
                                                >
                                                    Сохранить
                                                </Button>
                                            </td>
                                            <td>
                                                <Button
                                                    variant='secondary'
                                                    onClick={() => onDeleteHandler(st.thing_id)}
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
                                        <td>{st.title}</td>
                                        <td>{st.staff_found}</td>
                                        <td>{st.station_found}</td>
                                        <td>
                                            <Button
                                                variant='secondary'
                                                onClick={() => onChangeHandler(st.thing_id, index)}
                                            >
                                                Изменить
                                                </Button>
                                        </td>
                                        <td>
                                            <Button
                                                variant='secondary'
                                                onClick={() => onDeleteHandler(st.thing_id)}
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

export default LostThings;