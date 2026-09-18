import express from 'express';
import { validate } from 'isvalid';
import { errors } from 'express-simple-errors';
import transformResponse, { schema } from './model'; // eslint-disable-line no-unused-variables
import db from '../db';
const todoTable = 'todos';

export default function ()  {
  const router = express.Router();

  router.route('/')
    .get(getAllTodos, returnResponse)
    .post(validate.body(schema), createTodo, returnResponse)
    .delete(clearTodos, returnResponse);

  router.route('/:id')
    .all(getOneTodo)
    .get(returnResponse)
    .patch(patchTodo, returnResponse)
    .delete(deleteTodo, returnResponse);

  async function getAllTodos(req, res, next) {
    try {
      res.locals.todos = await db.all(todoTable);
      next();
    } catch (err) {
      next(err);
    }
  }

  async function clearTodos(req, res, next) {
    try {
      res.locals.todos = await db.clear(todoTable);
      res.status(204);
      next();
    } catch (err) {
      next(err);
    }
  }

  async function createTodo(req, res, next) {
    if (req.body.order) {
      req.body.position = req.body.order;
      delete req.body.order;
    }
    try {
      const todo = await db.create(todoTable, req.body);
      res.locals.todo = todo[0];
      res.status(201);
      next();
    } catch (err) {
      next(err);
    }
  }

  async function getOneTodo(req, res, next) {
    try {
      const todo = await db.getById('todos', req.params.id);
      res.locals.todo = todo && todo[0];
      if (!res.locals.todo) {
        return next(new errors.NotFound('This todo does not exist'));
      }
      next();
    } catch (err) {
      next(err);
    }
  }

  async function patchTodo(req, res, next) {
    const todo = Object.assign({}, res.locals.todo, req.body);
    if (todo.order) {
      todo.position = todo.order;
      delete todo.order;
    }

    try {
      const updatedTodo = await db.update(todoTable, req.params.id, todo);
      res.locals.todo = updatedTodo[0];
      next();
    } catch (err) {
      next(err);
    }
  }

  async function deleteTodo(req, res, next) {
    try {
      res.locals.todo = await db.deleteById(todoTable, req.params.id);
      res.status(204);
      next();
    } catch (err) {
      next(err);
    }
  }

  function returnResponse(req, res) {
    // handle no responses here
    res.locals.baseUrl = `${req.protocol}://${req.get('host')}`;
    res.json(transformResponse(res.locals));
  }

  return router;
}
