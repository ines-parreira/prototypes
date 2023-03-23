import React from 'react'
import {screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {RootState, StoreDispatch} from 'state/types'
import {renderWithRouterAndDnD} from 'utils/testing'
import useSelfServiceConfiguration from 'pages/automation/common/hooks/useSelfServiceConfiguration'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'

import WorkflowsView from '../WorkflowsView'
import useWorkflowApi, {WorkflowConfiguration} from '../hooks/useWorkflowApi'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

jest.mock('pages/automation/common/hooks/useSelfServiceConfiguration')
jest.mock('../hooks/useWorkflowApi')
jest.mock('utils/launchDarkly')

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

describe('<WorkflowsView />', () => {
    beforeEach(() => {
        jest.resetAllMocks()
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
                    goToNewWorkflowPage={jest.fn()}
                    quickResponsesUrl=""
                />
            </Provider>
        )

        const skeletonRows = screen.queryAllByTestId(
            'shopper-flows-skeleton-row'
        )
        expect(skeletonRows.length).toBeGreaterThanOrEqual(1)
    })

    it('should display actual rows once workflow entrypoints have been fetched', async () => {
        useSelfServiceConfigurationMock.mockReturnValue({
            isFetchPending: false,
            isUpdatePending: false,
            storeIntegration: undefined,
            selfServiceConfiguration: {
                workflows_entrypoints: [
                    {
                        enabled: true,
                        label: 'my entrypoint a',
                        workflow_id: 'a',
                    },
                    {
                        enabled: true,
                        label: 'my entrypoint b',
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
            <Provider store={mockStore()}>
                <WorkflowsView
                    shopName=""
                    shopType=""
                    goToEditWorkflowPage={jest.fn()}
                    goToNewWorkflowPage={jest.fn()}
                    quickResponsesUrl=""
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
