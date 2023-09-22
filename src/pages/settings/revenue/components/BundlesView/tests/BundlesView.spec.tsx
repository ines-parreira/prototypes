import React from 'react'
import {MemoryRouter} from 'react-router-dom'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'

import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {render, waitFor} from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import {IntegrationType} from 'models/integration/types'

import client from 'models/api/resources'
import * as isConvertSubscriberHook from 'pages/common/hooks/useIsConvertSubscriber'
import {BundlesView} from '../BundlesView'

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
            {
                id: 2,
                type: IntegrationType.Shopify,
                name: 'Your shopify store',
            },
            {
                id: 3,
                type: IntegrationType.Shopify,
                name: 'Our shopify store',
            },
        ],
    }),
}

jest.mock('pages/settings/revenue/hooks/useRevenueAddonApi', () => {
    return {
        useRevenueAddonApi: jest.fn().mockReturnValue({
            isReady: true,
            client: {
                list_bundle_installation: () =>
                    Promise.resolve({
                        data: [
                            {
                                id: 'ac424a3d-be3f-4b15-9a17-880875db3bdd',
                                account_id: 1,
                                shop_integration_id: 1,
                                status: 'installed',
                                config: {},
                                created_datetime: '2023-05-19T15:13:28.573231',
                                deactivated_datetime: null,
                                bundle_url: 'https://test.com/loader.js',
                            },
                            {
                                id: 'bc424a3d-be3f-4b15-9a17-880875db3bdd',
                                account_id: 1,
                                shop_integration_id: 2,
                                status: 'installed',
                                config: {},
                                created_datetime: '2023-05-19T15:13:28.573231',
                                deactivated_datetime: null,
                                bundle_url: 'https://test.com/loader.js',
                            },
                        ],
                        status: 200,
                    }),
            },
        }),
    }
})

describe('<BundlesView />', () => {
    beforeEach(() => {
        jest.spyOn(
            isConvertSubscriberHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)
    })

    afterEach(() => {
        mockedServer.reset()
    })

    it('show list of integrations', async () => {
        const {getByText} = render(
            <MemoryRouter>
                <Provider store={mockStore(defaultState)}>
                    <BundlesView />
                </Provider>
            </MemoryRouter>
        )

        await waitFor(() => {
            getByText('My shopify store')
            getByText('Your shopify store')
        })
    })
})
