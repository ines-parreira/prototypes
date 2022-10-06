import React, {ComponentProps} from 'react'
import {mount} from 'enzyme'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    SHOPIFY_INTEGRATION_TYPE,
    SMOOCH_INSIDE_INTEGRATION_TYPE,
} from 'constants/integration'
import {RootState} from 'state/types'

import ChatIntegrationInstall from '../ChatIntegrationInstall'

jest.mock(
    'pages/integrations/common/components/InstallOnIntegrationsCard/InstallOnIntegrationsCard',
    () => () => <div>InstallOnIntegrationsCard</div>
)

describe('ChatIntegrationInstall component', () => {
    const minStore: Partial<RootState> = {
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
    }
    const mockStore = configureMockStore<Partial<RootState>>([thunk])

    const store = mockStore(minStore)
    const minProps: ComponentProps<typeof ChatIntegrationInstall> = {
        integration: fromJS({}),
    }

    it('should display the list of Shopify stores with the toggle checked or not depending on the installation status', () => {
        const component = mount(
            <Provider store={store}>
                <ChatIntegrationInstall
                    {...minProps}
                    integration={fromJS({
                        id: 2,
                        name: 'mychat',
                        type: SMOOCH_INSIDE_INTEGRATION_TYPE,
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
