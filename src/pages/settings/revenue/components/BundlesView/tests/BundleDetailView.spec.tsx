import React from 'react'
import {MemoryRouter} from 'react-router-dom'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'

import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {render, waitFor} from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import {QueryClientProvider} from '@tanstack/react-query'
import {IntegrationType} from 'models/integration/types'

import client from 'models/api/resources'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {BundleDetailView} from '../BundleDetailView'

const queryClient = mockQueryClient()

const mockStore = configureMockStore([thunk])

const mockedServer = new MockAdapter(client)

const defaultState = {
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: IntegrationType.Shopify,
                name: 'My shopify store',
            },
        ],
    }),
}

jest.mock('pages/settings/revenue/hooks/useRevenueAddonApi', () => {
    return {
        useRevenueAddonApi: jest.fn().mockReturnValue({
            isReady: true,
            client: {
                get_bundle_installation: () =>
                    Promise.resolve({
                        data: {
                            id: 'ac424a3d-be3f-4b15-9a17-880875db3bdd',
                            account_id: 1,
                            shop_integration_id: 1,
                            status: 'installed',
                            config: {},
                            created_datetime: '2023-05-19T15:13:28.573231',
                            deactivated_datetime: null,
                            bundle_url: 'https://test.com/loader.js',
                        },
                        status: 200,
                    }),
            },
        }),
    }
})

describe('<BundleDetailView />', () => {
    afterEach(() => {
        mockedServer.reset()
    })

    beforeEach(() => {
        queryClient.clear()
    })

    it('show bundle details', async () => {
        const {getByText} = render(
            <MemoryRouter>
                <QueryClientProvider client={queryClient}>
                    <Provider store={mockStore(defaultState)}>
                        <BundleDetailView />
                    </Provider>
                </QueryClientProvider>
            </MemoryRouter>
        )

        await waitFor(() => {
            getByText('My shopify store', {selector: 'li'})
        })
    })
})
