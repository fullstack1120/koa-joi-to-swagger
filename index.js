const Joi = require('@hapi/joi');
const Router = require('koa-router');
const Static = require('koa-static');
const Mount = require('koa-mount');
const SwaggerUI = require('swagger-ui-dist');
const fs = require('fs');
const SwaggerTransfer = require('./lib/swaggerTransfer');

const swaggerTransfer = new SwaggerTransfer();

const defaultConfig = {
  router: {
    prefix: ''
  },
  swagger: {
    info: {
      title: 'API documentation',
      description: 'API documentation',
      version: '1.0.0'
    }
  },
  docs: {
    prefix: '/docs',
    groupIndex: 0
  }
};

module.exports = class RouteRegister {

  constructor(app, {router, swagger, docs} = {}) {
    this.app = app;
    this.config = {
      router: router ? {...router} : {...defaultConfig.router},
      swagger: swagger ? {...swagger} : {...defaultConfig.swagger},
      docs: docs ? {...docs} : {...defaultConfig.docs}
    };
    this.config.swagger.openapi = '3.0.0';
    this.config.swagger.paths = {};
    this.router = new Router(this.config.router);
    this.wrap();
    this.autoDocs = swagger || docs ? true : false;
    if (this.autoDocs) this.staticDocs();
  }

  register(options) {
    const {method, path, config: {validate = {}, handler}} = options;
    this.router[method.toLowerCase()](path, this.validate(validate), ...(Array.isArray(handler) ? handler : [handler]));
    if (this.autoDocs) this.addDocs(options);
  }

  validate(config = {}) {
    return (ctx, next) => {

      if (config.headers) {
        const {error} = Joi.validate(ctx.headers, config.headers);
        if (error) ctx.throw(400, error);
      }

      if (config.params) {
        const {error, value} = Joi.validate(ctx.params, config.params);
        if (error) ctx.throw(400, error);
        ctx.params = value;
      }

      if (config.query) {
        const {error, value} = Joi.validate(ctx.query, config.query);
        if (error) ctx.throw(400, error);
        ctx.query = value;
      }

      if (config.body) {
        const {error, value} = Joi.validate(ctx.request.body, config.body);
        if (error) ctx.throw(400, error);
        ctx.request.body = value;
      }

      next();
    }
  }

  staticDocs() {
    if (!this.app.context.swagger) this.app.context.swagger = {};
    if (!this.app.context.swagger[this.config.docs.prefix]) this.app.context.swagger[this.config.docs.prefix] = this.config.swagger;
    this.swagger = this.app.context.swagger[this.config.docs.prefix];
    const pathToSwaggerUI = SwaggerUI.absolutePath();
    const router = new Router();
    const indexHtml = fs.readFileSync(`${pathToSwaggerUI}/index.html`).toString().replace(/url:.*,/, 'url: "./swagger.json",');
    router.get(`${this.config.docs.prefix}`, ctx => ctx.body = indexHtml);
    router.get(`${this.config.docs.prefix}/index.html`, ctx => ctx.body = indexHtml);
    router.get(`${this.config.docs.prefix}/swagger.json`, ctx => ctx.body = this.swagger);
    this.app.use(router.routes());
    this.app.use(router.allowedMethods());
    this.app.use(Mount(this.config.docs.prefix, Static(pathToSwaggerUI)));
  }

  addDocs(options) {
    const {method, path, config: {summary, description, response = {schema: {}}, validate = {}}} = options;
    const fullPath = `${this.config.router.prefix}${path}`;
    if (!this.swagger.paths[fullPath]) this.swagger.paths[fullPath] = {};
    const tags = [fullPath.split('/')[this.config.docs.groupIndex + 1]];
    const doc = {tags, summary, description};
    this.swagger.paths[fullPath][method.toLowerCase()] = Object.assign(doc, swaggerTransfer.transfer(validate), swaggerTransfer.transResponse(response.schema));
  }

  use(...params) {
    return this.router.use(...params)
  }

  routes() {
    return this.router.routes()
  }

  allowedMethods(...params) {
    return this.router.allowedMethods(...params)
  }

  wrap() {
    this.router.methods.forEach(method => {
      this[method.toLowerCase()] = (path, config, ...params) => {
        const data = typeof config == 'object' ? config : {};
        const handler = typeof config == 'object' ? params : [config, ...params];
        data.handler = handler;
        return this.register({method, path, config: data});
      }
    });
  }

};
