## Update to 3.0.0

Everything is now migrated to Typescript.

Breaking changes:
 - workers now use delays instead of timeouts

## Update to 2.0.44

### User service

User service now requires api key in .env

## Update to 2.0.33

### User service

User service now requires app sections to be defined in .env. It takes a comma delimited string - `USER_SECTIONS=all,quotes`

## Update to 2.xxx

### Joi changes

1. Replace in all joi schemas `.allow([val1,val2])` by `.valid(val1,val2)`
2. Validate schemas directly, without joi - replace `joi.validate(data,schema)` to `schema.validate(data)`
3. Any custom errors needs to be defined as messages, not language - e.g. `.messages({'any.required': 'This is required'}),`. Find out more about all the types here: https://github.com/sideway/joi/blob/master/API.md#types
