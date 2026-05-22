import { describe, expect, it } from 'vitest'

import { getApiErrorMessage } from '../getApiErrorMessage'

const FALLBACK = 'Something went wrong'

describe('getApiErrorMessage', () => {
    describe('returns the API message', () => {
        it('extracts response.data.error.msg from a Gorgias-shaped error', () => {
            const error = {
                response: { data: { error: { msg: 'Boom' } } },
            }
            expect(getApiErrorMessage(error, FALLBACK)).toBe('Boom')
        })

        it('extracts the message even when the response has extra fields', () => {
            const error = {
                isAxiosError: true,
                response: {
                    status: 500,
                    headers: {},
                    data: {
                        error: {
                            msg: 'Server exploded',
                            code: 'SERVER_ERROR',
                        },
                        extra: 'ignored',
                    },
                },
                config: {},
            }
            expect(getApiErrorMessage(error, FALLBACK)).toBe('Server exploded')
        })
    })

    describe('falls back when the shape is wrong', () => {
        it.each([
            { label: 'null', value: null },
            { label: 'undefined', value: undefined },
            { label: 'a string', value: 'oops' },
            { label: 'a number', value: 500 },
            { label: 'a boolean', value: false },
        ])('returns the fallback when error is $label', ({ value }) => {
            expect(getApiErrorMessage(value, FALLBACK)).toBe(FALLBACK)
        })

        it('returns the fallback when response is missing', () => {
            expect(getApiErrorMessage({}, FALLBACK)).toBe(FALLBACK)
        })

        it('returns the fallback when response is not an object', () => {
            expect(
                getApiErrorMessage({ response: 'not an object' }, FALLBACK),
            ).toBe(FALLBACK)
        })

        it('returns the fallback when response is null', () => {
            expect(getApiErrorMessage({ response: null }, FALLBACK)).toBe(
                FALLBACK,
            )
        })

        it('returns the fallback when data is missing', () => {
            expect(getApiErrorMessage({ response: {} }, FALLBACK)).toBe(
                FALLBACK,
            )
        })

        it('returns the fallback when data is not an object', () => {
            expect(
                getApiErrorMessage(
                    { response: { data: 'plain string' } },
                    FALLBACK,
                ),
            ).toBe(FALLBACK)
        })

        it('returns the fallback when data is null', () => {
            expect(
                getApiErrorMessage({ response: { data: null } }, FALLBACK),
            ).toBe(FALLBACK)
        })

        it('returns the fallback when error field is missing', () => {
            expect(
                getApiErrorMessage({ response: { data: {} } }, FALLBACK),
            ).toBe(FALLBACK)
        })

        it('returns the fallback when error field is not an object', () => {
            expect(
                getApiErrorMessage(
                    { response: { data: { error: 'flat' } } },
                    FALLBACK,
                ),
            ).toBe(FALLBACK)
        })

        it('returns the fallback when error field is null', () => {
            expect(
                getApiErrorMessage(
                    { response: { data: { error: null } } },
                    FALLBACK,
                ),
            ).toBe(FALLBACK)
        })

        it('returns the fallback when msg is missing', () => {
            expect(
                getApiErrorMessage(
                    { response: { data: { error: {} } } },
                    FALLBACK,
                ),
            ).toBe(FALLBACK)
        })

        it('returns the fallback when msg is not a string', () => {
            expect(
                getApiErrorMessage(
                    { response: { data: { error: { msg: 42 } } } },
                    FALLBACK,
                ),
            ).toBe(FALLBACK)
        })

        it('returns the fallback when msg is null', () => {
            expect(
                getApiErrorMessage(
                    { response: { data: { error: { msg: null } } } },
                    FALLBACK,
                ),
            ).toBe(FALLBACK)
        })
    })

    describe('edge cases', () => {
        it('returns an empty string when msg is an empty string (still a string)', () => {
            expect(
                getApiErrorMessage(
                    { response: { data: { error: { msg: '' } } } },
                    FALLBACK,
                ),
            ).toBe('')
        })

        it('does not throw on a real Error instance with no response', () => {
            const error = new Error('network down')
            expect(getApiErrorMessage(error, FALLBACK)).toBe(FALLBACK)
        })

        it('uses the provided fallback string verbatim', () => {
            expect(getApiErrorMessage(null, 'a custom fallback')).toBe(
                'a custom fallback',
            )
        })
    })
})
