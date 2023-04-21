import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import React from 'react'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {
    GORGIAS_CHAT_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from 'constants/integration'
import {entitiesInitialState} from 'fixtures/entities'
import {RootState, StoreDispatch} from 'state/types'
import GorgiasChatIntegrationNavigation from '../GorgiasChatIntegrationNavigation'

describe('<GorgiasChatIntegrationNavigation />', () => {
    const integration = {
        id: 16,
        name: 'myChat1',
        type: GORGIAS_CHAT_INTEGRATION_TYPE,
        meta: {
            shop_name: 'myStore1',
            shop_type: SHOPIFY_INTEGRATION_TYPE,
        },
    }

    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
    const store = mockStore({entities: entitiesInitialState})

    const storeInstallationIssue = mockStore({
        entities: {
            ...entitiesInitialState,
            chatInstallationStatus: {
                installed: false,
                minimumSnippetVersion: null,
            },
        },
    })

    it('should render GorgiasChatIntegrationNavigation', () => {
        const {container} = render(
            <Provider store={store}>
                <GorgiasChatIntegrationNavigation
                    integration={fromJS(integration)}
                ></GorgiasChatIntegrationNavigation>
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should render GorgiasChatIntegrationNavigation with an installation issue icon', () => {
        const {container} = render(
            <Provider store={storeInstallationIssue}>
                <GorgiasChatIntegrationNavigation
                    integration={fromJS(integration)}
                ></GorgiasChatIntegrationNavigation>
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })
})
