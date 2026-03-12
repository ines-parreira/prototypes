import React from 'react'

import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import type * as ReactRouterDom from 'react-router-dom'
import { useParams } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import RequestABTest from 'domains/reporting/pages/convert/components/RequestABTest/RequestABTest'
import { useCanRequestABTest } from 'domains/reporting/pages/convert/hooks/stats/useCanRequestABTest'
import { abTest } from 'fixtures/abTest'
import { account } from 'fixtures/account'
import { channelConnection } from 'fixtures/channelConnection'
import { entitiesInitialState } from 'fixtures/entities'
import { integrationsState } from 'fixtures/integrations'
import {
    useCreateABTest,
    useListABTests,
    useUpdateABTest,
} from 'models/convert/abTest/queries'
import { useGetOrCreateChannelConnection } from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

jest.mock('models/convert/abTest/queries')
const useListABTestMock = assumeMock(useListABTests)
const useCreateABTestMock = assumeMock(useCreateABTest)
const useUpdateABTestMock = assumeMock(useUpdateABTest)

jest.mock('domains/reporting/pages/convert/hooks/stats/useCanRequestABTest')
const useCanRequestABTestMock = assumeMock(useCanRequestABTest)

jest.mock('react-router-dom', () => ({
    ...(jest.requireActual('react-router-dom') as typeof ReactRouterDom),
    useParams: jest.fn(),
}))

const useParamsMock = useParams as jest.MockedFunction<typeof useParams>

const mockStore = configureMockStore<RootState, StoreDispatch>()

const queryClient = mockQueryClient()

jest.mock('pages/convert/common/hooks/useGetOrCreateChannelConnection')
const useGetOrCreateChannelConnectionMock = assumeMock(
    useGetOrCreateChannelConnection,
)

const createFnMock: jest.Mock = jest.fn()
const updateFnMock: jest.Mock = jest.fn()

describe('RequestABTest', () => {
    const defaultState = {
        entities: entitiesInitialState,
        integrations: fromJS(integrationsState),
        currentAccount: fromJS(account),
    } as RootState

    const renderComponent = () => {
        return renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <RequestABTest />
                </Provider>
            </QueryClientProvider>,
        )
    }

    beforeEach(() => {
        useParamsMock.mockReturnValue({
            integrationId: '1',
        })

        useGetOrCreateChannelConnectionMock.mockReturnValue({
            channelConnection: channelConnection,
        } as any)

        useCreateABTestMock.mockImplementation(() => {
            return {
                mutateAsync: createFnMock,
            } as unknown as ReturnType<typeof useCreateABTest>
        })

        useUpdateABTestMock.mockImplementation(() => {
            return {
                mutateAsync: updateFnMock,
            } as unknown as ReturnType<typeof useUpdateABTest>
        })
    })

    afterEach(() => {
        createFnMock.mockRestore()
        updateFnMock.mockRestore()
    })

    it('renders - request A/B Test button', () => {
        useListABTestMock.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            refetch: jest.fn,
        } as any)

        useCanRequestABTestMock.mockReturnValue({
            isFetching: false,
            canRequestABTest: true,
        } as any)

        const { getByText, getByTestId } = renderComponent()

        expect(getByText('Request A/B Test')).toBeInTheDocument()

        act(() => {
            fireEvent.click(getByTestId('request-ab-test-modal'))
        })

        expect(getByText('Start A test')).toBeInTheDocument()

        act(() => {
            fireEvent.click(getByTestId('request-test-button'))
        })

        expect(createFnMock).toHaveBeenCalledTimes(1)
        expect(updateFnMock).toHaveBeenCalledTimes(0)
    })

    it('renders - ongoing A/B Test button', () => {
        useListABTestMock.mockReturnValue({
            data: [abTest],
            isLoading: false,
            isError: false,
            refetch: jest.fn,
        } as any)

        // In case we have ongoing A/B test orders can drop
        useCanRequestABTestMock.mockReturnValue({
            isFetching: false,
            canRequestABTest: false,
        } as any)

        const { getByText, getByTestId } = renderComponent()

        expect(getByText('View ongoing A/B test')).toBeInTheDocument()

        act(() => {
            fireEvent.click(getByTestId('request-ab-test-modal'))
        })

        expect(getByText('Stop Test')).toBeInTheDocument()

        act(() => {
            fireEvent.click(getByTestId('stop-test-button'))
        })

        expect(createFnMock).toHaveBeenCalledTimes(0)
        expect(updateFnMock).toHaveBeenCalledTimes(1)
    })
})
