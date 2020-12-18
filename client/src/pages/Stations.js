import React, { useEffect, useState } from 'react';
import { useHttp } from '../hooks/http.hook';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import classes from './styles.module.css';


const Stations = () => {
    const { error, request, clearError } = useHttp();
    const [stations, setStations] = useState([]);
    const [lines, setLines] = useState([]);
    const [isAddClicked, setIsAddClicked] = useState(false);
    const [isInputEnable, setIsInputEnable] = useState({
        isEnable: false,
        rowNumber: 0
    })
    const [rowData, setRowData] = useState({
        name: '',
        line: 0
    })

    useEffect(() => {
        async function stationsLoad() {
            const data = await request('http://localhost:5000/api/stations', 'GET');
            setStations(data.stations);
        }

        stationsLoad();
    }, [request]);

    useEffect(() => {
        async function linesLoad() {
            const data = await request('http://localhost:5000/api/lines', 'GET');
            setLines(data.lines);
        }

        linesLoad();
    }, [request]);

    const onChangeHandler = async (id, index) => {
        if (!isAddClicked) {
            let newData = {
                station_id: id,
                name: stations[index].name,
                line: 0
            };
            lines.forEach(line => {
                if (line.name === stations[index].line) {
                    newData.line = line.line_id;
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
                    station_id: id,
                    name: rowData.name,
                    line: rowData.line
                }
                try {
                    const resp = await request(`http://localhost:5000/api/stations/${id}`, 'PUT', JSON.stringify(newData), { 'Content-Type': 'application/json' });
                    if (resp.message === 'Station updated') {
                        const newStations = stations.slice();
                        let tmpName = '';
                        lines.forEach(line => {
                            if (line.line_id === parseInt(newData.line)) {
                                tmpName = line.name;
                            }
                        })
                        newStations[index] = {
                            ...newData,
                            line: tmpName
                        };
                        setStations(newStations);
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
                    const resp = await request(`http://localhost:5000/api/stations`, 'POST', JSON.stringify({ ...rowData, line: rowData.line || lines[0].line_id }), { 'Content-Type': 'application/json' });
                    if (resp.message === 'New station added') {
                        const newStations = stations.slice();
                        let tmpName = '';
                        lines.forEach(line => {
                            const tmp = parseInt(rowData.line) || lines[0].line_id;
                            if (line.line_id === tmp) {
                                tmpName = line.name;
                            }
                        })
                        newStations[index] = {
                            ...rowData,
                            line: tmpName
                        };
                        setStations(newStations);
                        clearError();
                    }
                } catch (e) {
                    console.log(e.message);
                    setStations(prev => (prev.slice(0, prev.length - 1)));
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
            const resp = await request(`http://localhost:5000/api/stations/${id}`, 'DELETE');
            if (resp.message === 'Station was deleted') {
                setStations(prev => (prev.slice(0, prev.length - 1)));
                clearError();
            }
        } else {
            setIsInputEnable(prev => ({
                ...prev,
                isEnable: false,
            }))
            setRowData({
                name: '',
                line: 0
            });
            setIsAddClicked(true);
            setStations(prev => (prev.slice(0, prev.length - 1)));
        }
    }

    const onInputChange = (value, name) => {
        setRowData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const onAddClickHandler = () => {
        setStations(prev => [...prev, {
            name: '',
            line: 0
        }])
        setIsInputEnable({
            isEnable: true,
            rowNumber: stations.length
        })
        setRowData({
            name: '',
            line: 0
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
                        <th width='150px'>Ветка</th>
                        <th width='150px'>Изменить</th>
                        <th width='150px'>Удалить</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        stations ?
                            stations.map((st, index) => {
                                if (isInputEnable.isEnable && isInputEnable.rowNumber === index) {
                                    return (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td className={classes.rowInput}><input name='name' type='text' value={rowData.name} onChange={(e) => onInputChange(e.target.value, e.target.name)} /></td>
                                            <td className={classes.rowInput}>
                                                <select
                                                    onChange={(e) => onInputChange(e.target.value, 'line')}
                                                    value={rowData.line}
                                                >
                                                    {
                                                        lines.map((line, index) => {
                                                            return (
                                                                <option key={index} value={line.line_id}>{line.name}</option>
                                                            );
                                                        })
                                                    }
                                                </select>
                                            </td>
                                            <td>
                                                <Button
                                                    variant='secondary'
                                                    onClick={() => onChangeHandler(st.station_id, index)}
                                                >
                                                    Сохранить
                                                </Button>
                                            </td>
                                            <td>
                                                <Button
                                                    variant='secondary'
                                                    onClick={() => onDeleteHandler(st.station_id)}
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
                                        <td>{st.name}</td>
                                        <td>{st.line}</td>
                                        <td>
                                            <Button
                                                variant='secondary'
                                                onClick={() => onChangeHandler(st.station_id, index)}
                                            >
                                                Изменить
                                                </Button>
                                        </td>
                                        <td>
                                            <Button
                                                variant='secondary'
                                                onClick={() => onDeleteHandler(st.station_id)}
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

export default Stations;