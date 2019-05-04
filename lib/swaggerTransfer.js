const Joi = require('@hapi/joi');
const JoiTransfer = require('./joiTransfer');

const joiTransfer = new JoiTransfer();

module.exports = class SwaggerTransfer {

  transfer(options) {
    const swagger = {
      parameters: []
    };
    if (options.headers) swagger.parameters.push(...this.headersTransfer(joiTransfer.transfer(Joi.compile(options.headers).describe())));
    if (options.params) swagger.parameters.push(...this.paramsTransfer(joiTransfer.transfer(Joi.compile(options.params).describe())));
    if (options.query) swagger.parameters.push(...this.queryTransfer(joiTransfer.transfer(Joi.compile(options.query).describe())));
    if (options.body) swagger.requestBody = this.bodyTransfer(joiTransfer.transfer(Joi.compile(options.body).describe()));
    return swagger;
  }

  transResponse(response) {
    return this.responseTransfer(joiTransfer.transfer(Joi.object(response).describe()));
  }

  headersTransfer(schema) {
    return Object.keys(schema.properties).map(key => {
      const {required} = schema.properties[key];
      this.decorate(schema.properties[key]);
      return Object.assign({in: 'header', name: key}, {schema: schema.properties[key]}, required ? {required} : {});
    });
  }

  paramsTransfer(schema) {
    return Object.keys(schema.properties).map(key => {
      const {required} = schema.properties[key];
      this.decorate(schema.properties[key]);
      return Object.assign({in: 'path', name: key}, {schema: schema.properties[key]}, required ? {required} : {});
    });
  }

  queryTransfer(schema) {
    return Object.keys(schema.properties).map(key => {
      const {required} = schema.properties[key];
      this.decorate(schema.properties[key]);
      return Object.assign({in: 'query', name: key}, {schema: schema.properties[key]}, required ? {required} : {});
    });
  }

  bodyTransfer(schema) {
    this.decorate(schema);
    return {
      required: true,
      content: {
        'application/json': {schema}
      }
    };
  }

  responseTransfer(schema) {
    this.decorate(schema);
    return {
      responses: {
        200: {
          description: '200 response',
          content: {
            'application/json': {schema}
          }
        }
      }
    };
  }

  decorate(schema) {
    if (schema.type == 'array') schema.items = schema.items.map(item => this.decorate(item));
    if (schema.type == 'object') {
      schema.required = [];
      Object.keys(schema.properties).forEach(key => {
        if (schema.properties[key].required) schema.required.push(key);
        this.decorate(schema.properties[key]);
      });
    }
    if (schema.type != 'object') delete schema.required;
    return schema;
  }
}
