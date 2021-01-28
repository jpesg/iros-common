## Update to 2.xxx

### Joi changes

1. Replace in all joi schemas `.allow([val1,val2])` by `.valid(val1,val2)`
2. Validate schemas directly, without joi - replace `joi.validate(data,schema)` to `schema.validate(data)`
3. Any custom errors needs to be defined as messages, not language - e.g. `.messages({'any.required': 'This is required'}),`. Find out more about all the types here: https://github.com/sideway/joi/blob/master/API.md#types
