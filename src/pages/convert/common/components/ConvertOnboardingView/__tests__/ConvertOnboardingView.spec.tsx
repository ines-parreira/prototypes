import React from 'react'

import {QueryClientProvider} from '@tanstack/react-query'
import routerDom, {useParams} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {waitFor} from '@testing-library/react'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import history from 'pages/history'
import {convertBundle} from 'fixtures/convertBundle'
import {assumeMock, renderWithRouter} from 'utils/testing'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import {channelConnection} from 'fixtures/channelConnection'
import {useListBundles} from 'models/convert/bundle/queries'
import {useGetOrCreateChannelConnection} from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import ConvertOnboardingView from '../ConvertOnboardingView'

const queryClient = mockQueryClient()

const mockStore = configureMockStore()

const defaultState = {
    integrations: fromJS({
        integrations: [
            {id: 123, type: 'gorgias_chat', meta: {shop_integration_id: 234}},
            {id: 234, type: 'shopify'},
        ],
    }),
}

jest.mock('react-router-dom', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    ...(jest.requireActual('react-router-dom') as typeof routerDom),
    useParams: jest.fn(),
}))

jest.mock('models/convert/bundle/queries')
const useListBundlesMock = assumeMock(useListBundles)

jest.mock('pages/convert/common/hooks/useGetOrCreateChannelConnection')
const useGetOrCreateChannelConnectionMock = assumeMock(
    useGetOrCreateChannelConnection
)

jest.mock('pages/settings/revenue/hooks/useRevenueAddonApi', () => ({
    useRevenueAddonApi: jest.fn(() => ({
        client: jest.fn(),
    })),
}))

let useIsConvertSubscriberMock: jest.SpyInstance

describe('<ConvertOnboardingView />', () => {
    const mockUseIsConvertSubscriber = (isConvertSubscriber: boolean) => {
        useIsConvertSubscriberMock = jest
            .spyOn(isConvertSubscriberHook, 'useIsConvertSubscriber')
            .mockImplementation(() => isConvertSubscriber)
    }

    beforeEach(() => {
        queryClient.clear()
    })

    afterEach(() => {
        useIsConvertSubscriberMock.mockRestore()
    })

    it.each([
        [true, 3],
        [false, 2],
    ])(
        'redirects to campaigns page when onboarding is done',
        async (isSubscriber, completedSteps) => {
            // Mock useParams
            ;(useParams as jest.Mock).mockReturnValue({id: '123'})

            // Mock useGetOrCreateChannelConnection
            useGetOrCreateChannelConnectionMock.mockReturnValue({
                channelConnection: {
                    ...channelConnection,
                    is_onboarded: true,
                    is_setup: true,
                },
            } as any)

            // Mock useIsConvertSubscriber
            mockUseIsConvertSubscriber(isSubscriber)

            // Mock useListBundles
            useListBundlesMock.mockReturnValue({
                data: [convertBundle],
            } as any)

            const spy = jest.spyOn(history, 'push')

            const {getAllByTestId, queryByText} = renderWithRouter(
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(defaultState)}>
                        <ConvertOnboardingView />
                    </Provider>
                </QueryClientProvider>
            )

            expect(getAllByTestId('completed-icon').length).toBe(completedSteps)

            // Ensure redirection happens
            await waitFor(() => {
                expect(spy.mock.calls).toEqual([['/app/convert/123/campaigns']])
            })

            const button = 'Get started with campaigns'
            if (isSubscriber) {
                expect(queryByText(button)).not.toBeInTheDocument()
            } else {
                expect(queryByText(button)).toBeInTheDocument()
            }
        }
    )
})
