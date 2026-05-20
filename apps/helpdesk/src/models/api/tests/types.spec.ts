import {
    INTEGRATION_LIMIT_REACHED_ERROR_CODE,
    isGorgiasApiError,
    isIntegrationLimitReachedError,
} from '../types'

describe('types', () => {
    describe('isGorgiasApiError', () => {
        it.each([
            ['number', 1],
            ['string', 'foo'],
            ['empty object', {}],
            [
                'some axios error',
                {
                    isAxiosError: true,
                    response: {
                        data: {
                            foo: 'bar',
                        },
                    },
                },
            ],
            [
                'error with data object containing msg and data',
                {
                    isAxiosError: true,
                    response: {
                        data: {
                            msg: 'foo',
                            data: {
                                bar: 'baz',
                            },
                        },
                    },
                },
            ],
            [
                'error with error object containing a message that is not a string',
                {
                    isAxiosError: true,
                    response: {
                        data: {
                            error: {
                                msg: [],
                            },
                        },
                    },
                },
            ],
        ])('should return false for %s', (_, error) => {
            expect(isGorgiasApiError(error)).toBe(false)
        })

        it('should return true for gorgias error', () => {
            const errorWithMessageAndData = {
                isAxiosError: true,
                response: {
                    data: {
                        error: {
                            msg: 'Failed to create.',
                            data: { foo: 'bar' },
                        },
                    },
                },
            }

            expect(isGorgiasApiError(errorWithMessageAndData)).toBe(true)

            const errorWithOnlyMessage = {
                isAxiosError: true,
                response: {
                    data: {
                        error: {
                            msg: 'Failed to create.',
                        },
                    },
                },
            }

            expect(isGorgiasApiError(errorWithOnlyMessage)).toBe(true)
        })
    })

    describe('isIntegrationLimitReachedError', () => {
        const buildError = (data: unknown) => ({
            isAxiosError: true,
            response: {
                status: 422,
                data: {
                    error: {
                        msg: "You've reached your plan's limit of 25 channels.",
                        data,
                    },
                },
            },
        })

        it('should return true for a well-formed integration_limit_reached 422 error', () => {
            const error = buildError({
                error_code: INTEGRATION_LIMIT_REACHED_ERROR_CODE,
                limit: 25,
                current: 25,
                upgradable: true,
            })

            expect(isIntegrationLimitReachedError(error)).toBe(true)
        })

        it.each([
            [
                'non-gorgias error',
                { isAxiosError: true, response: { data: {} } },
            ],
            [
                'gorgias error without data field',
                {
                    isAxiosError: true,
                    response: {
                        data: {
                            error: {
                                msg: "You've reached your plan's limit of 25 channels.",
                            },
                        },
                    },
                },
            ],
            [
                'mismatched error_code',
                buildError({
                    error_code: 'something_else',
                    limit: 25,
                    current: 25,
                    upgradable: true,
                }),
            ],
            [
                'missing limit',
                buildError({
                    error_code: INTEGRATION_LIMIT_REACHED_ERROR_CODE,
                    current: 25,
                    upgradable: true,
                }),
            ],
            [
                'missing current',
                buildError({
                    error_code: INTEGRATION_LIMIT_REACHED_ERROR_CODE,
                    limit: 25,
                    upgradable: true,
                }),
            ],
            [
                'missing upgradable',
                buildError({
                    error_code: INTEGRATION_LIMIT_REACHED_ERROR_CODE,
                    limit: 25,
                    current: 25,
                }),
            ],
            [
                'limit not a number',
                buildError({
                    error_code: INTEGRATION_LIMIT_REACHED_ERROR_CODE,
                    limit: '25',
                    current: 25,
                    upgradable: true,
                }),
            ],
            [
                'upgradable not a boolean',
                buildError({
                    error_code: INTEGRATION_LIMIT_REACHED_ERROR_CODE,
                    limit: 25,
                    current: 25,
                    upgradable: 'yes',
                }),
            ],
        ])('should return false for %s', (_, error) => {
            expect(isIntegrationLimitReachedError(error)).toBe(false)
        })
    })
})
