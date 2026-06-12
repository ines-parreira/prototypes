import { renderHook } from '@repo/testing'
import { act, waitFor } from '@testing-library/react'

import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import {
    mockListCustomFieldConditionsHandler,
    mockListCustomFieldConditionsResponse,
    mockUpdateCustomFieldConditionHandler,
} from '@gorgias/helpdesk-mocks'
import { useListCustomFieldConditions } from '@gorgias/helpdesk-queries'

import { OBJECT_TYPES } from 'custom-fields/constants'
import { customFieldCondition } from 'fixtures/customFieldCondition'

import { useUpdateCustomFieldCondition } from '../useUpdateCustomFieldCondition'

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

describe('useUpdateCustomFieldCondition', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should invalidate proper query data on success', async () => {
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
            mockUpdateCustomFieldConditionHandler(async () =>
                HttpResponse.json({
                    ...customFieldCondition,
                    name: 'New name',
                }),
            ).handler,
        )

        const { result } = renderHook(() => ({
            conditions: useListCustomFieldConditions({
                object_type: OBJECT_TYPES.TICKET,
            }),
            updateCondition: useUpdateCustomFieldCondition(),
        }))

        await waitFor(() => {
            expect(result.current.conditions.data?.data.data).toHaveLength(1)
        })

        await act(async () => {
            await result.current.updateCondition.mutateAsync({
                id: customFieldCondition.id,
                data: { name: 'New name' },
            })
        })

        await waitFor(() => {
            expect(listRequestCount).toBeGreaterThan(1)
        })
    })
})
