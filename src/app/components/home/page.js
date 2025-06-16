"use client";
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ProgressBar, OverlayTrigger, Tooltip, Card, Container, Row, Col } from 'react-bootstrap';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

function Home() {
    const [showModal, setShowModal] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        date: '',
        estimatedTime: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [currentEditIndex, setCurrentEditIndex] = useState(null);
    const [activeTaskId, setActiveTaskId] = useState(null);
    const [timer, setTimer] = useState(0);
    const [progress, setProgress] = useState(0);
    const [darkMode, setDarkMode] = useState(false);
    const [showCompletedModal, setShowCompletedModal] = useState(false);

    const generateId = () => `${new Date().getTime()}-${Math.random()}`;
    const todaysDate = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        setTasks(storedTasks);
        const storedActiveId = JSON.parse(localStorage.getItem('activeTaskId'));
        const storedTimer = JSON.parse(localStorage.getItem('timer'));
        const storedProgress = JSON.parse(localStorage.getItem('progress'));
        const storedDarkMode = JSON.parse(localStorage.getItem('darkMode'));
        if (storedActiveId) {
            setActiveTaskId(storedActiveId);
            setTimer(storedTimer);
            setProgress(storedProgress);
        }
        if (storedDarkMode !== null) {
            setDarkMode(storedDarkMode);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }, [tasks]);

    useEffect(() => {
        localStorage.setItem('activeTaskId', JSON.stringify(activeTaskId));
        localStorage.setItem('timer', JSON.stringify(timer));
        localStorage.setItem('progress', JSON.stringify(progress));
    }, [activeTaskId, timer, progress]);

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);

    useEffect(() => {
        let interval = null;
        if (activeTaskId) {
            interval = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 0) {
                        clearInterval(interval);
                        setActiveTaskId(null);
                        setProgress(0);
                        return 0;
                    }
                    const activeTask = tasks.find(task => task.id === activeTaskId);
                    if (!activeTask) {
                        clearInterval(interval);
                        return 0;
                    }
                    const totalSeconds = activeTask.estimatedTime * 60;
                    const newProgress = Math.floor(100 - ((prev - 1) / totalSeconds) * 100);
                    setProgress(newProgress);
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [activeTaskId, tasks]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewTask(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            if (newTask.date < todaysDate) {
                alert("Enter Valid Date");
                return;
            }
            const updatedTasks = [...tasks];
            updatedTasks[currentEditIndex] = { ...newTask, id: updatedTasks[currentEditIndex].id };
            setTasks(updatedTasks);
            setIsEditing(false);
            setCurrentEditIndex(null);
        } else {
            setTasks(prev => [...prev, { ...newTask, isCompleted: false, id: generateId() }]);
        }
        setShowModal(false);
        setNewTask({ title: '', description: '', date: '', estimatedTime: '' });
    };

    const handleEdit = (index) => {
        if (activeTaskId === tasks[index].id) {
            alert("You can't edit the task once it's started");
        } else if (tasks[index].isCompleted) {
            alert("You can't edit a completed task.");
        } else {
            setNewTask(tasks[index]);
            setIsEditing(true);
            setCurrentEditIndex(index);
            setShowModal(true);
        }
    };

    const handleDelete = (index) => {
        if (window.confirm("Do you want to delete this task?")) {
            const deletedTaskId = tasks[index].id;
            const updatedTasks = tasks.filter((_, i) => i !== index);
            setTasks(updatedTasks);
            if (deletedTaskId === activeTaskId) {
                setActiveTaskId(null);
                setTimer(0);
                setProgress(0);
            }
        }
    };

    const handleStart = (index) => {
        const taskDate = new Date(tasks[index].date);
        const today = new Date(todaysDate);
        if (taskDate.toDateString() !== today.toDateString()) {
            alert("You can only start today's tasks!");
            return;
        } else if (activeTaskId && activeTaskId !== tasks[index].id) {
            alert("Complete the current task before starting another.");
            return;
        }
        const totalSeconds = tasks[index].estimatedTime * 60;
        setActiveTaskId(tasks[index].id);
        setTimer(totalSeconds);
        setProgress(0);
    };

    const handleComplete = () => {
        const activeTask = tasks.find(task => task.id === activeTaskId);
        const totalSeconds = activeTask.estimatedTime * 60;
        const timeTakenSeconds = totalSeconds - timer;
        const timeTakenMinutes = Math.ceil(timeTakenSeconds / 60);
        const updatedTasks = tasks.map(task =>
            task.id === activeTaskId
                ? { ...task, isCompleted: true, actualTimeTaken: timeTakenMinutes }
                : task
        );
        setTasks(updatedTasks);
        setActiveTaskId(null);
        setTimer(0);
        setProgress(0);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        const reorderedTasks = Array.from(tasks);
        const [removed] = reorderedTasks.splice(result.source.index, 1);
        reorderedTasks.splice(result.destination.index, 0, removed);
        setTasks(reorderedTasks);
    };

    const renderCompletedTasksModal = () => (
        <Modal show={showCompletedModal} onHide={() => setShowCompletedModal(false)} centered>
            <Modal.Header closeButton>
                <Modal.Title>Completed Tasks</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {tasks.filter(task => task.isCompleted).length === 0 ? (
                    <p>No completed tasks yet.</p>
                ) : (
                    tasks.filter(task => task.isCompleted).map(task => (
                        <Card key={task.id} className="mb-2 shadow-sm">
                            <Card.Body>
                                <Card.Title>{task.title}</Card.Title>
                                <Card.Text>{task.description}</Card.Text>
                                <Card.Text className="text-success">
                                    Completed in {task.actualTimeTaken || "N/A"} minutes.
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    ))
                )}
            </Modal.Body>
        </Modal>
    );

    return (
        <Container fluid className={`min-vh-100 p-3 ${darkMode ? 'bg-dark text-white' : 'bg-light text-dark'}`}>
            <Row className="justify-content-between align-items-center mb-3">
                <Col xs="6" sm="4" md="3">
                   <Button
                      className='w-100 mb-2'
                      style={{
                          backgroundColor: darkMode ? 'white' : 'black',
                          color: darkMode ? 'black' : 'white',
                          border: 'none'
                      }}
                      onClick={() => {
                          setShowModal(true);
                          setIsEditing(false);
                          setNewTask({ title: '', description: '', date: '', estimatedTime: '' });
                      }} >
                      + Add Task
                  </Button>

                </Col>
                <Col xs="6" sm="4" md="3">
                    <Form.Check
                        type="switch"
                        id="dark-mode-switch"
                        label={darkMode ? "Dark Mode" : "Light Mode"}
                        checked={darkMode}
                        onChange={() => setDarkMode(!darkMode)}
                    />
                </Col>
                <Col xs="12" sm="4" md="3">
                    <Button className='w-100 mt-2 mt-sm-0' variant='info' onClick={() => setShowCompletedModal(true)}>
                        View Completed
                    </Button>
                </Col>
            </Row>

            {renderCompletedTasksModal()}

            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="tasks">
                    {(provided) => (
                        <div
                            className='d-flex flex-column justify-content-center align-items-center'
                            {...provided.droppableProps}
                            ref={provided.innerRef}>
                            {tasks.map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                    {(provided) => (
                                        <Card
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={`m-2 p-3 shadow-sm ${darkMode ? 'bg-secondary text-white' : ''}`}
                                            style={{  width: '100%', maxWidth: '500px', ...provided.draggableProps.style }}
                                        >
                                            <div className="d-flex justify-content-end">
                                                <FaEdit style={{ cursor: 'pointer', marginRight: '10px' }} onClick={() => handleEdit(index)} />
                                                <FaTrash style={{ cursor: 'pointer' }} onClick={() => handleDelete(index)} />
                                            </div>

                                            <Card.Body>
                                                <Card.Title>{task.title}</Card.Title>
                                                <Card.Text>{task.description}</Card.Text>
                                                <Card.Text>Date: {task.date}</Card.Text>
                                                <Card.Text>Est. Time: {task.estimatedTime} mins</Card.Text>

                                                {activeTaskId === task.id && (
                                                    <>
                                                        <OverlayTrigger
                                                            placement="top"
                                                            overlay={<Tooltip>{progress}% Completed</Tooltip>}
                                                        >
                                                            <ProgressBar now={progress} label={`${progress}%`} className="w-100 mb-2" />
                                                        </OverlayTrigger>
                                                        <p style={{ color: 'lightblue' }}>⏳ Time Left: {formatTime(timer)}</p>
                                                    </>
                                                )}

                                                {activeTaskId === task.id ? (
                                                    <Button variant='success' className='w-100' onClick={handleComplete}>Complete</Button>
                                                ) : (
                                                    !task.isCompleted && <Button variant='primary' className='w-100' onClick={() => handleStart(index)}>Start</Button>
                                                )}
                                                {task.isCompleted && <p  style={{color:'blue'}}>Task Completed</p>}
                                            </Card.Body>
                                        </Card>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {/* Modal for Add/Edit */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? "Edit Task" : "Add Task"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className='mb-3'>
                            <Form.Label>Title</Form.Label>
                            <Form.Control type='text' name='title' value={newTask.title} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group className='mb-3'>
                            <Form.Label>Description</Form.Label>
                            <Form.Control type='text' name='description' value={newTask.description} onChange={handleChange} required />
                        </Form.Group>
                        <Form.Group className='mb-3'>
                            <Form.Label>Date</Form.Label>
                            <Form.Control type='date' name='date' value={newTask.date} onChange={handleChange} required min={todaysDate} />
                        </Form.Group>
                        <Form.Group className='mb-3'>
                            <Form.Label>Estimated Time (minutes)</Form.Label>
                            <Form.Control type='number' name='estimatedTime' value={newTask.estimatedTime} onChange={handleChange} min="1" required />
                        </Form.Group>
                        <Button variant='primary' type='submit' className='w-100'>
                            {isEditing ? "Update Task" : "Add Task"}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
}

export default Home;
