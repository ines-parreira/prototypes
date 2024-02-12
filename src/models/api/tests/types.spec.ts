import {isGorgiasApiError} from '../types'

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
        ])('should return false for %s', (_, error) => {
            expect(isGorgiasApiError(error)).toBe(false)
        })

        it('should return true for gorgias error', () => {
            const error = {
                isAxiosError: true,
                response: {
                    data: {
                        error: {
                            msg: 'Failed to create.',
                            data: {foo: 'bar'},
                        },
                    },
                },
            }

            expect(isGorgiasApiError(error)).toBe(true)
        })
    })
})
