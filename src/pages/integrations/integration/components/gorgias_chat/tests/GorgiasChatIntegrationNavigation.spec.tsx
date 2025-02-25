import React from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {
    GORGIAS_CHAT_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from 'constants/integration'
import { entitiesInitialState } from 'fixtures/entities'
import { getHasAutomate } from 'state/billing/selectors'
import { RootState, StoreDispatch } from 'state/types'

import GorgiasChatIntegrationNavigation from '../GorgiasChatIntegrationNavigation'

jest.mock('../GorgiasChatIntegrationConnectedChannel', () => () => {
    return <div data-testid="GorgiasChatIntegrationConnectedChannel" />
})

jest.mock('state/billing/selectors', () => ({
    __esModule: true,
    getHasAutomate: jest.fn(),
}))

jest.mock('launchdarkly-react-client-sdk')
jest.mock('pages/automate/common/hooks/useStoreIntegrations', () => ({
    __esModule: true,
    default: () => [
        {
            id: 1,
            type: 'shopType',
            name: 'shopName',
        },
    ],
}))

const mockGetHasAutomate = jest.mocked(getHasAutomate)

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
    const store = mockStore({ entities: entitiesInitialState })

    const storeInstallationIssue = mockStore({
        entities: {
            ...entitiesInitialState,
            chatInstallationStatus: {
                installed: false,
                installedOnShopifyCheckout: false,
                minimumSnippetVersion: null,
            },
        },
    })

    it('should render automate tab', () => {
        mockGetHasAutomate.mockReturnValue(true)
        render(
            <Provider store={store}>
                <GorgiasChatIntegrationNavigation
                    integration={fromJS(integration)}
                ></GorgiasChatIntegrationNavigation>
            </Provider>,
        )
        expect(screen.getByText('Automate')).toBeInTheDocument()
    })

    it('should not render automate tab', () => {
        mockGetHasAutomate.mockReturnValue(false)
        render(
            <Provider store={store}>
                <GorgiasChatIntegrationNavigation
                    integration={fromJS(integration)}
                ></GorgiasChatIntegrationNavigation>
            </Provider>,
        )
        expect(screen.queryByText('Automate')).not.toBeInTheDocument()
    })

    it('should render GorgiasChatIntegrationNavigation', () => {
        const { container } = render(
            <Provider store={store}>
                <GorgiasChatIntegrationNavigation
                    integration={fromJS(integration)}
                ></GorgiasChatIntegrationNavigation>
            </Provider>,
        )

        expect(container).toMatchSnapshot()
    })

    it('should render GorgiasChatIntegrationNavigation with an installation issue icon', () => {
        const { container } = render(
            <Provider store={storeInstallationIssue}>
                <GorgiasChatIntegrationNavigation
                    integration={fromJS(integration)}
                ></GorgiasChatIntegrationNavigation>
            </Provider>,
        )

        expect(container).toMatchSnapshot()
    })
})
