import {joi as Joi} from 'iros-common';

export default {
    // basic types
    str: Joi.string().required(),

    // joi object (required)
    obj: Joi.object()
        .keys({
            int: Joi.number().required(),
        })
        .required(),

    // plain object (optional)
    plain_obj: {
        bool: Joi.bool().required(),
    },

    // conditional validation
    when: Joi.string().required(),
    date: Joi.alternatives().conditional('when', {
        'switch': [
            {
                is: 'before',
                then: Joi.date()
                    .max(new Date())
                    .messages({'date.max': 'must be before today'})
                    .required(),
            },
            {
                is: 'after',
                then: Joi.date()
                    .min(new Date())
                    .messages({'date.min': 'must be after today'})
                    .required(),
            },
        ],
        'otherwise': Joi.string().valid('today')
            .required()
    })
        .required(),
};
