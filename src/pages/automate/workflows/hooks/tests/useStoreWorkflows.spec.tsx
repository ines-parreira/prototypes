import {QueryClientProvider} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'
import {fromJS} from 'immutable'
import React, {ComponentType, ReactChildren} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

// eslint-disable-next-line import/order
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {billingState} from 'fixtures/billing'
import {IntegrationType} from 'models/integration/constants'
import {selfServiceConfigurationKeys} from 'models/selfServiceConfiguration/queries'
import {selfServiceConfigurationFixture} from 'pages/settings/contactForm/fixtures/selfServiceConfiguration'
import {RootState} from 'state/types'

import useStoreWorkflows from '../useStoreWorkflows'
import {getIntegration} from './fixtures/utils'

const shopName = 'ShopName'
const shopType = 'shopify'
const mockStore = configureMockStore()

const defaultState = {
    integrations: fromJS({
        integrations: [
            getIntegration(1, IntegrationType.Shopify, shopName),
            getIntegration(2, IntegrationType.Magento2),
        ],
    }),
    billing: fromJS(billingState),
} as RootState

const renderHookOptions = {
    wrapper: (({children}: {children: ReactChildren}) => (
        <QueryClientProvider
            client={mockQueryClient({
                cachedData: [
                    [
                        selfServiceConfigurationKeys.all(),
                        [selfServiceConfigurationFixture],
                    ],
                ],
            })}
        >
            <Provider store={mockStore(defaultState)}>{children}</Provider>
        </QueryClientProvider>
    )) as ComponentType,
}

jest.mock('state/entities/selfServiceConfigurations/selectors')
jest.mock('api/queryClient', () => ({
    appQueryClient: mockQueryClient(),
}))

jest.mock('pages/automate/common/hooks/useSelfServiceConfiguration', () => ({
    // default export
    __esModule: true,
    default: () => ({
        selfServiceConfiguration: {
            id: 1,
            type: 'shopify' as any,
            shopName: 'ShopName',
            createdDatetime: '2021-03-31T14:00:00.000Z',
            updatedDatetime: '2021-03-31T14:00:00.000Z',
            deactivatedDatetime: null,
            reportIssuePolicy: {
                enabled: true,
                cases: [],
            },
            trackOrderPolicy: {
                enabled: true,
            },
            cancelOrderPolicy: {
                enabled: true,
                eligibilities: [],
                exceptions: [],
            },
            returnOrderPolicy: {
                enabled: true,
                eligibilities: [],
                exceptions: [],
            },
            articleRecommendationHelpCenterId: null,
            workflowsEntrypoints: [
                {
                    workflow_id: 'a',
                },
                {
                    workflow_id: 'b',
                },
            ],
        },
        isFetchPending: false,
    }),
}))
describe('useStoreWorkflows', () => {
    it('should return workflows', () => {
        const {result} = renderHook(
            () =>
                useStoreWorkflows({
                    shopType,
                    shopName,
                    notifyMerchant: () => null,
                    configurationsMap: {
                        a: {
                            id: 'a',
                            internal_id: 'a',
                            is_draft: false,
                            name: 'a',
                            initial_step_id: 'a',
                            steps: [],
                            available_languages: [],
                            created_datetime: '2023-12-22T10:41:08.337Z',
                            updated_datetime: '2023-12-22T10:41:08.337Z',
                            deleted_datetime: null,
                        },
                    },
                }),
            renderHookOptions
        )

        expect(result.current).toEqual({
            workflows: [
                {
                    id: 'a',
                    internal_id: 'a',
                    is_draft: false,
                    name: 'a',
                    initial_step_id: 'a',
                    steps: [],
                    available_languages: [],
                    created_datetime: '2023-12-22T10:41:08.337Z',
                    updated_datetime: '2023-12-22T10:41:08.337Z',
                    deleted_datetime: null,
                },
            ],
            isFetchPending: false,
            storeIntegrationId: 1,
        })
    })
})
