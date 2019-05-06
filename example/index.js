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
      200: {
        body: Joi.array().items(Joi.object({name: Joi.string()}))
      }
    },
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
});
