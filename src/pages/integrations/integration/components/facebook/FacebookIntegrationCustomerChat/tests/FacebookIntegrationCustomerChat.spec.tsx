import React, {ComponentProps} from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {RootState, StoreDispatch} from 'state/types'

import {
    FACEBOOK_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from 'constants/integration'

import FacebookIntegrationCustomerChat from '../FacebookIntegrationCustomerChat'

jest.mock(
    'pages/integrations/common/components/InstallOnIntegrationsCard/InstallOnIntegrationsCard.tsx',
    () => () => <div>InstallOnIntegrationsCard</div>
)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('FacebookIntegrationCustomerChat component', () => {
    const minStore = mockStore({
        integrations: fromJS({
            integrations: [
                {
                    id: 1,
                    name: 'mylittleintegration',
                    type: SHOPIFY_INTEGRATION_TYPE,
                    created_datetime: '2018-01-01 00:00:00',
                },
                {
                    id: 3,
                    name: 'mylittleintegration2',
                    type: SHOPIFY_INTEGRATION_TYPE,
                    created_datetime: '2019-01-01 00:00:00',
                },
            ],
        }),
        currentAccount: fromJS({
            domain: 'acme',
        }),
    })

    const minProps: ComponentProps<typeof FacebookIntegrationCustomerChat> = {
        integration: fromJS({}),
    }

    it('should display the list of Shopify stores with the toggle checked or not depending on the installation status', () => {
        const component = mount(
            <Provider store={minStore}>
                <FacebookIntegrationCustomerChat
                    {...minProps}
                    integration={fromJS({
                        id: 2,
                        name: 'mychat',
                        type: FACEBOOK_INTEGRATION_TYPE,
                        meta: {
                            shopify_integration_ids: [3],
                            script_url: 'config.gorgias.io/foo/chat/bar',
                        },
                    })}
                />
            </Provider>
        )

        expect(component).toMatchSnapshot()
    })
})
