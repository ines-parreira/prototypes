import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import {
    mockCreateCustomUserAvailabilityStatus,
    mockCreateCustomUserAvailabilityStatusHandler,
    mockCustomUserAvailabilityStatus,
    mockListCustomUserAvailabilityStatusesHandler,
} from '@gorgias/helpdesk-mocks'
import { useListCustomUserAvailabilityStatuses } from '@gorgias/helpdesk-queries'

import { useCreateAgentStatus } from '../useCreateAgentStatus'

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

describe('useCreateAgentStatus', () => {
    it('creates a status and refreshes the custom statuses list', async () => {
        const existingStatus = mockCustomUserAvailabilityStatus({
            id: 'status-1',
            name: 'Lunch break',
            duration_unit: 'minutes',
            duration_value: 30,
        })
        const createdStatus = mockCustomUserAvailabilityStatus({
            id: 'status-2',
            name: 'Coffee break',
            description: 'Quick recharge',
            duration_unit: 'minutes',
            duration_value: 15,
        })
        const createStatusPayload = mockCreateCustomUserAvailabilityStatus({
            name: createdStatus.name,
            description: createdStatus.description,
            duration_unit: createdStatus.duration_unit,
            duration_value: createdStatus.duration_value,
        })

        let statuses = [existingStatus]

        const listStatusesMock = mockListCustomUserAvailabilityStatusesHandler(
            async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    data: statuses,
                }),
        )
        const createStatusMock = mockCreateCustomUserAvailabilityStatusHandler(
            async () => {
                statuses = [...statuses, createdStatus]

                return HttpResponse.json(createdStatus)
            },
        )
        const waitForCreateRequest = createStatusMock.waitForRequest(server)

        server.use(listStatusesMock.handler, createStatusMock.handler)

        const { result } = renderHook(() => ({
            createStatus: useCreateAgentStatus(),
            customStatuses: useListCustomUserAvailabilityStatuses(),
        }))

        await waitFor(() => {
            expect(
                result.current.customStatuses.data?.data.data.map(
                    ({ id }) => id,
                ),
            ).toEqual(['status-1'])
        })

        await result.current.createStatus.mutateAsync({
            data: createStatusPayload,
        })

        await waitForCreateRequest(async (request) => {
            expect(await request.json()).toEqual(createStatusPayload)
        })

        await waitFor(() => {
            expect(
                result.current.customStatuses.data?.data.data.map(
                    ({ id }) => id,
                ),
            ).toEqual(['status-1', 'status-2'])
        })
    })
})
