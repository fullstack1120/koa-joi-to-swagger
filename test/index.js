const should = require('should');
const Joi = require('@hapi/joi');
const Koa = require('koa');
const KoaBody = require('koa-body');
const request = require('request-promise');
const Router = require('../index');

describe('Router', () => {

  const app = new Koa();
  const router = new Router(app, {docs: {prefix: '/docs'}});
  const routerArticle = new Router(app, {docs: {prefix: '/docs/article'}});
  app.use(KoaBody());
  app.use(router.routes());
  app.use(router.allowedMethods());
  app.use(routerArticle.routes());
  app.use(routerArticle.allowedMethods());
  const server = app.listen(3000);

  before(() => {
    app.use(KoaBody());
  });

  after(() => {
    setTimeout(() => server.close(), 10);
  })

  describe('constructor', () => {

    it('should return object when params provided', () => {

      const router = new Router(app);
      router.should.have.property('autoDocs', false);
      router.should.have.property('router');
      router.router.methods.forEach(item => {
        router.should.have.property(item.toLowerCase());
      });
    })

    it('should return object when params provided#config', () => {

      const router = new Router(app, {
        router: {prefix: ''},
        swagger: {
          info: {
            title: 'API documentation',
            description: 'API documentation',
            version: '1.0.0'
          }
        },
        docs: {prefix: '/docs'}
      });
      router.should.have.property('autoDocs', true);
    })

  });

  describe('use', () => {

    it('should return object when params provided', () => {

      const router = new Router(app);
      router.use('/', (ctx, next) => next());
    })

  });

  describe('register', () => {

    before(() => {

      router.register({
        path: '/users',
        method: 'get',
        config: {
          summary: 'query users',
          response: {
            schema: {
              count: Joi.number().integer(),
              rows: Joi.array().items(Joi.object({
                id: Joi.number().integer().description('user id'),
                name: Joi.string().description('username')
              }))
            }
          },
          config: {
            validate: {
              query: {
                page: Joi.number().integer().min(1).default(1),
                size: Joi.number().integer().min(1).max(50).default(10)
              }
            },
            handler: async ctx => {
              const {page, size} = ctx.query;
              const users = [];
              for (let i = 0; i < size; i++) {
                users.push({id: (page - 1) * size + i, name: `robot${i}`})
              }
              ctx.body = {count: 100, rows: users};
            }
          }
        }
      });

      router.register({
        path: '/users/:id',
        method: 'get',
        config: {
          summary: 'query user by id',
          response: {
            schema: {
              id: Joi.number().integer().description('user id'),
              name: Joi.string().description('username')
            }
          },
          config: {
            validate: {
              params: {
                id: Joi.number().integer().required().description('user id')
              }
            },
            handler: async ctx => {
              const {id} = ctx.params;
              ctx.body = {id, name: `robot${id}`};
            }
          }
        }
      });

      router.register({
        path: '/users',
        method: 'post',
        config: {
          summary: 'create user',
          response: {
            schema: {
              id: Joi.number().integer().description('user id'),
              name: Joi.string().description('username')
            }
          },
          config: {
            validate: {
              headers: Joi.object({
                authorization: Joi.string().required()
              }).unknown(),
              body: {
                name: Joi.string().min(2).max(30).required().description('username')
              }
            },
            handler: async ctx => {
              const {name} = ctx.request.body;
              ctx.body = {id: 101, name};
            }
          }
        }
      });

      return;

    });

    it('should return object when params provided#get /users', async () => {

      request({
        url: 'http://localhost:3000/users',
        method: 'get',
        json: true
      }).then(data => {
        data.should.have.property('count');
        data.should.have.property('rows');
      })

    })

    it('should return error when params wrong#get /users', async () => {

      request({
        url: 'http://localhost:3000/users',
        method: 'get',
        qs: {size: 100},
        json: true
      }).catch(err => {
        err.should.have.property('statusCode', 400);
      })

    })

    it('should return object when params provided#get /users/:id', async () => {

      request({
        url: 'http://localhost:3000/users/100',
        method: 'get',
        json: true
      }).then(data => {
        data.should.have.property('id');
        data.should.have.property('name');
      })

    })

    it('should return error when params wrong#get /users/:id', async () => {

      request({
        url: 'http://localhost:3000/users/***',
        method: 'get',
        json: true
      }).catch(err => {
        err.should.have.property('statusCode', 400);
      })

    })

    it('should return object when params provided#post /users', async () => {

      request({
        url: 'http://localhost:3000/users',
        method: 'post',
        headers: {
          authorization: 'authorization'
        },
        body: {
          name: '***'
        },
        json: true
      }).then(data => {
        data.should.have.property('id');
        data.should.have.property('name');
      })

    })

    it('should return error when params wrong#post /users', async () => {

      request({
        url: 'http://localhost:3000/users',
        method: 'post',
        body: {
          name: '***'
        },
        json: true
      }).catch(err => {
        err.should.have.property('statusCode', 400);
      })

    })

    it('should return error when params wrong#post /users', async () => {

      request({
        url: 'http://localhost:3000/users',
        method: 'post',
        headers: {
          authorization: 'authorization'
        },
        body: {
          name: '*'
        },
        json: true
      }).catch(err => {
        err.should.have.property('statusCode', 400);
      })

    })

  });

  describe('get', () => {

    before(() => {

      routerArticle.get('/articles', {
        summary: 'query articles',
        response: {
          schema: {
            count: Joi.number().integer(),
            rows: Joi.array().items(Joi.object({
              id: Joi.number().integer().description('id'),
              title: Joi.string().description('title')
            }))
          }
        },
        config: {
          validate: {
            query: {
              page: Joi.number().integer().min(1).default(1),
              size: Joi.number().integer().min(1).max(50).default(10)
            }
          }
        }
      }, ctx => {
        const {page, size} = ctx.query;
        const articles = [];
        for (let i = 0; i < size; i++) {
          articles.push({id: (page - 1) * size + i, title: `title${i}`})
        }
        ctx.body = {count: 100, rows: articles};
      });

      routerArticle.get('/articles/:id', ctx => {
        const {id} = ctx.params;
        ctx.body = {id, title: `title${id}`};
      });

      return;

    });

    it('should return object when params provided#get /articles', async () => {

      request({
        url: 'http://localhost:3000/articles',
        method: 'get',
        json: true
      }).then(data => {
        data.should.have.property('count');
        data.should.have.property('rows');
      })

    })

    it('should return object when params provided#get /articles/:id', async () => {

      request({
        url: 'http://localhost:3000/articles/100',
        method: 'get',
        json: true
      }).then(data => {
        data.should.have.property('id');
        data.should.have.property('title');
      })

    })

  });

});
