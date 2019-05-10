module.exports = class JoiTransfer {

  transfer(describe, schema = {}) {
    const {type} = describe;
    this.anyTransfer(describe, schema);
    if (type == 'number') this.numberTransfer(describe, schema);
    if (type == 'string') this.stringTransfer(describe, schema);
    if (type == 'array') this.arrayTransfer(describe, schema);
    if (type == 'date') this.dateTransfer(describe, schema);
    if (type == 'boolean') this.booleanTransfer(describe, schema);
    if (type == 'binary') this.binaryTransfer(describe, schema);
    if (type == 'object') this.objectTransfer(describe, schema);
    if (type == 'alternatives') this.alternativesTransfer(describe, schema);
    return schema;
  }

  anyTransfer(describe, schema) {
    const {flags, valids, description} = describe;
    schema.type = ['integer', 'number', 'string', 'array', 'boolean', 'object', 'null'];
    if (flags && flags.presence == 'required') schema.required = true;
    if (description != null) schema.description = description;
    if (flags && flags.default != null) schema.default = flags.default;
    if (valids && valids.length) schema.enum = valids;
    return schema;
  }

  objectTransfer(describe, schema) {
    schema.type = 'object';
    schema.properties = {};
    if (describe.children) Object.keys(describe.children).forEach(key => {
      schema.properties[key] = {};
      this.transfer(describe.children[key], schema.properties[key]);
    });
    return schema;
  }

  numberTransfer(describe, schema) {
    const {rules} = describe;
    schema.type = 'number';
    schema.format = 'double';
    if (rules) rules.forEach(({name, arg}) => {
      switch (name) {
        case 'integer':
          schema.type = 'integer';
          schema.format = 'int64';
          break;
        case 'less':
          schema.exclusiveMaximum = true;
          schema.maximum = arg;
          break;
        case 'greater':
          schema.exclusiveMinimum = true;
          schema.minimum = arg;
          break;
        case 'min':
          schema.minimum = arg;
          break;
        case 'max':
          schema.maximum = arg;
          break;
        case 'positive':
          schema.minimum = 0;
          break;
        case 'negative':
          schema.exclusiveMaximum = true;
          schema.maximum = 0;
          break;
      }
    });
    return schema;
  }

  stringTransfer(describe, schema) {
    const {rules} = describe;
    schema.type = 'string';
    if (rules) rules.forEach(({name, arg}) => {
      switch (name) {
        case 'min':
          schema.minLength = arg;
          break;
        case 'max':
          schema.maxLength = arg;
          break;
        case 'length':
          schema.minLength = arg;
          schema.maxLength = arg;
          break;
        case 'base64':
          schema.format = 'byte';
          break;
        case 'regex':
          schema.pattern = arg.pattern;
          break;
      }
    });
    return schema;
  }

  arrayTransfer(describe, schema) {
    const {rules, items} = describe;
    schema.type = 'array';
    if (rules) rules.forEach(({name, arg}) => {
      switch (name) {
        case 'min':
          schema.minItems = arg;
          break;
        case 'max':
          schema.maxItems = arg;
          break;
        case 'length':
          if (/^ref/.test(arg)) break;
          schema.minItems = arg;
          schema.maxItems = arg;
          break;
        case 'unique':
          schema.uniqueItems = true;
          break;
      }
    });
    if (items) schema.items = items.map(item => this.transfer(item));
    return schema;
  }

  dateTransfer(describe, schema) {
    schema.type = 'string';
    schema.format = 'date-time';
    return schema;
  }

  booleanTransfer(describe, schema) {
    schema.type = 'boolean';
    return schema;
  }

  binaryTransfer(describe, schema) {
    const {rules} = describe;
    schema.type = 'string';
    schema.format = 'binary';
    if (rules) rules.forEach(({name, arg}) => {
      switch (name) {
        case 'min':
          schema.minLength = arg;
          break;
        case 'max':
          schema.maxLength = arg;
          break;
        case 'length':
          schema.minLength = arg;
          schema.maxLength = arg;
          break;
      }
    });
    return schema;
  }

  alternativesTransfer(describe, schema) {
    const {alternatives} = describe;
    schema.type = 'string';
    if (alternatives) schema.oneOf = alternatives.reduce((result, item) => {
      // not support when yet
      if (item.type) result.push(this.transfer(item));
      return result;
    }, []);
    return schema;
  }
};
