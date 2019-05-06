const should = require('should');
const Joi = require('@hapi/joi');
const JoiTransfer = require('../../lib/joiTransfer');
const SwaggerTransfer = require('../../lib/swaggerTransfer');

const joiTransfer = new JoiTransfer();
const swaggerTransfer = new SwaggerTransfer();

describe('swaggerTransfer', () => {

  describe('decorate', () => {

    it('should return object when params provided#array', () => {
      const rule = Joi.array().items({
        title: Joi.string().max(10).required(),
        desc: Joi.string()
      }).required().description('tags');
      const schema = joiTransfer.transfer(rule.describe());
      swaggerTransfer.decorate(schema);
      schema.should.not.have.property('required');
      schema.items.should.have.property('required', ['title']);
    })

    it('should return object when params provided', () => {
      const rule = Joi.object({
        name: Joi.string().max(30).required().description('username'),
        pass: Joi.string().min(6).max(20).required().description('password'),
        age: Joi.number().integer().min(0).max(100).description('age'),
        tags: Joi.array().items(Joi.string().required()).description('tags'),
        avatar: Joi.object({
          minUrl: Joi.string().max(100).required(),
          midUrl: Joi.string().max(100).required(),
          maxUrl: Joi.string().max(100).required()
        }).required().description('avatar')
      });
      const schema = joiTransfer.transfer(rule.describe());
      swaggerTransfer.decorate(schema);
      schema.should.have.property('required', ['name', 'pass', 'avatar']);
    })

  });

  describe('queryTransfer', () => {

    it('should return object when params provided', () => {
      const rule = Joi.object({
        name: Joi.string().max(30).required().description('username'),
        pass: Joi.string().min(6).max(20).required().description('password'),
        age: Joi.number().integer().min(0).max(100).description('age'),
        tags: Joi.array().items(Joi.string().required()).description('tags'),
        avatar: Joi.object({
          minUrl: Joi.string().max(100).required(),
          midUrl: Joi.string().max(100).required(),
          maxUrl: Joi.string().max(100).required()
        }).required().description('avatar')
      });
      const schema = joiTransfer.transfer(rule.describe());
      const parameters = swaggerTransfer.queryTransfer(schema);
      parameters.should.have.property('length');
      parameters.forEach(item => {
        item.should.have.property('in', 'query');
        item.should.have.property('name');
        item.should.have.property('schema');
      })
    })

  });

  describe('paramsTransfer', () => {

    it('should return object when params provided', () => {
      const rule = Joi.object({
        name: Joi.string().max(30).required().description('username'),
        pass: Joi.string().min(6).max(20).required().description('password'),
        age: Joi.number().integer().min(0).max(100).description('age'),
        tags: Joi.array().items(Joi.string().required()).description('tags'),
        avatar: Joi.object({
          minUrl: Joi.string().max(100).required(),
          midUrl: Joi.string().max(100).required(),
          maxUrl: Joi.string().max(100).required()
        }).required().description('avatar')
      });
      const schema = joiTransfer.transfer(rule.describe());
      const parameters = swaggerTransfer.paramsTransfer(schema);
      parameters.should.have.property('length');
      parameters.forEach(item => {
        item.should.have.property('in', 'path');
        item.should.have.property('name');
        item.should.have.property('schema');
      })
    })

  });

  describe('bodyTransfer', () => {

    it('should return object when params provided', () => {
      const rule = Joi.object({
        name: Joi.string().max(30).required().description('username'),
        pass: Joi.string().min(6).max(20).required().description('password'),
        age: Joi.number().integer().min(0).max(100).description('age'),
        tags: Joi.array().items(Joi.string().required()).description('tags'),
        avatar: Joi.object({
          minUrl: Joi.string().max(100).required(),
          midUrl: Joi.string().max(100).required(),
          maxUrl: Joi.string().max(100).required()
        }).required().description('avatar')
      });
      const schema = joiTransfer.transfer(rule.describe());
      const parameters = swaggerTransfer.bodyTransfer(schema);
      const data = parameters.content["application/json"].schema;
      data.should.have.property('type', 'object');
      data.should.have.property('properties');
    })

  });

  describe('transfer', () => {

    it('should return object when params provided', () => {
      const validate = {
        params: {
          id: Joi.string().required()
        },
        query: {
          page: Joi.number().integer().min(1).default(1),
          size: Joi.number().integer().min(1).max(50).default(10),
        },
        body: {
          title: Joi.string().max(100).required(),
          content: Joi.string().max(500).required(),
          tags: Joi.array().items(Joi.string().max(10))
        }
      };
      const swagger = swaggerTransfer.transfer(validate);
      swagger.should.have.property('parameters');
      swagger.should.have.property('requestBody');
    })

  });

  describe('transResponse', () => {

    it('should return object when params provided', () => {
      const validate = {
        200: {
          headers: Joi.object({
            authorization: Joi.string().required()
          }).unknown(),
          body: {
            title: Joi.string().max(100).required(),
            content: Joi.string().max(500).required(),
            tags: Joi.array().items(Joi.string().max(10))
          }
        }
      };
      const swagger = swaggerTransfer.transResponse(validate);
      swagger.should.have.property('responses');
      swagger.responses.should.have.property('200');
    })

  });

});
