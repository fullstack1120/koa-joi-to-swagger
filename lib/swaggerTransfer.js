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
    const swagger = {responses: {}};
    Object.keys(response).forEach(statusCode => {
      swagger.responses[statusCode] = {};
      if (response[statusCode].body) {
        const schema = this.responseBodyTransfer(joiTransfer.transfer(Joi.compile(response[statusCode].body).describe()));
        swagger.responses[statusCode].content = {'application/json': {schema}}
      }
      if (response[statusCode].headers) {
        const schema = this.responseHeadersTransfer(joiTransfer.transfer(Joi.compile(response[statusCode].headers).describe()));
        swagger.responses[statusCode].headers = schema;
      }
    });
    return swagger;
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
      return Object.assign({in: 'query', name: key}, {schema: schema.properties[key], required});
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

  responseBodyTransfer(schema) {
    this.decorate(schema);
    return schema;
  }

  responseHeadersTransfer(schema) {
    Object.keys(schema.properties).forEach(key => {
      const {required, description} = schema.properties[key];
      this.decorate(schema.properties[key]);
      schema.properties[key] = Object.assign({schema: schema.properties[key], required, description});
    });
    return schema.properties;
  }

  decorate(schema) {
    if (schema.type == 'array' && schema.items) {
      const items = schema.items.map(item => this.decorate(item));
      schema.items = items.length == 1 ? items[0] : items;
    }
    if (schema.type == 'object') {
      schema.required = [];
      Object.keys(schema.properties).forEach(key => {
        if (schema.properties[key].required) schema.required.push(key);
        this.decorate(schema.properties[key]);
      });
    }
    if (schema.type != 'object') delete schema.required;
    if (Array.isArray(schema.type)) schema.type = 'string';
    return schema;
  }
}
