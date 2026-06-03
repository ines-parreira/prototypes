import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockCustomUserAvailabilityStatus,
    mockListCustomUserAvailabilityStatusesHandler,
    mockListUserAvailabilitiesHandler,
    mockListUserAvailabilitiesResponse,
    mockUserAvailability,
} from '@gorgias/helpdesk-mocks'

import { useAvailabilityCellAvailabilityData } from 'domains/reporting/pages/common/components/charts/TableStat/cells/hooks/useAvailabilityCellAvailabilityData'

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'warn' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('useAvailabilityCellAvailabilityData', () => {
    const userId = 123

    const customStatus = mockCustomUserAvailabilityStatus({
        id: 'custom-123',
        name: 'Lunch Break',
        duration_unit: 'minutes',
        duration_value: 30,
    })

    const availabilityListHandler = (
        availability: ReturnType<typeof mockUserAvailability>,
    ) =>
        mockListUserAvailabilitiesHandler(async () =>
            HttpResponse.json(
                mockListUserAvailabilitiesResponse({
                    data: [availability],
                    meta: {
                        prev_cursor: null,
                        next_cursor: null,
                        total_resources: 1,
                    },
                }),
            ),
        ).handler

    const customStatusesHandler = (
        data: ReturnType<typeof mockCustomUserAvailabilityStatus>[],
    ) =>
        mockListCustomUserAvailabilityStatusesHandler(async ({ data: body }) =>
            HttpResponse.json({ ...body, data }),
        ).handler

    describe('Standard status resolution', () => {
        it('should resolve a standard status from the availability list', async () => {
            server.use(
                availabilityListHandler(
                    mockUserAvailability({
                        user_id: userId,
                        user_status: 'available',
                    }),
                ),
                customStatusesHandler([]),
            )

            const { result } = renderHook(() =>
                useAvailabilityCellAvailabilityData({ userId }),
            )

            await waitFor(() => {
                expect(result.current.status?.id).toBe('available')
            })
        })
    })

    describe('Custom status resolution', () => {
        it('should resolve a custom status from the custom status list', async () => {
            server.use(
                availabilityListHandler(
                    mockUserAvailability({
                        user_id: userId,
                        user_status: 'custom',
                        custom_user_availability_status_id: customStatus.id,
                    }),
                ),
                customStatusesHandler([customStatus]),
            )

            const { result } = renderHook(() =>
                useAvailabilityCellAvailabilityData({ userId }),
            )

            await waitFor(() => {
                expect(result.current.status?.id).toBe(customStatus.id)
            })
            expect(result.current.status?.name).toBe('Lunch Break')
        })
    })
})
