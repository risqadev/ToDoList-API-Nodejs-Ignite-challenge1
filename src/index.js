const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const username = request.headers.username || request.body.username;

  const user = users.find(user => user.username === username);

  request.user = user;

  return next();
}

app.post('/users', checksExistsUserAccount, (request, response) => {
  const { name, username } = request.body;
  const { user } = request;

  if (!!user) {
    return response.status(400).json({ error: "Username already exists." })
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(newUser);

  return response.json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  if (!user) {
    return response.status(400).json({ error: "Username not found." })
  }

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  if (!user) {
    return response.status(400).json({ error: "Username not found." })
  }

  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  if (!user) {
    return response.status(400).json({ error: "Username not found." })
  }

  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo id not found." })
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  if (!user) {
    return response.status(400).json({ error: "Username not found." });
  }

  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo id not found." })
  }

  todo.done = true;

  return response.status(201).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  if (!user) {
    return response.status(400).json({ error: "Username not found." });
  }

  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo id not found." })
  }

  user.todos = user.todos.filter(item => item !== todo);

  return response.status(204).send();
});

module.exports = app;