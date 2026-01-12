import type { HttpResponse } from '@gorgias/helpdesk-types'

import { updateResult } from '../updateResult'

type TestHttpResponse<T> = HttpResponse & {
    data: {
        data: T
        meta?: Record<string, unknown>
        object?: string
        uri?: string
    }
}

function createMockResponse<T>(data: {
    data: T
    meta?: Record<string, unknown>
    object?: string
    uri?: string
}): TestHttpResponse<T> {
    return {
        data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {},
    } as TestHttpResponse<T>
}

describe('updateResult', () => {
    describe('data replacement', () => {
        it('should replace array data and preserve metadata', () => {
            const previousResult = createMockResponse({
                data: [{ id: 1 }, { id: 2 }],
                meta: { total: 2 },
                object: 'list',
                uri: '/api/items',
            })

            const result = updateResult(previousResult, [{ id: 3 }, { id: 4 }])

            expect(result.data.data).toEqual([{ id: 3 }, { id: 4 }])
            expect(result.data.meta).toEqual({ total: 2 })
            expect(result.data.object).toBe('list')
            expect(result.data.uri).toBe('/api/items')
        })

        it('should replace with empty arrays', () => {
            const previousResult = createMockResponse({
                data: [{ id: 1 }, { id: 2 }],
            })

            const emptyResult = updateResult(previousResult, [])
            expect(emptyResult.data.data).toEqual([])

            const populatedResult = updateResult(
                createMockResponse<Array<{ id: number }>>({ data: [] }),
                [{ id: 1 }],
            )
            expect(populatedResult.data.data).toEqual([{ id: 1 }])
        })

        it('should replace object data', () => {
            type UserData = {
                id: number
                name: string
                email: string
            }

            const previousResult = createMockResponse<UserData>({
                data: {
                    id: 1,
                    name: 'John',
                    email: 'john@example.com',
                },
                meta: { version: 1 },
            })

            const partialResult = updateResult(previousResult, { name: 'Jane' })
            expect(partialResult.data.data).toEqual({ name: 'Jane' })
            expect(partialResult.data.meta).toEqual({ version: 1 })

            const completeResult = updateResult(previousResult, {
                id: 1,
                name: 'Jane',
                email: 'jane@example.com',
            })
            expect(completeResult.data.data).toEqual({
                id: 1,
                name: 'Jane',
                email: 'jane@example.com',
            })
        })

        it('should replace primitive data', () => {
            expect(
                updateResult(createMockResponse<string>({ data: 'old' }), 'new')
                    .data.data,
            ).toBe('new')

            expect(
                updateResult(createMockResponse<number>({ data: 42 }), 100).data
                    .data,
            ).toBe(100)

            expect(
                updateResult(createMockResponse<boolean>({ data: true }), false)
                    .data.data,
            ).toBe(false)
        })
    })

    describe('metadata preservation', () => {
        it('should preserve all response properties', () => {
            const previousResult = createMockResponse({
                data: { id: 1 },
                meta: { page: 1, total: 10 },
                object: 'item',
                uri: '/api/items/1',
            })

            previousResult.status = 200
            previousResult.headers = { 'content-type': 'application/json' }

            const result = updateResult(previousResult, { id: 2 })

            expect(result.data.data).toEqual({ id: 2 })
            expect(result.data.meta).toEqual({ page: 1, total: 10 })
            expect(result.data.object).toBe('item')
            expect(result.data.uri).toBe('/api/items/1')
            expect(result.status).toBe(200)
            expect(result.headers).toEqual({
                'content-type': 'application/json',
            })
        })
    })

    describe('edge cases', () => {
        it('should handle null or undefined data property', () => {
            const nullResult = updateResult(
                {
                    data: null,
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {},
                } as unknown as TestHttpResponse<{ id: number }>,
                { id: 1 },
            )
            expect(nullResult.data.data).toEqual({ id: 1 })

            const undefinedResult = updateResult(
                {
                    data: undefined,
                    status: 200,
                    statusText: 'OK',
                    headers: {},
                    config: {},
                } as unknown as TestHttpResponse<{ id: number }>,
                { id: 1 },
            )
            expect(undefinedResult.data.data).toEqual({ id: 1 })
        })

        it('should handle empty and null values', () => {
            type ItemData = { id: number; name: string | null }

            const emptyObjectResult = updateResult(
                createMockResponse<ItemData>({
                    data: { id: 1, name: 'Test' },
                }),
                {},
            )
            expect(emptyObjectResult.data.data).toEqual({})

            const nullValueResult = updateResult(
                createMockResponse<ItemData>({
                    data: { id: 1, name: 'Test' },
                }),
                { id: 1, name: null },
            )
            expect(nullValueResult.data.data).toEqual({ id: 1, name: null })
        })
    })

    describe('type safety', () => {
        it('should infer and preserve correct types for arrays', () => {
            type Item = { id: number; name: string }

            const previousResult = createMockResponse<Item[]>({
                data: [
                    { id: 1, name: 'Item 1' },
                    { id: 2, name: 'Item 2' },
                ],
            })

            const result = updateResult(previousResult, [
                { id: 3, name: 'Item 3' },
            ])

            const firstItem: Item = result.data.data[0]
            expect(firstItem.id).toBe(3)
            expect(firstItem.name).toBe('Item 3')
        })

        it('should infer and preserve correct types for objects', () => {
            type User = {
                id: number
                name: string
                email: string
            }

            const previousResult = createMockResponse<User>({
                data: {
                    id: 1,
                    name: 'John',
                    email: 'john@example.com',
                },
            })

            const result = updateResult(previousResult, {
                id: 1,
                name: 'Jane',
                email: 'jane@example.com',
            })

            const userId: number = result.data.data.id
            const userName: string = result.data.data.name
            const userEmail: string = result.data.data.email

            expect(userId).toBe(1)
            expect(userName).toBe('Jane')
            expect(userEmail).toBe('jane@example.com')
        })

        it('should preserve complex nested types', () => {
            type ComplexData = {
                id: number
                user: {
                    name: string
                    roles: string[]
                }
                metadata: Record<string, unknown>
            }

            const previousResult = createMockResponse<ComplexData>({
                data: {
                    id: 1,
                    user: {
                        name: 'John',
                        roles: ['admin'],
                    },
                    metadata: { createdAt: '2024-01-01' },
                },
            })

            const result = updateResult(previousResult, {
                id: 1,
                user: {
                    name: 'Jane',
                    roles: ['user', 'editor'],
                },
                metadata: { createdAt: '2024-01-01' },
            })

            expect(result.data.data.user.name).toBe('Jane')
            expect(result.data.data.user.roles).toEqual(['user', 'editor'])
            expect(result.data.data.id).toBe(1)
            expect(result.data.data.metadata).toEqual({
                createdAt: '2024-01-01',
            })
        })

        it('should preserve return type matching input type', () => {
            type CustomResponse = TestHttpResponse<{ value: number }>

            const previousResult: CustomResponse = createMockResponse({
                data: { value: 10 },
            })

            const result: CustomResponse = updateResult(previousResult, {
                value: 20,
            })

            expect(result.data.data.value).toBe(20)
        })
    })
})
