import React from 'react'
import {screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {RootState, StoreDispatch} from 'state/types'
import {renderWithRouterAndDnD} from 'utils/testing'
import useSelfServiceConfiguration from 'pages/automation/common/hooks/useSelfServiceConfiguration'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'

import {IntegrationType} from 'models/integration/constants'
import {billingState} from 'fixtures/billing'
import useWorkflowApi from '../hooks/useWorkflowApi'
import {WorkflowConfiguration} from '../models/workflowConfiguration.types'
import WorkflowsView from '../WorkflowsView'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

jest.mock('pages/automation/common/hooks/useSelfServiceConfiguration')
jest.mock('../hooks/useWorkflowApi')

const useSelfServiceConfigurationMock =
    useSelfServiceConfiguration as jest.MockedFunction<
        typeof useSelfServiceConfiguration
    >

const mockWorkflowApi: Partial<ReturnType<typeof useWorkflowApi>> = {
    fetchWorkflowConfigurations: () => {
        return Promise.resolve([])
    },
} as const

function updateUseWorkflowApiMock(
    overrides: Partial<ReturnType<typeof useWorkflowApi>>
) {
    ;(useWorkflowApi as jest.MockedFn<typeof useWorkflowApi>).mockReturnValue({
        ...mockWorkflowApi,
        ...overrides,
    } as ReturnType<typeof useWorkflowApi>)
}
function getIntegration(id: number, type: IntegrationType) {
    return {
        id,
        type,
        name: `My Phone Integration ${id}`,
        meta: {
            emoji: '',
            phone_number_id: id,
        },
    }
}
const defaultState = {
    integrations: fromJS({
        integrations: [
            getIntegration(1, IntegrationType.Shopify),
            getIntegration(2, IntegrationType.Magento2),
        ],
    }),
    billing: fromJS(billingState),
} as RootState
describe('<WorkflowsView />', () => {
    beforeEach(() => {
        updateUseWorkflowApiMock({})
    })

    it('should display skeleton while workflow entrypoints are being fetched', () => {
        useSelfServiceConfigurationMock.mockReturnValue({
            isFetchPending: true,
            isUpdatePending: false,
            storeIntegration: undefined,
            selfServiceConfiguration: undefined,
            handleSelfServiceConfigurationUpdate: jest.fn(),
        })

        renderWithRouterAndDnD(
            <Provider store={mockStore()}>
                <WorkflowsView
                    shopName=""
                    shopType=""
                    goToEditWorkflowPage={jest.fn()}
                    goToWorkflowTemplatesPage={jest.fn()}
                    quickResponsesUrl=""
                    connectedChannelsUrl=""
                    notifyMerchant={jest.fn()}
                />
            </Provider>
        )

        const loader = screen.queryAllByTestId('loader')
        expect(loader.length).toBe(1)
    })

    it('should display actual rows once workflow entrypoints have been fetched', async () => {
        useSelfServiceConfigurationMock.mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: undefined,
            selfServiceConfiguration: {
                workflows_entrypoints: [
                    {
                        workflow_id: 'a',
                    },
                    {
                        workflow_id: 'b',
                    },
                ],
            } as SelfServiceConfiguration,
            handleSelfServiceConfigurationUpdate: jest.fn(),
        })
        updateUseWorkflowApiMock({
            fetchWorkflowConfigurations() {
                return Promise.resolve([
                    {id: 'a', name: 'my workflow a'} as WorkflowConfiguration,
                    {id: 'b', name: 'my workflow b'} as WorkflowConfiguration,
                ])
            },
        })

        renderWithRouterAndDnD(
            <Provider store={mockStore(defaultState)}>
                <WorkflowsView
                    shopName=""
                    shopType=""
                    goToEditWorkflowPage={jest.fn()}
                    goToWorkflowTemplatesPage={jest.fn()}
                    quickResponsesUrl=""
                    connectedChannelsUrl=""
                    notifyMerchant={jest.fn()}
                />
            </Provider>
        )

        const skeletonRows = screen.queryAllByTestId(
            'shopper-flows-skeleton-row'
        )
        expect(skeletonRows.length).toBe(0)

        await screen.findByText('my workflow a')
        await screen.findByText('my workflow b')
    })
})
