import { renderHook } from '@repo/testing/vitest'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import {
    mockCustomUserAvailabilityStatus,
    mockListCustomUserAvailabilityStatusesHandler,
    mockUpdateCustomUserAvailabilityStatus,
    mockUpdateCustomUserAvailabilityStatusHandler,
} from '@gorgias/helpdesk-mocks'
import { useListCustomUserAvailabilityStatuses } from '@gorgias/helpdesk-queries'

import { useUpdateAgentStatus } from '../useUpdateAgentStatus'

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

describe('useUpdateAgentStatus', () => {
    it('updates a status and refreshes the custom statuses list', async () => {
        const existingStatus = mockCustomUserAvailabilityStatus({
            id: 'status-1',
            name: 'Lunch break',
            duration_unit: 'minutes',
            duration_value: 30,
        })
        const updatedStatus = mockCustomUserAvailabilityStatus({
            ...existingStatus,
            name: 'Extended lunch break',
            duration_unit: 'hours',
            duration_value: 1,
        })
        const updateStatusPayload = mockUpdateCustomUserAvailabilityStatus({
            name: updatedStatus.name,
            description: updatedStatus.description,
            duration_unit: updatedStatus.duration_unit,
            duration_value: updatedStatus.duration_value,
        })

        let statuses = [existingStatus]

        const listStatusesMock = mockListCustomUserAvailabilityStatusesHandler(
            async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    data: statuses,
                }),
        )
        const updateStatusMock = mockUpdateCustomUserAvailabilityStatusHandler(
            async () => {
                statuses = [updatedStatus]

                return HttpResponse.json(updatedStatus)
            },
        )
        const waitForUpdateRequest = updateStatusMock.waitForRequest(server)

        server.use(listStatusesMock.handler, updateStatusMock.handler)

        const { result } = renderHook(() => ({
            updateStatus: useUpdateAgentStatus(),
            customStatuses: useListCustomUserAvailabilityStatuses(),
        }))

        await waitFor(() => {
            expect(result.current.customStatuses.data?.data.data[0].name).toBe(
                'Lunch break',
            )
        })

        await result.current.updateStatus.mutateAsync({
            pk: existingStatus.id,
            data: updateStatusPayload,
        })

        await waitForUpdateRequest(async (request) => {
            expect(await request.json()).toEqual(updateStatusPayload)
        })

        await waitFor(() => {
            expect(result.current.customStatuses.data?.data.data[0]).toEqual(
                updatedStatus,
            )
        })
    })
})
