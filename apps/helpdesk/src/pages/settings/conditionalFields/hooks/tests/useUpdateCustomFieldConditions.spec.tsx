import { renderHook } from '@repo/testing'
import { act, waitFor } from '@testing-library/react'

import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
    mockListCustomFieldConditionsHandler,
    mockListCustomFieldConditionsResponse,
    mockUpdateCustomFieldConditionsHandler,
} from '@gorgias/helpdesk-mocks'
import { useListCustomFieldConditions } from '@gorgias/helpdesk-queries'

import { OBJECT_TYPES } from 'custom-fields/constants'
import { customFieldCondition } from 'fixtures/customFieldCondition'

import { useUpdateCustomFieldConditions } from '../useUpdateCustomFieldConditions'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useUpdateCustomFieldConditions', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should optimistically update query on update and sort fields if sort order changed', async () => {
        const conditions = [
            { ...customFieldCondition, id: 1000, sort_order: 1 },
            { ...customFieldCondition, id: 1001, sort_order: 2 },
            { ...customFieldCondition, id: 1002, sort_order: 3 },
        ]

        server.use(
            mockListCustomFieldConditionsHandler(async () =>
                HttpResponse.json(
                    mockListCustomFieldConditionsResponse({
                        data: conditions,
                    }),
                ),
            ).handler,
            mockUpdateCustomFieldConditionsHandler(
                async () => new Promise(() => undefined),
            ).handler,
        )

        const { result } = renderHook(() => ({
            conditions: useListCustomFieldConditions({
                object_type: OBJECT_TYPES.TICKET,
            }),
            updateConditions: useUpdateCustomFieldConditions(),
        }))

        await waitFor(() => {
            expect(result.current.conditions.data?.data.data).toHaveLength(3)
        })

        act(() => {
            result.current.updateConditions.mutate({
                data: [
                    { id: 1000, sort_order: 2 },
                    { id: 1001, sort_order: 3 },
                    { id: 1002, sort_order: 1 },
                ],
            })
        })

        await waitFor(() => {
            expect(
                result.current.conditions.data?.data.data.map(
                    ({ id, sort_order }) => ({ id, sort_order }),
                ),
            ).toEqual([
                { id: 1002, sort_order: 1 },
                { id: 1000, sort_order: 2 },
                { id: 1001, sort_order: 3 },
            ])
        })
    })

    it('should invalidate proper query data on settled', async () => {
        let listRequestCount = 0
        server.use(
            mockListCustomFieldConditionsHandler(async () => {
                listRequestCount += 1
                return HttpResponse.json(
                    mockListCustomFieldConditionsResponse({
                        data: [customFieldCondition],
                    }),
                )
            }).handler,
            mockUpdateCustomFieldConditionsHandler(async () =>
                HttpResponse.json([customFieldCondition]),
            ).handler,
        )

        const { result } = renderHook(() => ({
            conditions: useListCustomFieldConditions({
                object_type: OBJECT_TYPES.TICKET,
            }),
            updateConditions: useUpdateCustomFieldConditions(),
        }))

        await waitFor(() => {
            expect(result.current.conditions.data?.data.data).toHaveLength(1)
        })

        await act(async () => {
            await result.current.updateConditions.mutateAsync({
                data: [customFieldCondition],
            })
        })

        await waitFor(() => {
            expect(listRequestCount).toBeGreaterThan(1)
        })
    })
})
