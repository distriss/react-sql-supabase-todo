import React, { useState, useEffect, } from 'react';
import { supabase } from './supabaseClient';
import Button from 'react-bootstrap/Button';
import { ListGroup, ListGroupItem } from 'react-bootstrap';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [editId, setEditId] = useState(null)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async() => {
    // sql - select * from todos order by id asc
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('id', {ascending: true})

    if (error) {
      console.error('Error fetching todos: ', error)
    } else {
      setTodos(data);
    }
  }

  const addTask = async() => {
    // sql - insert into todos (task, is_completed) values (newTask, false)
    const {data, error} = await supabase
      .from('todos')
      .insert([{task: newTask, is_completed: false}])
      .select()

    if (error) {
      console.error('Error adding todos: ', error)
    } else if (Array.isArray(data)) {
      setTodos(prev => [...prev, ...data]);
      setNewTask('')
    }
  }

  const updateTasks = async(id) => {
    // sql - update todos set task = editText where id = id
    const { error } = await supabase
      .from('todos')
      .update({task: editText})
      .eq('id', id)

    if (error) {
      console.error('Error updating todo: ', error)
    } else {
      fetchTodos()
      setEditId(null)
      setEditText('')
      console.log(`Edited task id: ${id}`)
    }
  }

  const toggleCompleted = async(id, is_completed) => {
    // sql - update todos set is_completed = !is_completed where id = id
    const { error } = await supabase
      .from('todos')
      .update({is_completed: !is_completed})
      .eq('id', id)

    if (error) {
      console.error('Error updating completed status: ', error)
    } else {
      fetchTodos()
      setEditId(null)
      setEditText('')
      console.log(`Toggle Completed on task id: ${id}`)
    }
  }

  const deleteTask = async(id) => {
    // sql - delete from todos where id = id
    const {error} = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting todo: ', error)
    } else {
      fetchTodos()
      console.log(`Deleted task id: ${id}`)
    }
  }

  return (
    <section className="App container-sm d-flex flex-column align-items-center">
      <h1 className="my-5">React SQL Todo app</h1>
      <div className="container-fluid d-flex flex-row justify-content-center">
        <input 
          type="text"
          placeholder="New Task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <Button
          type="button"
          onClick={addTask}
          className="btn btn-info btn-lg mx-3 rounded"
        >
          Add
        </Button>
      </div>
      <ListGroup className="list-group list-group-flush mt-5 col-lg-6">
        {todos.map(task => (
            <ListGroupItem  
              key={task.id}            
              className="list-group-item"
            >
              {editId === task.id ? (
                <div className="container d-flex flex-row justify-content-center align-items-center">
                  <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={() => updateTasks(task.id)} 
                  className="px-4"
                />
                </div>
                
              ) : (
                <div className="container d-flex flex-row justify-content-between align-items-center">
                  <div className="mx-3">
                    
                    <span
                      onDoubleClick={() => {
                        setEditId(task.id);
                        setEditText(task.task);
                      }}  
                      className={task.is_completed ? `completed text-wrap` : 'text-wrap'}
                    >
                      {task.task}
                    </span>                    
                  </div>
                  <div className="d-flex flex-row m-1 m-sm-0 align-self-center">
                    <Button 
                      onClick={() => toggleCompleted(task.id, task.is_completed)}
                      className="btn btn-success btn-sm mx-1 rounded"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                      </svg>
                    </Button>
                    <Button 
                      onClick={() => deleteTask(task.id)}
                      className="btn btn-danger btn-sm mx-1 rounded"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path d="M17.678 6.322a1 1 0 0 0-1.414 0L12 10.586 7.736 6.322a1 1 0 1 0-1.414 1.414L10.586 12l-4.25 4.262a1 1 0 0 0 1.415 1.413L12 13.414l4.262 4.25a1 1 0 0 0 1.413-1.415L13.414 12l4.264-4.262a1 1 0 0 0 0-1.415z"/>
                      </svg>
                    </Button>
                  </div>
                </div>              
              )}
            </ListGroupItem>
        ))}        
      </ListGroup>
    </section>
  );
}

export default App;
