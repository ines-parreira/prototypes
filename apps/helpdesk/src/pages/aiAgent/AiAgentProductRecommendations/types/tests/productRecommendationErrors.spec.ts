import { AxiosError } from 'axios'

import { isProductRecommendationConflictError } from '../productRecommendationErrors'

describe('isProductRecommendationConflictError', () => {
    it('should return true for valid conflict error structure', () => {
        const error = new AxiosError(
            'Conflict',
            'ERR_BAD_REQUEST',
            undefined,
            undefined,
            {
                status: 409,
                statusText: 'Conflict',
                headers: {},
                config: {} as any,
                data: {
                    productConflicts: [
                        {
                            productId: '123',
                            productName: 'Test Product',
                            conflicts: [
                                {
                                    type: 'product',
                                    action: 'promoted',
                                    items: [{ target: '123' }],
                                },
                            ],
                        },
                    ],
                },
            },
        )

        expect(isProductRecommendationConflictError(error)).toBe(true)
    })

    it('should return false for non-axios errors', () => {
        const error = {
            response: {
                status: 409,
                data: {
                    productConflicts: [],
                },
            },
        }

        expect(isProductRecommendationConflictError(error)).toBe(false)
    })

    it('should return false for non-409 status code', () => {
        const error = new AxiosError(
            'Bad Request',
            'ERR_BAD_REQUEST',
            undefined,
            undefined,
            {
                status: 400,
                statusText: 'Bad Request',
                headers: {},
                config: {} as any,
                data: {
                    productConflicts: [],
                },
            },
        )

        expect(isProductRecommendationConflictError(error)).toBe(false)
    })

    it('should return false for missing conflicts field', () => {
        const error = new AxiosError(
            'Conflict',
            'ERR_BAD_REQUEST',
            undefined,
            undefined,
            {
                status: 409,
                statusText: 'Conflict',
                headers: {},
                config: {} as any,
                data: {
                    message: 'Some other error',
                },
            },
        )

        expect(isProductRecommendationConflictError(error)).toBe(false)
    })

    it('should return false for invalid conflict structure', () => {
        const error = new AxiosError(
            'Conflict',
            'ERR_BAD_REQUEST',
            undefined,
            undefined,
            {
                status: 409,
                statusText: 'Conflict',
                headers: {},
                config: {} as any,
                data: {
                    productConflicts: 'not an array',
                },
            },
        )

        expect(isProductRecommendationConflictError(error)).toBe(false)
    })

    it('should return false for missing response', () => {
        const error = new AxiosError(
            'Network error',
            'ERR_NETWORK',
            undefined,
            undefined,
            undefined,
        )

        expect(isProductRecommendationConflictError(error)).toBe(false)
    })

    it('should return false for null error', () => {
        expect(isProductRecommendationConflictError(null)).toBe(false)
    })

    it('should return false for undefined error', () => {
        expect(isProductRecommendationConflictError(undefined)).toBe(false)
    })

    it('should return false for plain Error objects', () => {
        const error = new Error('Some error')
        expect(isProductRecommendationConflictError(error)).toBe(false)
    })

    it('should return false for string errors', () => {
        expect(isProductRecommendationConflictError('error string')).toBe(false)
    })

    it('should return true for empty conflicts array', () => {
        const error = new AxiosError(
            'Conflict',
            'ERR_BAD_REQUEST',
            undefined,
            undefined,
            {
                status: 409,
                statusText: 'Conflict',
                headers: {},
                config: {} as any,
                data: {
                    productConflicts: [],
                },
            },
        )

        expect(isProductRecommendationConflictError(error)).toBe(true)
    })

    it('should return false for malformed conflict objects', () => {
        const error = new AxiosError(
            'Conflict',
            'ERR_BAD_REQUEST',
            undefined,
            undefined,
            {
                status: 409,
                statusText: 'Conflict',
                headers: {},
                config: {} as any,
                data: {
                    productConflicts: [
                        {
                            // Missing required fields
                            productName: 'Test',
                        },
                    ],
                },
            },
        )

        expect(isProductRecommendationConflictError(error)).toBe(false)
    })

    it('should return false for conflicts with invalid action values', () => {
        const error = new AxiosError(
            'Conflict',
            'ERR_BAD_REQUEST',
            undefined,
            undefined,
            {
                status: 409,
                statusText: 'Conflict',
                headers: {},
                config: {} as any,
                data: {
                    productConflicts: [
                        {
                            productId: '123',
                            productName: 'Test Product',
                            conflicts: [
                                {
                                    type: 'product',
                                    action: 'invalid-action', // Invalid action
                                    items: [{ target: '123' }],
                                },
                            ],
                        },
                    ],
                },
            },
        )

        expect(isProductRecommendationConflictError(error)).toBe(false)
    })

    it('should return false for conflicts with invalid type values', () => {
        const error = new AxiosError(
            'Conflict',
            'ERR_BAD_REQUEST',
            undefined,
            undefined,
            {
                status: 409,
                statusText: 'Conflict',
                headers: {},
                config: {} as any,
                data: {
                    productConflicts: [
                        {
                            productId: '123',
                            productName: 'Test Product',
                            conflicts: [
                                {
                                    type: 'invalid-type', // Invalid type
                                    action: 'promoted',
                                    items: [{ target: '123' }],
                                },
                            ],
                        },
                    ],
                },
            },
        )

        expect(isProductRecommendationConflictError(error)).toBe(false)
    })
})
