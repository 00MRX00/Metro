import React, { useEffect, useState } from 'react';
import { useHttp } from '../hooks/http.hook';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import classes from './styles.module.css';


const Lines = () => {
    const { error, request, clearError } = useHttp();
    const [lines, setLines] = useState([]);
    const [isAddClicked, setIsAddClicked] = useState(false);
    const [isInputEnable, setIsInputEnable] = useState({
        isEnable: false,
        rowNumber: 0
    })
    const [rowData, setRowData] = useState({
        name: '',
        color: ''
    })

    useEffect(() => {
        async function linesLoad() {
            const rowData = await request('http://localhost:5000/api/lines', 'GET');
            setLines(rowData.lines);
        }

        linesLoad();
    }, [request]);

    const onChangeHandler = async (id, index) => {
        if (!isAddClicked) {
            let newData = {
                line_id: id,
                name: lines[index].name,
                color: lines[index].color
            };

            if (isInputEnable.isEnable && isInputEnable.rowNumber !== index) {
                setRowData(newData);
                setIsInputEnable(prev => ({
                    ...prev,
                    rowNumber: index
                }))
            } else if (isInputEnable.isEnable && isInputEnable.rowNumber === index) {
                newData = {
                    line_id: id,
                    name: rowData.name,
                    color: rowData.color
                }
                try {
                    const resp = await request(`http://localhost:5000/api/lines/${id}`, 'PUT', JSON.stringify(newData), { 'Content-Type': 'application/json' });
                    if (resp.message === 'Line updated') {
                        const newLines = lines.slice();
                        newLines[index] = newData;
                        setLines(newLines);
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
                    const resp = await request(`http://localhost:5000/api/lines`, 'POST', JSON.stringify(rowData), { 'Content-Type': 'application/json' });
                    if (resp.message === 'New line added') {
                        const newLines = lines.slice();
                        newLines[index] = rowData;
                        setLines(newLines);
                        clearError();
                    }
                } catch (e) {
                    console.log(e.message);
                    setLines(prev => (prev.slice(0, prev.length - 1)));
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
            const resp = await request(`http://localhost:5000/api/lines/${id}`, 'DELETE');
            if (resp.message === 'Line was deleted') {
                setLines(prev => (prev.slice(0, prev.length - 1)));
                clearError();
            }
        } else {
            setIsInputEnable(prev => ({
                ...prev,
                isEnable: false,
            }))
            setRowData({
                name: '',
                color: ''
            });
            setIsAddClicked(true);
            setLines(prev => (prev.slice(0, prev.length - 1)));
        }
    }

    const onInputChange = (value, name) => {
        setRowData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const onAddClickHandler = () => {
        setLines(prev => [...prev, {
            name: '',
            color: ''
        }])
        setIsInputEnable({
            isEnable: true,
            rowNumber: lines.length
        })
        setRowData({
            name: '',
            color: ''
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
                        <th width='150px'>Цвет</th>
                        <th width='150px'>Изменить</th>
                        <th width='150px'>Удалить</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        lines ?
                            lines.map((st, index) => {
                                if (isInputEnable.isEnable && isInputEnable.rowNumber === index) {
                                    return (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td className={classes.rowInput}><input name='name' type='text' value={rowData.name} onChange={(e) => onInputChange(e.target.value, e.target.name)} /></td>
                                            <td className={classes.rowInput}><input name='color' type='text' value={rowData.color} onChange={(e) => onInputChange(e.target.value, e.target.name)} /></td>
                                            <td>
                                                <Button
                                                    variant='secondary'
                                                    onClick={() => onChangeHandler(st.line_id, index)}
                                                >
                                                    Сохранить
                                                </Button>
                                            </td>
                                            <td>
                                                <Button
                                                    variant='secondary'
                                                    onClick={() => onDeleteHandler(st.line_id)}
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
                                        <td>{st.color}</td>
                                        <td>
                                                <Button
                                                    variant='secondary'
                                                    onClick={() => onChangeHandler(st.line_id, index)}
                                                >
                                                    Изменить
                                                </Button>
                                            </td>
                                            <td>
                                                <Button
                                                    variant='secondary'
                                                    onClick={() => onDeleteHandler(st.line_id)}
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

export default Lines;