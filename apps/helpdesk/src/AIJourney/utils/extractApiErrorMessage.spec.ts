import { extractApiErrorMessage } from './extractApiErrorMessage'

describe('extractApiErrorMessage', () => {
    it('returns undefined for non-object errors', () => {
        expect(extractApiErrorMessage(undefined)).toBeUndefined()
        expect(extractApiErrorMessage(null)).toBeUndefined()
        expect(extractApiErrorMessage('boom')).toBeUndefined()
        expect(extractApiErrorMessage(42)).toBeUndefined()
    })

    it('returns undefined when there is no response data', () => {
        expect(extractApiErrorMessage(new Error('plain'))).toBeUndefined()
        expect(extractApiErrorMessage({ response: {} })).toBeUndefined()
        expect(
            extractApiErrorMessage({ response: { data: undefined } }),
        ).toBeUndefined()
    })

    it('returns the string detail directly', () => {
        const error = {
            response: {
                data: { detail: 'scheduled_starts_at must be in the future' },
            },
        }
        expect(extractApiErrorMessage(error)).toBe(
            'scheduled_starts_at must be in the future',
        )
    })

    it('returns the message field of an object detail', () => {
        const error = {
            response: {
                data: {
                    detail: {
                        code: 'campaign_stopped',
                        message:
                            'Failed to start, scheduled_starts_at must be in the future',
                    },
                },
            },
        }
        expect(extractApiErrorMessage(error)).toBe(
            'Failed to start, scheduled starts at must be in the future',
        )
    })

    it('joins messages from an array of error objects', () => {
        const error = {
            response: {
                data: {
                    detail: [
                        { code: 'a', message: 'First problem' },
                        { code: 'b', message: 'Second problem' },
                    ],
                },
            },
        }
        expect(extractApiErrorMessage(error)).toBe(
            'First problem, Second problem',
        )
    })

    it('falls back to record values when message is absent in array entries', () => {
        const error = {
            response: {
                data: {
                    detail: [{ klaviyo_api_key: 'Invalid key' }],
                },
            },
        }
        expect(extractApiErrorMessage(error)).toBe('Invalid key')
    })

    it('returns top-level message when detail is missing', () => {
        const error = {
            response: { data: { message: 'Top level message' } },
        }
        expect(extractApiErrorMessage(error)).toBe('Top level message')
    })

    it('returns undefined when no recoverable message can be parsed', () => {
        expect(
            extractApiErrorMessage({ response: { data: { detail: [] } } }),
        ).toBeUndefined()
        expect(
            extractApiErrorMessage({ response: { data: { detail: {} } } }),
        ).toBeUndefined()
    })

    it('prefers nested errors[].message over the generic detail.message', () => {
        const error = {
            response: {
                data: {
                    detail: {
                        message: 'Validation error',
                        errors: [
                            {
                                field: 'campaign.campaign',
                                message:
                                    'Value error, scheduled_datetime must be in the future',
                                type: 'value_error',
                            },
                        ],
                    },
                },
            },
        }
        expect(extractApiErrorMessage(error)).toBe(
            'Please pick a date and time in the future.',
        )
    })

    it('strips the "Value error," prefix from Pydantic messages', () => {
        const error = {
            response: {
                data: {
                    detail: {
                        message:
                            'Value error, scheduled_datetime must be in the future',
                    },
                },
            },
        }
        expect(extractApiErrorMessage(error)).toBe(
            'Please pick a date and time in the future.',
        )
    })

    it('prettifies snake_case field names in unknown messages', () => {
        const error = {
            response: {
                data: {
                    detail: {
                        message:
                            'Value error, included_audience_list_ids cannot be empty',
                    },
                },
            },
        }
        expect(extractApiErrorMessage(error)).toBe(
            'included audience list ids cannot be empty',
        )
    })

    it('joins multiple nested errors with commas', () => {
        const error = {
            response: {
                data: {
                    detail: {
                        message: 'Validation error',
                        errors: [
                            { field: 'a', message: 'First problem' },
                            { field: 'b', message: 'Second problem' },
                        ],
                    },
                },
            },
        }
        expect(extractApiErrorMessage(error)).toBe(
            'First problem, Second problem',
        )
    })

    it('reads the msg field used by Pydantic v2 entries', () => {
        const error = {
            response: {
                data: {
                    detail: [
                        {
                            type: 'value_error',
                            loc: ['body', 'scheduled_datetime'],
                            msg: 'Please pick a date and time in the future.',
                        },
                    ],
                },
            },
        }
        expect(extractApiErrorMessage(error)).toBe(
            'Please pick a date and time in the future.',
        )
    })
})
