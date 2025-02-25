import React from 'react'

import { QueryClientProvider, UseQueryResult } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { ContentType, HttpMethod } from 'models/api/types'
import { useGetHTTPEvent } from 'models/integration/queries/http'
import { HTTPIntegrationEvent } from 'models/integration/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

import Events from '../Event'

jest.mock('models/integration/queries/http')
jest.mock('pages/common/utils/DatetimeLabel', () => () => null)

const mockUseGetHTTPEvent = assumeMock(useGetHTTPEvent)

const queryClient = mockQueryClient()

const INTEGRATION_ID = 1
const EVENT_ID = 1

const mockEvent = {
    data: {
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
    } as HTTPIntegrationEvent,
    isLoading: false,
    isError: false,
}

describe('Event', () => {
    afterEach(() => {
        jest.resetAllMocks()
    })

    it('should retrieve data when calling useGetHTTPEvent override function', () => {
        mockUseGetHTTPEvent.mockReturnValue(
            mockEvent as unknown as UseQueryResult,
        )
        render(
            <QueryClientProvider client={queryClient}>
                <Events integrationId={INTEGRATION_ID} eventId={EVENT_ID} />
            </QueryClientProvider>,
        )

        const objectWithDataKey =
            'this is a string' as unknown as HTTPIntegrationEvent
        const selectReturn = mockUseGetHTTPEvent.mock.calls[0][1]?.select!(
            axiosSuccessResponse(objectWithDataKey),
        )

        expect(selectReturn).toBe(objectWithDataKey)
    })

    it('should render', () => {
        mockUseGetHTTPEvent.mockReturnValue(
            mockEvent as unknown as UseQueryResult,
        )

        const { container } = render(
            <QueryClientProvider client={queryClient}>
                <Events integrationId={INTEGRATION_ID} eventId={EVENT_ID} />
            </QueryClientProvider>,
        )
        expect(mockUseGetHTTPEvent).toHaveBeenCalledWith(
            { eventId: EVENT_ID, integrationId: INTEGRATION_ID },
            expect.any(Object),
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
            </QueryClientProvider>,
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
            </QueryClientProvider>,
        )

        expect(screen.getByText(/An error occurred/))
    })

    it('should render an error if there is no request in the event', () => {
        mockUseGetHTTPEvent.mockReturnValue({
            data: { ...mockEvent.data, request: undefined },
            isLoading: false,
            isError: false,
        } as unknown as UseQueryResult)

        render(
            <QueryClientProvider client={queryClient}>
                <Events integrationId={INTEGRATION_ID} eventId={EVENT_ID} />
            </QueryClientProvider>,
        )

        expect(screen.getByText(/error occurred before/))
    })

    it('should display a specific error if no status code is returned', () => {
        mockUseGetHTTPEvent.mockReturnValue({
            data: {
                ...mockEvent.data,
                response: { error: 'welp' },
                status_code: undefined,
            },
            isLoading: false,
            isError: false,
        } as unknown as UseQueryResult)

        render(
            <QueryClientProvider client={queryClient}>
                <Events integrationId={INTEGRATION_ID} eventId={EVENT_ID} />
            </QueryClientProvider>,
        )

        expect(
            screen.getAllByText(/There was an error while making this request/),
        ).toHaveLength(1)
        expect(screen.getByText(/welp/))
    })

    it('should display a specific error and avoid repetition', () => {
        mockUseGetHTTPEvent.mockReturnValue({
            data: {
                ...mockEvent.data,
                response: {
                    error: 'There was an error while making this request.welp',
                },
                status_code: undefined,
            },
            isLoading: false,
            isError: false,
        } as unknown as UseQueryResult)

        render(
            <QueryClientProvider client={queryClient}>
                <Events integrationId={INTEGRATION_ID} eventId={EVENT_ID} />
            </QueryClientProvider>,
        )

        expect(
            screen.getAllByText(/There was an error while making this request/),
        ).toHaveLength(1)
        expect(screen.getByText(/welp/))
    })

    it('should render a parsed object if request param is a string => JSON Params', () => {
        mockUseGetHTTPEvent.mockReturnValue({
            data: {
                ...mockEvent.data,
                request: {
                    ...mockEvent.data.request,
                    params: '{"foo": "bar"}',
                },
            },
            isLoading: false,
            isError: false,
        } as unknown as UseQueryResult)

        render(
            <QueryClientProvider client={queryClient}>
                <Events integrationId={INTEGRATION_ID} eventId={EVENT_ID} />
            </QueryClientProvider>,
        )
        expect(screen.getByText(/Params are not compatible/))
        expect(screen.getByText(/"foo":/))
    })

    it('should render a param list if param is an object => Form Params', () => {
        mockUseGetHTTPEvent.mockReturnValue({
            data: {
                ...mockEvent.data,
                request: { ...mockEvent.data.request, params: { foo: 'bar' } },
            },
            isLoading: false,
            isError: false,
        } as unknown as UseQueryResult)

        render(
            <QueryClientProvider client={queryClient}>
                <Events integrationId={INTEGRATION_ID} eventId={EVENT_ID} />
            </QueryClientProvider>,
        )
        expect(screen.getByText(/Params/))
        expect(screen.getByText(/foo:/))
    })

    it('should render a parsed object if request body is a string => JSON Body', () => {
        mockUseGetHTTPEvent.mockReturnValue({
            data: {
                ...mockEvent.data,
                request: { ...mockEvent.data.request, body: '{"foo": "bar"}' },
            },
            isLoading: false,
            isError: false,
        } as unknown as UseQueryResult)

        render(
            <QueryClientProvider client={queryClient}>
                <Events integrationId={INTEGRATION_ID} eventId={EVENT_ID} />
            </QueryClientProvider>,
        )
        expect(screen.getByText(/"foo":/))
    })

    it('should render a body list if body is an object => Form Body', () => {
        mockUseGetHTTPEvent.mockReturnValue({
            data: {
                ...mockEvent.data,
                request: { ...mockEvent.data.request, body: { foo: 'bar' } },
            },
            isLoading: false,
            isError: false,
        } as unknown as UseQueryResult)

        render(
            <QueryClientProvider client={queryClient}>
                <Events integrationId={INTEGRATION_ID} eventId={EVENT_ID} />
            </QueryClientProvider>,
        )
        expect(screen.getByText(/foo:/))
    })

    it('should says response body is empty', () => {
        mockUseGetHTTPEvent.mockReturnValue({
            data: {
                ...mockEvent.data,
                response: { ...mockEvent.data.response, body: '' },
            },
            isLoading: false,
            isError: false,
        } as unknown as UseQueryResult)

        render(
            <QueryClientProvider client={queryClient}>
                <Events integrationId={INTEGRATION_ID} eventId={EVENT_ID} />
            </QueryClientProvider>,
        )
        expect(screen.getByText(/empty/))
    })

    it('should says request is invalid', () => {
        mockUseGetHTTPEvent.mockReturnValue({
            data: {
                ...mockEvent.data,
                request: undefined,
            },
            isLoading: false,
            isError: false,
        } as unknown as UseQueryResult)

        render(
            <QueryClientProvider client={queryClient}>
                <Events integrationId={0} eventId={0} />
            </QueryClientProvider>,
        )
        expect(
            screen.getByText(
                /The following error occurred before we could send the request/,
            ),
        )
    })
})
