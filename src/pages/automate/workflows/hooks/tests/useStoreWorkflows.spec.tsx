import React, {ComponentType, ReactChildren} from 'react'
import {renderHook} from '@testing-library/react-hooks'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {IntegrationType} from 'models/integration/constants'
import {RootState} from 'state/types'
import {billingState} from 'fixtures/billing'
import {getSelfServiceConfigurations} from 'state/entities/selfServiceConfigurations/selectors'
import useStoreWorkflows from '../useStoreWorkflows'
import {getIntegration} from './fixtures/utils'
import {useWorkflowApiMockSetter} from './fixtures/mockBuilders'

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
        <Provider store={mockStore(defaultState)}>{children}</Provider>
    )) as ComponentType,
}

jest.mock('pages/automate/workflows/hooks/useWorkflowApi.ts')
jest.mock('state/entities/selfServiceConfigurations/selectors')

describe('useStoreWorkflows', () => {
    beforeEach(() => {
        useWorkflowApiMockSetter()
        ;(
            getSelfServiceConfigurations as jest.MockedFn<
                typeof getSelfServiceConfigurations
            >
        ).mockReturnValue([
            {
                id: 1,
                type: 'shopify' as any,
                shop_name: 'ShopName',
                created_datetime: '2021-03-31T14:00:00.000Z',
                updated_datetime: '2021-03-31T14:00:00.000Z',
                quick_response_policies: [],
                workflows_entrypoints: [
                    {
                        workflow_id: 'a',
                    },
                    {
                        workflow_id: 'b',
                    },
                ],
            },
        ] as unknown as ReturnType<typeof getSelfServiceConfigurations>)
    })
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
                            account_id: 1,
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
                    account_id: 1,
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
