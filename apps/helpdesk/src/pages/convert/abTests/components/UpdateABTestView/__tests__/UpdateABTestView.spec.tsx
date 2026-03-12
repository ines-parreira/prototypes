import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import type * as ReactRouterDom from 'react-router-dom'
import { useParams } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { abTest } from 'fixtures/abTest'
import { account } from 'fixtures/account'
import { channelConnection } from 'fixtures/channelConnection'
import { entitiesInitialState } from 'fixtures/entities'
import { integrationsState } from 'fixtures/integrations'
import { useListABTests, useUpdateABTest } from 'models/convert/abTest/queries'
import { useGetOrCreateChannelConnection } from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import UpdateABTestView from '../UpdateABTestView'

jest.mock('models/convert/abTest/queries')
const useListABTestMock = assumeMock(useListABTests)
const useUpdateABTestMock = assumeMock(useUpdateABTest)

jest.mock('react-router-dom', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
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

const updateFnMock: jest.Mock = jest.fn()

describe('<UpdateABTestView/>', () => {
    const defaultState = {
        entities: entitiesInitialState,
        integrations: fromJS(integrationsState),
        currentAccount: fromJS(account),
    } as RootState

    const renderComponent = () => {
        return renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore(defaultState)}>
                    <UpdateABTestView />
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

        useUpdateABTestMock.mockImplementation(() => {
            return {
                mutateAsync: updateFnMock,
            } as unknown as ReturnType<typeof useUpdateABTest>
        })
    })

    afterEach(() => {
        updateFnMock.mockRestore()
    })

    it('do not render A/B test update button, there is no ongoing A/B test', () => {
        useListABTestMock.mockReturnValue({
            data: [],
            isLoading: false,
            isError: false,
            refetch: jest.fn,
        } as any)

        renderComponent()
        expect(screen.getByText('First run A/B Test')).toBeInTheDocument()
    })

    it('renders A/B test update button', () => {
        useListABTestMock.mockReturnValue({
            data: [abTest],
            isLoading: false,
            isError: false,
            refetch: jest.fn,
        } as any)

        renderComponent()
        const updateButton = screen.getByText('Update Report Link')

        expect(updateButton).toBeInTheDocument()

        act(() => {
            fireEvent.click(updateButton)
        })

        const saveButton = screen.getByText('Save changes')

        expect(saveButton).toBeInTheDocument()

        act(() => {
            fireEvent.change(screen.getByLabelText('Report link'), {
                target: { value: 'https://example.com' },
            })
        })

        act(() => {
            fireEvent.click(saveButton)
        })

        expect(updateFnMock).toHaveBeenCalledTimes(1)
    })
})
