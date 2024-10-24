import {validateCreateCustomerBody} from '@gorgias/api-validators'

import {GorgiasApiResponseDataError} from 'models/api/types'

import {
    FormValidator,
    createFormValidator,
    createResolver,
    toFieldErrors,
    toFormErrors,
} from './validation'

describe('toFieldErrors()', () => {
    it('transforms FormErrors into FieldErrors', () => {
        expect(toFieldErrors({})).toEqual({})
        expect(
            toFieldErrors({
                name: 'Is required',
            })
        ).toEqual({
            name: {
                type: 'string',
                message: 'Is required',
            },
        })
    })

    it('correctly handles nested structures', () => {
        expect(
            toFieldErrors({
                name: 'Is required',
                address: {
                    street: 'Is required',
                },
                items: [{name: 'Is required'}, {name: 'Is taken'}],
            })
        ).toEqual({
            name: {
                type: 'string',
                message: 'Is required',
            },
            address: {
                street: {
                    type: 'string',
                    message: 'Is required',
                },
            },
            items: [
                {name: {type: 'string', message: 'Is required'}},
                {name: {type: 'string', message: 'Is taken'}},
            ],
        })
    })

    it('correctly transforms a server error response (GorgiasApiError) to field errors', () => {
        const serverError: GorgiasApiResponseDataError<{
            meta: {address: string[]}
        }> = {
            msg: 'Failed to create integration.',
            data: {
                meta: {address: ['This email address is already connected.']},
            },
        }

        expect(toFieldErrors(serverError.data)).toEqual({
            meta: {
                address: {
                    type: 'string',
                    message: 'This email address is already connected.',
                },
            },
        })
    })

    it('picks the first error if multiple are returned for a single field in a server error response', () => {
        const serverError: GorgiasApiResponseDataError<{
            meta: {address: string[]}
        }> = {
            msg: 'Failed to create integration.',
            data: {
                meta: {
                    address: [
                        'This email address is already connected.',
                        'This address is not verified.',
                    ],
                },
            },
        }

        expect(toFieldErrors(serverError.data)).toEqual({
            meta: {
                address: {
                    type: 'string',
                    message: 'This email address is already connected.',
                },
            },
        })
    })

    it('discards unknown error values', () => {
        expect(
            toFieldErrors({
                name: 'Is required',
                address: null,
                username: 0,
            })
        ).toEqual({
            name: {
                type: 'string',
                message: 'Is required',
            },
        })
    })
})

describe('toFormErrors()', () => {
    it('transforms a (AJV) ValidationResult into FormErrors', () => {
        expect(
            toFormErrors({
                isValid: true,
                data: {
                    name: 'name',
                },
                errors: [],
            })
        ).toEqual({})

        expect(
            toFormErrors({
                isValid: false,
                data: undefined,
                errors: [],
            })
        ).toEqual({})

        expect(
            toFormErrors({
                isValid: false,
                data: undefined,
                errors: [
                    {
                        message: 'Not valid',
                        path: '{base}.name',
                        context: {errorType: 'not'},
                    },
                ],
            })
        ).toEqual({
            name: 'Not valid',
        })
    })
})

describe('createResolver()', () => {
    it('creates a RHF resolver from a FormValidator', () => {
        const validator: FormValidator<{name: string}> = (values) => {
            if (!values.name) {
                return {
                    name: 'is required!',
                }
            }
        }

        const resolver = createResolver(validator)

        expect(typeof resolver).toBe('function')
        expect(resolver({name: ''})).toEqual({
            errors: {
                name: {
                    message: 'is required!',
                    type: 'string',
                },
            },
            values: {
                name: '',
            },
        })
    })
})

describe('createFormValidator()', () => {
    it('creates a FormValidator from an AJV (SDK) validator', () => {
        const validator = createFormValidator(validateCreateCustomerBody)
        expect(validator({email: 'x', channels: []})).toEqual({
            email: "Property 'email' must match format 'email'",
        })
    })
})
