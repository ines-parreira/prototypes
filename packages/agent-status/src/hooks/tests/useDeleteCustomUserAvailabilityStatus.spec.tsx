import { renderHook } from '@repo/testing/vitest'
import { act, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'

import {
    mockCustomUserAvailabilityStatus,
    mockDeleteCustomUserAvailabilityStatusHandler,
    mockListCustomUserAvailabilityStatusesHandler,
} from '@gorgias/helpdesk-mocks'
import { useListCustomUserAvailabilityStatuses } from '@gorgias/helpdesk-queries'

import { useDeleteCustomUserAvailabilityStatus } from '../useDeleteCustomUserAvailabilityStatus'

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

describe('useDeleteCustomUserAvailabilityStatus', () => {
    it('optimistically removes the deleted status and keeps the list in sync', async () => {
        const firstStatus = mockCustomUserAvailabilityStatus({
            id: 'status-1',
            name: 'Lunch break',
        })
        const secondStatus = mockCustomUserAvailabilityStatus({
            id: 'status-2',
            name: 'Coffee break',
        })

        let statuses = [firstStatus, secondStatus]
        let resolveDeleteRequest: (() => void) | undefined
        const deleteRequestCompleted = new Promise<void>((resolve) => {
            resolveDeleteRequest = resolve
        })

        const listStatusesMock = mockListCustomUserAvailabilityStatusesHandler(
            async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    data: statuses,
                }),
        )
        const deleteStatusMock = mockDeleteCustomUserAvailabilityStatusHandler(
            async () => {
                await deleteRequestCompleted
                statuses = [secondStatus]

                return new HttpResponse(null, { status: 204 })
            },
        )
        const waitForDeleteRequest = deleteStatusMock.waitForRequest(server)

        server.use(listStatusesMock.handler, deleteStatusMock.handler)

        const { result } = renderHook(() => ({
            deleteStatus: useDeleteCustomUserAvailabilityStatus(),
            customStatuses: useListCustomUserAvailabilityStatuses(),
        }))

        await waitFor(() => {
            expect(
                result.current.customStatuses.data?.data.data.map(
                    ({ id }) => id,
                ),
            ).toEqual(['status-1', 'status-2'])
        })

        let mutationPromise: Promise<unknown> | undefined
        act(() => {
            mutationPromise = result.current.deleteStatus.mutateAsync({
                pk: 'status-1',
            })
        })

        await waitFor(() => {
            expect(
                result.current.customStatuses.data?.data.data.map(
                    ({ id }) => id,
                ),
            ).toEqual(['status-2'])
        })

        resolveDeleteRequest?.()
        await mutationPromise
        await waitForDeleteRequest(() => undefined)

        await waitFor(() => {
            expect(
                result.current.customStatuses.data?.data.data.map(
                    ({ id }) => id,
                ),
            ).toEqual(['status-2'])
        })
    })

    it('rolls back the list when deleting a status fails', async () => {
        const firstStatus = mockCustomUserAvailabilityStatus({
            id: 'status-1',
            name: 'Lunch break',
        })
        const secondStatus = mockCustomUserAvailabilityStatus({
            id: 'status-2',
            name: 'Coffee break',
        })

        const statuses = [firstStatus, secondStatus]
        let resolveDeleteRequest: (() => void) | undefined
        const deleteRequestCompleted = new Promise<void>((resolve) => {
            resolveDeleteRequest = resolve
        })

        const listStatusesMock = mockListCustomUserAvailabilityStatusesHandler(
            async ({ data }) =>
                HttpResponse.json({
                    ...data,
                    data: statuses,
                }),
        )
        const deleteStatusMock = mockDeleteCustomUserAvailabilityStatusHandler(
            async () => {
                await deleteRequestCompleted

                return HttpResponse.json(
                    {
                        error: {
                            msg: 'Failed to delete status',
                        },
                    } as any,
                    { status: 500 },
                )
            },
        )

        server.use(listStatusesMock.handler, deleteStatusMock.handler)

        const { result } = renderHook(() => ({
            deleteStatus: useDeleteCustomUserAvailabilityStatus(),
            customStatuses: useListCustomUserAvailabilityStatuses(),
        }))

        await waitFor(() => {
            expect(
                result.current.customStatuses.data?.data.data.map(
                    ({ id }) => id,
                ),
            ).toEqual(['status-1', 'status-2'])
        })

        let mutationPromise: Promise<unknown> | undefined
        act(() => {
            mutationPromise = result.current.deleteStatus.mutateAsync({
                pk: 'status-1',
            })
        })

        await waitFor(() => {
            expect(
                result.current.customStatuses.data?.data.data.map(
                    ({ id }) => id,
                ),
            ).toEqual(['status-2'])
        })

        resolveDeleteRequest?.()
        await expect(mutationPromise).rejects.toThrow()

        await waitFor(() => {
            expect(
                result.current.customStatuses.data?.data.data.map(
                    ({ id }) => id,
                ),
            ).toEqual(['status-1', 'status-2'])
        })
    })
})
