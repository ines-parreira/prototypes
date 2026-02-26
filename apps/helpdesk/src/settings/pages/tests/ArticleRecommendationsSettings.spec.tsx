import React from 'react'

import { assumeMock } from '@repo/testing'
import { UserRole } from '@repo/utils'
import { screen } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import { Route, StaticRouter } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { user } from 'fixtures/users'
import type { StoreIntegration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import { useIsArticleRecommendationsEnabledWhileSunset } from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset'
import { useStoreSelector } from 'settings/automate'
import type { RootState, StoreDispatch } from 'state/types'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

import {
    ArticleRecommendationsSettings,
    BASE_PATH,
} from '../ArticleRecommendationsSettings'

jest.mock('settings/automate', () => ({
    ...jest.requireActual('settings/automate'),
    useStoreSelector: jest.fn(),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useIsArticleRecommendationsEnabledWhileSunset',
    () => ({
        useIsArticleRecommendationsEnabledWhileSunset: jest.fn(),
    }),
)

jest.mock(
    'pages/automate/articleRecommendation/ArticleRecommendationView',
    () => ({
        __esModule: true,
        default: () => <div>Article Recommendation View</div>,
    }),
)

jest.mock('../flows-routes/AutomateSettingsFlowsChannelsRoute', () => ({
    AutomateSettingsChannelsRoute: () => <div>Channels Route</div>,
}))

jest.mock('pages/common/components/StoreSelector/StoreSelector', () => ({
    __esModule: true,
    default: ({ integrations }: { integrations: StoreIntegration[] }) => (
        <div data-testid="store-selector">
            {integrations.map((integration) => (
                <div
                    key={integration.id}
                    data-testid={`integration-${integration.type}`}
                >
                    {integration.name}
                </div>
            ))}
        </div>
    ),
}))

const useStoreSelectorMock = assumeMock(useStoreSelector)
const useIsArticleRecommendationsEnabledWhileSunsetMock = assumeMock(
    useIsArticleRecommendationsEnabledWhileSunset,
)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const initialState = {
    currentAccount: Map({
        id: 12345,
    }),
    integrations: fromJS({
        integrations: [],
    }),
    billing: fromJS({
        products: [],
    }),
    currentUser: fromJS({
        ...user,
        role: {
            name: UserRole.Agent,
        },
    }),
}

describe('ArticleRecommendationsSettings', () => {
    const shopifyIntegration = {
        id: 1,
        type: IntegrationType.Shopify,
        name: 'my-shopify-store',
        meta: {},
    } as StoreIntegration

    const bigCommerceIntegration = {
        id: 2,
        type: IntegrationType.BigCommerce,
        name: 'my-bigcommerce-store',
        meta: {},
    } as StoreIntegration

    const magentoIntegration = {
        id: 3,
        type: IntegrationType.Magento2,
        name: 'my-magento-store',
        meta: {},
    } as StoreIntegration

    const allIntegrations = [
        shopifyIntegration,
        bigCommerceIntegration,
        magentoIntegration,
    ]

    let onChange: jest.Mock

    beforeEach(() => {
        onChange = jest.fn()
        useStoreSelectorMock.mockImplementation((basePath, types) => {
            const filteredIntegrations = types
                ? allIntegrations.filter((integration) =>
                      types.includes(integration.type),
                  )
                : allIntegrations

            return {
                integrations: filteredIntegrations,
                onChange,
                selected: undefined,
            }
        })
    })

    describe('when article recommendation is enabled in settings', () => {
        beforeEach(() => {
            useIsArticleRecommendationsEnabledWhileSunsetMock.mockReturnValue({
                enabledInSettings: true,
                enabledInStatistics: true,
            })
        })

        it('should not filter store integrations - show all integrations', () => {
            renderWithQueryClientProvider(
                <Provider store={mockStore(initialState)}>
                    <StaticRouter location={BASE_PATH}>
                        <Route path={`${BASE_PATH}/:shopType?/:shopName?`}>
                            <ArticleRecommendationsSettings />
                        </Route>
                    </StaticRouter>
                </Provider>,
            )

            // Check that StoreSelector receives all integrations
            const storeSelector = screen.getByTestId('store-selector')
            expect(storeSelector).toBeInTheDocument()

            // Verify all integrations are shown
            expect(
                screen.getByTestId('integration-shopify'),
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('integration-bigcommerce'),
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('integration-magento2'),
            ).toBeInTheDocument()
        })
    })

    describe('when article recommendation is not enabled in settings', () => {
        beforeEach(() => {
            useIsArticleRecommendationsEnabledWhileSunsetMock.mockReturnValue({
                enabledInSettings: false,
                enabledInStatistics: false,
            })
        })

        it('should show only non-Shopify store integrations', () => {
            renderWithQueryClientProvider(
                <Provider store={mockStore(initialState)}>
                    <StaticRouter location={BASE_PATH}>
                        <Route path={`${BASE_PATH}/:shopType?/:shopName?`}>
                            <ArticleRecommendationsSettings />
                        </Route>
                    </StaticRouter>
                </Provider>,
            )

            // Check that only non-Shopify integrations are shown
            const storeSelector = screen.getByTestId('store-selector')
            expect(storeSelector).toBeInTheDocument()

            // Verify Shopify is NOT shown
            expect(
                screen.queryByTestId('integration-shopify'),
            ).not.toBeInTheDocument()

            // Verify only BigCommerce and Magento are shown
            expect(
                screen.getByTestId('integration-bigcommerce'),
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('integration-magento2'),
            ).toBeInTheDocument()
        })
    })
})
