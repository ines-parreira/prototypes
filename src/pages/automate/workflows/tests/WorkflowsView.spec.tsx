import React from 'react'
import {screen, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {RootState, StoreDispatch} from 'state/types'
import {renderWithRouterAndDnD} from 'utils/testing'

import {IntegrationType} from 'models/integration/constants'
import {billingState} from 'fixtures/billing'
import WorkflowsView from '../WorkflowsView'
import {useWorkflowApiMockSetter} from '../hooks/tests/fixtures/mockBuilders'
import useStoreWorkflows from '../hooks/useStoreWorkflows'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

jest.mock('../hooks/useStoreWorkflows.ts')
jest.mock('../hooks/useWorkflowApi')
jest.mock('state/entities/selfServiceConfigurations/selectors', () => {
    return {
        __esModule: true,
        getSelfServiceConfigurations: jest.fn(() => [
            {
                id: 1,
                type: 'shopify',
                shop_name: 'ShopName',
                created_datetime: '2021-03-31T14:00:00.000Z',
                updated_datetime: '2021-03-31T14:00:00.000Z',
                quick_response_policies: [],
                workflows_entrypoints: [{workflow_id: 'a'}, {workflow_id: 'b'}],
            },
        ]),
    }
})

function getIntegration(id: number, type: IntegrationType) {
    return {
        id,
        type,
        name: `My Phone Integration ${id}`,
        meta: {
            emoji: '',
            phone_number_id: id,
            shop_name: 'ShopName',
        },
    }
}

const defaultState = {
    integrations: fromJS({
        integrations: [getIntegration(1, IntegrationType.Shopify)],
    }),
    billing: fromJS(billingState),
} as RootState

const useStoreWorkflowsMock = useStoreWorkflows as jest.MockedFunction<
    typeof useStoreWorkflows
>

describe('<WorkflowsView />', () => {
    beforeEach(() => {
        useWorkflowApiMockSetter()
    })
    it('should display skeleton while workflow entrypoints are being fetched', async () => {
        useStoreWorkflowsMock.mockReturnValue({
            isFetchPending: true,
            workflows: [],
            storeIntegrationId: 1,
        })

        renderWithRouterAndDnD(
            <Provider store={mockStore(defaultState)}>
                <WorkflowsView
                    shopName=""
                    shopType=""
                    goToEditWorkflowPage={jest.fn()}
                    goToWorkflowTemplatesPage={jest.fn()}
                    goToNewWorkflowPage={jest.fn()}
                    goToNewWorkflowFromTemplatePage={jest.fn()}
                    quickResponsesUrl=""
                    connectedChannelsUrl=""
                    notifyMerchant={jest.fn()}
                />
            </Provider>
        )

        await waitFor(() => {
            const loader = screen.queryAllByTestId('loader')
            expect(loader.length).toBe(1)
        })
    })

    it('should display actual rows once workflow entrypoints have been fetched', async () => {
        useStoreWorkflowsMock.mockReturnValue({
            isFetchPending: false,
            workflows: [
                {
                    id: 'a',
                    internal_id: 'a',
                    name: 'a',
                    available_languages: [],
                    account_id: 1,
                    is_draft: false,
                    entrypoint: {label: '', label_tkey: ''},
                    steps: [],
                    initial_step_id: '',
                    created_datetime: '2023-12-22T10:41:08.337Z',
                    updated_datetime: '2023-12-22T10:41:08.337Z',
                    deleted_datetime: null,
                },
                {
                    id: 'b',
                    internal_id: 'b',
                    name: 'b',
                    available_languages: [],
                    account_id: 1,
                    is_draft: false,
                    entrypoint: {label: '', label_tkey: ''},
                    steps: [],
                    initial_step_id: '',
                    created_datetime: '2023-12-22T10:41:08.337Z',
                    updated_datetime: '2023-12-22T10:41:08.337Z',
                    deleted_datetime: null,
                },
            ],
            storeIntegrationId: 1,
        })

        renderWithRouterAndDnD(
            <Provider store={mockStore(defaultState)}>
                <WorkflowsView
                    shopName="ShopName"
                    shopType="shopify"
                    goToEditWorkflowPage={jest.fn()}
                    goToWorkflowTemplatesPage={jest.fn()}
                    goToNewWorkflowPage={jest.fn()}
                    goToNewWorkflowFromTemplatePage={jest.fn()}
                    quickResponsesUrl=""
                    connectedChannelsUrl=""
                    notifyMerchant={jest.fn()}
                />
            </Provider>
        )

        await waitFor(async () => {
            const skeletonRows = screen.queryAllByTestId(
                'shopper-flows-skeleton-row'
            )
            expect(skeletonRows.length).toBe(0)

            await screen.findByText('a')
            await screen.findByText('b')
        })
    })
})
