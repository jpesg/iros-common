import type {RequestHandler} from 'express';
import joi, { DateSchema } from 'joi';
import joiDateExtension from '@joi/date'
import _ from 'lodash';
import moment from 'moment';
import {ValidationHttpError} from '../errors/http.error';

export type RouteValidatorKey
    = 'headers'
    | 'body'
    | 'query'
    | 'params'
    | 'cookies'

export type RouteAllowUnknownOptions
    = 'allowUnknownHeaders'
    | 'allowUnknownBody'
    | 'allowUnknownQuery'
    | 'allowUnknownParams'
    | 'allowUnknownCookies'

/*
 * this is an workaround because apparently, Joi doesn't do well with Typescript when extending schemas
 * see https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30877
 */
interface ExtendedSchema extends joi.Root {
    date(): DateSchema
}
const Joi: ExtendedSchema = joi.extend(joiDateExtension);

// Note find out more options here: https://github.com/sideway/joi/blob/master/API.md#anyvalidatevalue-options
const options: Record<RouteAllowUnknownOptions, boolean> = {
        allowUnknownHeaders: true,
        allowUnknownBody: true,
        allowUnknownQuery: true,
        allowUnknownParams: true,
        allowUnknownCookies: true,
    },
    unknownMap: Record<RouteValidatorKey, RouteAllowUnknownOptions> = {
        headers: 'allowUnknownHeaders',
        body: 'allowUnknownBody',
        query: 'allowUnknownQuery',
        params: 'allowUnknownParams',
        cookies: 'allowUnknownCookies',
    },
    errors = {label: false},
    messages = {
        // Any
        'any.unknown': 'Not allowed',
        'any.invalid': 'Contains an invalid value',
        'any.empty': 'Not allowed to be empty',
        'any.required': 'Required',
        'any.allowOnly': 'Invalid value',
        'any.only': 'Invalid value',
        'any.default': 'Threw an error when running default method',

        // Array
        'array.at_least_one': 'At least one is required',
        'array.at_most_one': 'Only one is allowed',

        // String
        'string.base': 'Must be a string',
        'string.min': 'Must be at least {{#limit}} characters long',
        'string.max': 'Must be less than or equal to {{#limit}} characters long',
        'string.length': 'Must be {{#limit}} characters long',
        'string.alphanum': 'Must only contain alpha-numeric characters',
        'string.token': 'Must only contain alpha-numeric and underscore characters',
        'string.email': 'Must be a valid email',
        'string.uri': 'Must be a valid uri',
        'string.isoDate': 'Must be a valid ISO 8601 date',
        'string.guid': 'Must be a valid GUID',
        'string.hex': 'Must only contain hexadecimal characters',
        'string.base64': 'Must be a valid base64 string',
        'string.hostname': 'Must be a valid hostname',
        'string.lowercase': 'Must only contain lowercase characters',
        'string.uppercase': 'Must only contain uppercase characters',

        // Number
        'number.base': 'Must be a number',
        'number.min': 'Must be larger than or equal to {{#limit}}',
        'number.max': 'Must be less than or equal to {{#limit}}',
        'number.less': 'Must be less than {{#limit}}',
        'number.greater': 'Must be greater than {{#limit}}',
        'number.float': 'Must be a float or double',
        'number.integer': 'Must be an integer',
        'number.negative': 'Must be a negative number',
        'number.positive': 'Must be a positive number',
        'number.precision': 'Must have no more than {{#limit}} decimal places',
        'number.multiple': 'Must be a multiple of {{#multiple}}',

        // Date
        'date.min': 'Must be after {{#limit}}',
        'date.max': 'Must be before {{#limit}}',

        // Object
        'object.legal_age': 'Date is before 18th birthday',
    };

const validate = (data: joi.Context, schema: Record<string, joi.Schema>, location: string, allowUnknown: boolean) => {
    if (!data || !schema) {
        return {};
    }

    const joiOptions: joi.ValidationOptions = {
            context: data,
            allowUnknown,
            abortEarly: false,
            messages,
            // errors,
        },
        joiSchema = joi.object(schema).unknown()
            .required();

    const {error, value} = joiSchema.validate(data, joiOptions),
        out_errors: Record<string, string> = {};
        

    if (!error || !error.details || !error.details.length) {
        return {value};
    }

    error.details.forEach(e => {
        const path = _.isArray(e.path) ? e.path.join('.') : e.path;

        if (out_errors[path]) {
            return;
        }

        out_errors[path] = e.message;
        if (e.type === 'date.min' || e.type === 'date.max') {
            out_errors[path] = out_errors[path].replace(e.context?.limit, moment(e.context?.limit).format('DD.MM.YYYY'));
        }
    });

    return {errors: out_errors};
};

export {Joi};

export default (
    schema: Partial<Record<RouteValidatorKey, Record<string, joi.Schema>> 
    & Record<'options', typeof options>>): RequestHandler => {
    return (req, _res, next) => {
        const keys: RouteValidatorKey[] = [
                'headers',
                'body',
                'query',
                'params',
                'cookies',
            ],
            r = _.pick(req, keys);
        
        let errors = {};

        keys.forEach(key => {
            // FIXME: const options = _.defaults({}, schema.options || {}), // i think this is redundant?

            const allowUnknown = options[unknownMap[key]];

            if (schema[key] !== undefined) {
                const {value, errors: _errors} = validate(r[key], schema[key] as Record<string, joi.Schema>, key, allowUnknown);

                if (!_errors && value) {
                    req[key] = {
                        ...req[key],
                        ...value,
                    };
                }
                if (_errors) {
                    errors = {
                        ...errors,
                        ..._errors,
                    };
                }
            }
        });

        if (!_.isEmpty(errors)) {
            return next(new ValidationHttpError(errors));
        }

        return next();
    };
};
