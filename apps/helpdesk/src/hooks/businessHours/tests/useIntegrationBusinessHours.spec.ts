import { waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import {
    mockGetBusinessHoursDetailsHandler,
    mockListAccountSettingsHandler,
    mockListAccountSettingsResponse,
} from '@gorgias/helpdesk-mocks'
import type { BusinessHoursDetails } from '@gorgias/helpdesk-queries'

import { renderHookWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import { useIntegrationBusinessHours } from '../useIntegrationBusinessHours'

// Mock business hours data
const server = setupServer()
beforeAll(() => {
    server.listen()
})

afterAll(() => {
    server.close()
})

const mockCustomBusinessHours = {
    id: 123,
    name: 'Test Business Hours',
    business_hours_config: {
        business_hours: [
            {
                days: '1',
                from_time: '10:00',
                to_time: '19:00',
            },
        ],
        timezone: 'America/New_York',
    },
} as BusinessHoursDetails

beforeEach(() => {
    const mockListAccountSettings = mockListAccountSettingsHandler()
    const mockGetBusinessHours = mockGetBusinessHoursDetailsHandler(async () =>
        HttpResponse.json(mockCustomBusinessHours),
    )

    server.use(mockListAccountSettings.handler)
    server.use(mockGetBusinessHours.handler)
})

afterEach(() => {
    server.resetHandlers()
})

describe('useIntegrationBusinessHours', () => {
    it('should fetch business hours details with the provided ID', async () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useIntegrationBusinessHours(123),
        )

        await waitFor(() => {
            expect(result.current.businessHours).toEqual(
                mockCustomBusinessHours.business_hours_config,
            )
            expect(result.current.name).toBe(mockCustomBusinessHours.name)
        })
    })

    it('should fetch account business hours without provided ID', async () => {
        const { result } = renderHookWithQueryClientProvider(() =>
            useIntegrationBusinessHours(null),
        )

        await waitFor(() => {
            expect(result.current.name).toEqual('Default')
            expect(result.current.businessHours).toEqual(
                mockListAccountSettingsResponse().data[0].data,
            )
        })
    })
})
