import React from 'react'
import {QueryClientProvider, UseQueryResult} from '@tanstack/react-query'
import {render, screen} from '@testing-library/react'

import {assumeMock} from 'utils/testing'
import {ContentType, HttpMethod} from 'models/api/types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {HTTPIntegrationEvent} from 'models/integration/types'
import {useGetHTTPEvent} from 'models/integration/queries/http'
import Events from '../Event'

jest.mock('models/integration/queries/http')
jest.mock('pages/common/utils/DatetimeLabel', () => () => null)

const mockUseGetHTTPEvent = assumeMock(useGetHTTPEvent)

const queryClient = mockQueryClient()

const INTEGRATION_ID = 1
const EVENT_ID = 1

const mockEvent: HTTPIntegrationEvent = {
    id: EVENT_ID.toString(),
    integration_id: INTEGRATION_ID,
    created_datetime: '2021-08-01T00:00:00Z',
    request: {
        method: HttpMethod.Get,
        url: 'https://example.com',
    },
    response: {
        body: '{"baz": "qux"}',
        headers: {
            'Content-Type': ContentType.Json,
        },
    },
    status_code: 200,
}

describe('Event', () => {
    afterEach(() => {
        jest.resetAllMocks()
    })

    it('should render', () => {
        mockUseGetHTTPEvent.mockReturnValue({
            data: mockEvent,
            isLoading: false,
            isError: false,
        } as unknown as UseQueryResult)

        const {container} = render(
            <QueryClientProvider client={queryClient}>
                <Events integrationId={INTEGRATION_ID} eventId={EVENT_ID} />
            </QueryClientProvider>
        )
        expect(mockUseGetHTTPEvent).toHaveBeenCalledWith(
            {eventId: EVENT_ID, integrationId: INTEGRATION_ID},
            expect.any(Object)
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a loader', () => {
        mockUseGetHTTPEvent.mockReturnValue({
            isLoading: true,
            isError: false,
        } as unknown as UseQueryResult)

        render(
            <QueryClientProvider client={queryClient}>
                <Events integrationId={INTEGRATION_ID} eventId={EVENT_ID} />
            </QueryClientProvider>
        )

        expect(screen.getByTestId('loader'))
    })

    it('should render an error if fetching event failed', () => {
        mockUseGetHTTPEvent.mockReturnValue({
            isLoading: false,
            isError: true,
        } as unknown as UseQueryResult)

        render(
            <QueryClientProvider client={queryClient}>
                <Events integrationId={INTEGRATION_ID} eventId={EVENT_ID} />
            </QueryClientProvider>
        )

        expect(screen.getByText(/An error occurred/))
    })

    it('should render an error if there is no request in the event', () => {
        mockUseGetHTTPEvent.mockReturnValue({
            data: {...mockEvent, request: undefined},
            isLoading: false,
            isError: false,
        } as unknown as UseQueryResult)

        render(
            <QueryClientProvider client={queryClient}>
                <Events integrationId={INTEGRATION_ID} eventId={EVENT_ID} />
            </QueryClientProvider>
        )

        expect(screen.getByText(/error occurred before/))
    })

    it('should display a specific error if no status code is returned', () => {
        mockUseGetHTTPEvent.mockReturnValue({
            data: {
                ...mockEvent,
                response: {error: 'welp'},
                status_code: undefined,
            },
            isLoading: false,
            isError: false,
        } as unknown as UseQueryResult)

        render(
            <QueryClientProvider client={queryClient}>
                <Events integrationId={INTEGRATION_ID} eventId={EVENT_ID} />
            </QueryClientProvider>
        )

        expect(screen.getByText(/There was an error while/))
        expect(screen.getByText(/welp/))
    })

    it('should render a parsed object if request param is a string => JSON Params', () => {
        mockUseGetHTTPEvent.mockReturnValue({
            data: {
                ...mockEvent,
                request: {...mockEvent.request, params: '{"foo": "bar"}'},
            },
            isLoading: false,
            isError: false,
        } as unknown as UseQueryResult)

        render(
            <QueryClientProvider client={queryClient}>
                <Events integrationId={INTEGRATION_ID} eventId={EVENT_ID} />
            </QueryClientProvider>
        )
        expect(screen.getByText(/Params are not compatible/))
        expect(screen.getByText(/"foo":/))
    })

    it('should render a param list if param is an object => Form Params', () => {
        mockUseGetHTTPEvent.mockReturnValue({
            data: {
                ...mockEvent,
                request: {...mockEvent.request, params: {foo: 'bar'}},
            },
            isLoading: false,
            isError: false,
        } as unknown as UseQueryResult)

        render(
            <QueryClientProvider client={queryClient}>
                <Events integrationId={INTEGRATION_ID} eventId={EVENT_ID} />
            </QueryClientProvider>
        )
        expect(screen.getByText(/Params/))
        expect(screen.getByText(/foo:/))
    })

    it('should render a parsed object if request body is a string => JSON Body', () => {
        mockUseGetHTTPEvent.mockReturnValue({
            data: {
                ...mockEvent,
                request: {...mockEvent.request, body: '{"foo": "bar"}'},
            },
            isLoading: false,
            isError: false,
        } as unknown as UseQueryResult)

        render(
            <QueryClientProvider client={queryClient}>
                <Events integrationId={INTEGRATION_ID} eventId={EVENT_ID} />
            </QueryClientProvider>
        )
        expect(screen.getByText(/"foo":/))
    })

    it('should render a body list if body is an object => Form Body', () => {
        mockUseGetHTTPEvent.mockReturnValue({
            data: {
                ...mockEvent,
                request: {...mockEvent.request, body: {foo: 'bar'}},
            },
            isLoading: false,
            isError: false,
        } as unknown as UseQueryResult)

        render(
            <QueryClientProvider client={queryClient}>
                <Events integrationId={INTEGRATION_ID} eventId={EVENT_ID} />
            </QueryClientProvider>
        )
        expect(screen.getByText(/foo:/))
    })

    it('should says response body is empty', () => {
        mockUseGetHTTPEvent.mockReturnValue({
            data: {
                ...mockEvent,
                response: {...mockEvent.response, body: ''},
            },
            isLoading: false,
            isError: false,
        } as unknown as UseQueryResult)

        render(
            <QueryClientProvider client={queryClient}>
                <Events integrationId={INTEGRATION_ID} eventId={EVENT_ID} />
            </QueryClientProvider>
        )
        expect(screen.getByText(/empty/))
    })
})
