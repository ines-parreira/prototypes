import React from 'react'
import {screen} from '@testing-library/react'
import {renderWithRouterAndDnD} from 'utils/testing'
import useSelfServiceConfiguration from 'pages/automation/common/hooks/useSelfServiceConfiguration'
import {SelfServiceConfiguration} from 'models/selfServiceConfiguration/types'

import WorkflowsView from '../WorkflowsView'

jest.mock('pages/automation/common/hooks/useSelfServiceConfiguration')
jest.mock('utils/launchDarkly')

const useSelfServiceConfigurationMock =
    useSelfServiceConfiguration as jest.MockedFunction<
        typeof useSelfServiceConfiguration
    >

describe('<WorkflowsView />', () => {
    afterEach(() => {
        jest.clearAllMocks()
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
            <WorkflowsView
                shopName=""
                shopType=""
                goToEditWorkflowPage={jest.fn()}
                goToNewWorkflowPage={jest.fn()}
            />
        )

        const skeletonRows = screen.queryAllByTestId(
            'shopper-flows-skeleton-row'
        )
        expect(skeletonRows.length).toBeGreaterThanOrEqual(1)
    })

    it('should display actual rows once workflow entrypoints have been fetched', () => {
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

        renderWithRouterAndDnD(
            <WorkflowsView
                shopName=""
                shopType=""
                goToEditWorkflowPage={jest.fn()}
                goToNewWorkflowPage={jest.fn()}
            />
        )

        const skeletonRows = screen.queryAllByTestId(
            'shopper-flows-skeleton-row'
        )
        expect(skeletonRows.length).toBe(0)

        const entrypointA = screen.queryByText('my entrypoint a')
        const entrypointB = screen.queryByText('my entrypoint b')
        expect(entrypointA).toBeTruthy()
        expect(entrypointB).toBeTruthy()
    })
})
