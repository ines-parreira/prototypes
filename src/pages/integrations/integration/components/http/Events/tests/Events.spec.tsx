import React from 'react'
import {QueryClientProvider, UseQueryResult} from '@tanstack/react-query'
import {render, screen} from '@testing-library/react'

import {assumeMock} from 'utils/testing'
import {HttpMethod} from 'models/api/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {HTTPIntegrationEvent} from 'models/integration/types'
import {useGetHTTPEvents} from 'models/integration/queries/http'

import Events from '../Events'

jest.mock('models/integration/queries/http')
jest.mock('pages/common/utils/DatetimeLabel', () => () => null)

const mockUseGetHTTPEvents = assumeMock(useGetHTTPEvents)

const queryClient = mockQueryClient()

const INTEGRATION_ID = 1

const mockEvents: HTTPIntegrationEvent[] = [
    {
        id: '1',
        integration_id: INTEGRATION_ID,
        created_datetime: '2021-08-01T00:00:00Z',
        request: {
            method: HttpMethod.Get,
            url: 'https://example.com',
        },
        response: {
            body: '',
            headers: {},
        },
        status_code: 200,
    },
    {
        id: '2',
        integration_id: INTEGRATION_ID,
        created_datetime: '2021-08-02T00:00:00Z',
        request: {
            method: HttpMethod.Get,
            url: 'https://example.com',
        },
        response: {
            body: '',
            headers: {},
        },
        status_code: 500,
    },
]

describe('Events', () => {
    afterEach(() => {
        jest.resetAllMocks()
    })

    it('renders the events', () => {
        mockUseGetHTTPEvents.mockReturnValue({
            data: mockEvents,
            isLoading: false,
            isError: false,
        } as unknown as UseQueryResult)

        render(
            <QueryClientProvider client={queryClient}>
                <Events integrationId={INTEGRATION_ID.toString()} />
            </QueryClientProvider>
        )

        expect(mockUseGetHTTPEvents).toHaveBeenCalledWith(
            INTEGRATION_ID,
            expect.any(Object)
        )

        expect(screen.getAllByText('https://example.com'))
        expect(screen.getByText(/200/))
        expect(screen.getByText(/500/))
    })

    it('renders the loading state', () => {
        mockUseGetHTTPEvents.mockReturnValue({
            data: undefined,
            isLoading: true,
            isError: false,
        } as unknown as UseQueryResult)

        render(
            <QueryClientProvider client={queryClient}>
                <Events integrationId={INTEGRATION_ID.toString()} />
            </QueryClientProvider>
        )

        expect(screen.getByTestId('loader'))
    })

    it('renders the error state', () => {
        mockUseGetHTTPEvents.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
        } as unknown as UseQueryResult)

        render(
            <QueryClientProvider client={queryClient}>
                <Events integrationId={INTEGRATION_ID.toString()} />
            </QueryClientProvider>
        )

        expect(screen.getByText(/An error occurred/))
    })

    it('renders the no logs message', () => {
        mockUseGetHTTPEvents.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
        } as unknown as UseQueryResult)

        render(
            <QueryClientProvider client={queryClient}>
                <Events integrationId={INTEGRATION_ID.toString()} />
            </QueryClientProvider>
        )

        expect(screen.getByText(/no logs/))
    })
})
