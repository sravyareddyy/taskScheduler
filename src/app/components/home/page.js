
"use client";
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ProgressBar, OverlayTrigger, Tooltip } from 'react-bootstrap';
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

  const generateId = () => `${new Date().getTime()}-${Math.random()}`;

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    setTasks(storedTasks);

    const storedActiveId = JSON.parse(localStorage.getItem('activeTaskId'));
    const storedTimer = JSON.parse(localStorage.getItem('timer'));
    const storedProgress = JSON.parse(localStorage.getItem('progress'));

    if (storedActiveId) {
      setActiveTaskId(storedActiveId);
      setTimer(storedTimer);
      setProgress(storedProgress);
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
      const updatedTasks = [...tasks];
      updatedTasks[currentEditIndex] = { ...newTask, id: updatedTasks[currentEditIndex].id }; // keep same ID
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
    if (activeTaskId === tasks[index].id) 
    {
        alert("You can't edit the task once it's started");
    } 
    else 
    {
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
    if (activeTaskId && activeTaskId !== tasks[index].id) {
      alert("Complete the current task before starting another.");
      return;
    }
    const totalSeconds = tasks[index].estimatedTime * 60;
    setActiveTaskId(tasks[index].id);
    setTimer(totalSeconds);
    setProgress(0);
  };

  const handleComplete = () => {
    const updatedTasks = tasks.map(task =>
      task.id === activeTaskId ? { ...task, isCompleted: true } : task
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

  return (
    <div className='min-vh-100 p-2'>
      <div className='d-flex justify-content-center align-items-center'>
        <Button className='btn btn-dark mb-3' onClick={() => {
            setShowModal(true);
            setIsEditing(false);         
            setNewTask({                 
            title: '',
            description: '',
            date: '',
            estimatedTime: ''
            });
        }}>
          + Add task
        </Button>
      </div>

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
              <Form.Control type='date' name='date' value={newTask.date} onChange={handleChange} required  min={new Date().toISOString().split('T')[0]} />
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

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tasks">
          {(provided) => (
            <div
              className='d-flex flex-column align-items-center'
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className='card mb-3 p-3'
                      style={{ width: '40rem', position: 'relative', ...provided.draggableProps.style }}
                    >
                      <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                        <FaEdit style={{ cursor: 'pointer', marginRight: '10px' }} onClick={() => handleEdit(index)} />
                        <FaTrash style={{ cursor: 'pointer' }} onClick={() => handleDelete(index)} />
                      </div>

                      <h5>{task.title}</h5>
                      <p>{task.description}</p>
                      <p>Date: {task.date}</p>
                      <p>Estimated Time: {task.estimatedTime} minutes</p>

                      {activeTaskId === task.id && (
                        <>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>{progress}% Completed</Tooltip>}
                          >
                            <ProgressBar now={progress} label={`${progress}%`} className="w-100 mb-2" />
                          </OverlayTrigger>
                          <p style={{ color: 'blue' }}> ⏳ Time Left: {formatTime(timer)}</p>
                        </>
                      )}

                      {activeTaskId === task.id ? (
                        <Button variant='success' onClick={handleComplete}>Complete Task</Button>
                      ) : (
                        !task.isCompleted && <Button variant='primary' onClick={() => handleStart(index)}>Start</Button>
                      )}
                      {task.isCompleted && <p style={{ color: 'green' }}>Task Completed</p>}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default Home;
