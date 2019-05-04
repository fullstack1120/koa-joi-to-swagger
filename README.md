# Koa-joi-to-swagger
Koa validator and auto docs base on koa-router, joi and swagger

## Features:
- built in input validation using [joi][]
- built in auto docs using [swagger-ui][]
- built on the great [koa-router][]

## Installation
Install using npm:
````
npm install --save koa-joi-to-swagger
````

## Example
See [example][]

## Usage
Koa-joi-to-swagger returns a constructor which you use to define your routes.
````
const Koa = require('koa');
const KoaBody = require('koa-body');
const Joi = require('@hapi/joi');
const Router = require('koa-joi-to-swagger');

const app = new Koa();
const router = new Router(app, {docs: {prefix: '/docs'}});

app.use(KoaBody());
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(3000);

router.register({
  method: 'get',
  path: '/users',
  config: {
    summary: 'query users',
    response: {
      schema: Joi.array().items(Joi.object({name: Joi.string()}))
    },
    config: {
      validate: {
        query: {
          page: Joi.number().integer().min(1).default(1),
          size: Joi.number().integer().min(1).max(50).default(10)
        }
      },
      handler: async ctx => {
        ctx.body = [{name: 'Jack'}];
      }
    }
  }
});

````
API documentation url: http://localhost:3000/docs/

## API Reference

### Instance
Create router instance
````
new Router(app, [options])
````

### Methods

#### .register(params)
Register a route

## Test
````
npm run test
````

[joi]: https://github.com/hapijs/joi
[swagger-ui]: https://github.com/swagger-api/swagger-ui
[koa-router]: https://github.com/ZijianHe/koa-router
[example]: ./example
