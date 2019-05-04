const should = require('should');
const Joi = require('@hapi/joi');
const JoiTransfer = require('../../lib/joiTransfer');

const joiTransfer = new JoiTransfer();

describe('joiTransfer', () => {

  describe('describe', () => {

    it('should return object when params provided', () => {

      // const describe = Joi.object({
      //   name: Joi.string().min(10).max(30).required().default('Jack').description('username'),
      //   pass: Joi.string().min(10).max(30).required().default('******').description('password'),
      //   tags: Joi.array().items(Joi.string().max(10)).required().default(['a', 'b']).description('tags')
      // }).describe();
      // console.log(describe.children);

      // const describe = Joi.object({
      //   limit: Joi.number().integer().required(),
      //   numbers: Joi.array().length(Joi.ref('limit')).required()
      // }).describe();
      // console.log(describe.children.numbers);

    })

  });

  describe('anyTransfer', () => {

    it('should return object when params provided', () => {
      const rule = Joi.any().valid(1, 2, 3).required().description('desc').default(1);
      const result = joiTransfer.transfer(rule.describe());
      result.should.have.property('type');
      result.should.have.property('required', true);
      result.should.have.property('description', 'desc');
      result.should.have.property('default', 1);
      result.should.have.property('enum', [1, 2, 3]);
    })

  });

  describe('numberTransfer', () => {

    it('should return object when params provided#integer', () => {
      const rule = Joi.number().integer();
      const result = joiTransfer.transfer(rule.describe());
      result.should.have.property('type', 'integer');
      result.should.have.property('format', 'int64');
    })

    it('should return object when params provided#double', () => {
      const rule = Joi.number();
      const result = joiTransfer.transfer(rule.describe());
      result.should.have.property('type', 'number');
      result.should.have.property('format', 'double');
    })

    it('should return object when params provided#min, max', () => {
      const rule = Joi.number().min(0).max(100);
      const result = joiTransfer.transfer(rule.describe());
      result.should.have.property('minimum', 0);
      result.should.have.property('maximum', 100);
    })

    it('should return object when params provided#less', () => {
      const rule = Joi.number().less(0);
      const result = joiTransfer.transfer(rule.describe());
      result.should.have.property('maximum', 0);
      result.should.have.property('exclusiveMaximum', true);
    })

    it('should return object when params provided#greater', () => {
      const rule = Joi.number().greater(0);
      const result = joiTransfer.transfer(rule.describe());
      result.should.have.property('minimum', 0);
      result.should.have.property('exclusiveMinimum', true);
    })

    it('should return object when params provided#positive', () => {
      const rule = Joi.number().positive();
      const result = joiTransfer.transfer(rule.describe());
      result.should.have.property('minimum', 0);
    })

    it('should return object when params provided#positive', () => {
      const rule = Joi.number().negative();
      const result = joiTransfer.transfer(rule.describe());
      result.should.have.property('maximum', 0);
      result.should.have.property('exclusiveMaximum', true);
    })

  });

  describe('stringTransfer', () => {

    it('should return object when params provided', () => {
      const rule = Joi.string().min(0).max(100);
      const result = joiTransfer.transfer(rule.describe());
      result.should.have.property('type', 'string');
      result.should.have.property('minLength', 0);
      result.should.have.property('maxLength', 100);
    })

    it('should return object when params provided#length', () => {
      const rule = Joi.string().length(10);
      const result = joiTransfer.transfer(rule.describe());
      result.should.have.property('minLength', 10);
      result.should.have.property('maxLength', 10);
    })

    it('should return object when params provided#base64', () => {
      const rule = Joi.string().base64();
      const result = joiTransfer.transfer(rule.describe());
      result.should.have.property('format', 'byte');
    })

  });

  describe('arrayTransfer', () => {

    it('should return object when params provided', () => {
      const rule = Joi.array().min(1).max(10);
      const result = joiTransfer.transfer(rule.describe());
      result.should.have.property('type', 'array');
      result.should.have.property('minItems', 1);
      result.should.have.property('maxItems', 10);
    })

    it('should return object when params provided#length', () => {
      const rule = Joi.array().length(5);
      const result = joiTransfer.transfer(rule.describe());
      result.should.have.property('type', 'array');
      result.should.have.property('minItems', 5);
      result.should.have.property('maxItems', 5);
    })

    it('should return object when params provided#items', () => {
      const rule = Joi.array().items(Joi.string());
      const result = joiTransfer.transfer(rule.describe());
      result.should.have.property('type', 'array');
      result.should.have.property('items');
    })

    it('should return object when params provided#multi items', () => {
      const rule = Joi.array().items(Joi.string(), Joi.number());
      const result = joiTransfer.transfer(rule.describe());
      result.should.have.property('type', 'array');
      result.should.have.property('items');
    })

  });

  describe('dateTransfer', () => {

    it('should return object when params provided', () => {
      const rule = Joi.date();
      const result = joiTransfer.transfer(rule.describe());
      result.should.have.property('type', 'string');
      result.should.have.property('format', 'date-time');
    })

  });

  describe('booleanTransfer', () => {

    it('should return object when params provided', () => {
      const rule = Joi.boolean();
      const result = joiTransfer.transfer(rule.describe());
      result.should.have.property('type', 'boolean');
    })

  });

  describe('binaryTransfer', () => {

    it('should return object when params provided', () => {
      const rule = Joi.binary().min(0).max(100);
      const result = joiTransfer.transfer(rule.describe());
      result.should.have.property('type', 'string');
      result.should.have.property('format', 'binary');
      result.should.have.property('minLength', 0);
      result.should.have.property('maxLength', 100);
    })

    it('should return object when params provided#length', () => {
      const rule = Joi.binary().length(10);
      const result = joiTransfer.transfer(rule.describe());
      result.should.have.property('minLength', 10);
      result.should.have.property('maxLength', 10);
    })

  });

  describe('objectTransfer', () => {

    it('should return object when params provided', () => {
      const rule = Joi.object({
        name: Joi.string().max(30).required(),
        pass: Joi.string().min(6).max(20).required(),
        age: Joi.number().integer().min(0).max(100),
        tags: Joi.array().items(Joi.string()),
        avatar: Joi.object({
          minUrl: Joi.string().max(100).required(),
          midUrl: Joi.string().max(100).required(),
          maxUrl: Joi.string().max(100).required()
        }).required()
      });
      const result = joiTransfer.transfer(rule.describe());
      result.should.have.property('type', 'object');
      result.should.have.property('properties');
    })

  });

  describe('testTransfer', () => {

    it('should return object when params provided', () => {
      const rule = Joi.alternatives().try(Joi.number(), Joi.string());
      const result = joiTransfer.transfer(rule.describe());
      result.should.have.property('type', 'string');
      result.should.have.property('oneOf');
    })

    it('should return object when params provided', () => {
      const rule = Joi.alternatives().when(Joi.object({b: 5}).unknown(), {
        then: Joi.object({
          a: Joi.string(),
          b: Joi.any()
        }),
        otherwise: Joi.object({
          a: Joi.number(),
          b: Joi.any()
        })
      }).try(Joi.number(), Joi.string());
      const result = joiTransfer.transfer(rule.describe());
      result.should.have.property('type', 'string');
      result.should.have.property('oneOf');
    })

  });

});
