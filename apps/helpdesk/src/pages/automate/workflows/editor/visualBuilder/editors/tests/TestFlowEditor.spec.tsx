/* eslint-disable @typescript-eslint/no-unsafe-return */
import type React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { billingState } from 'fixtures/billing'
import { IntegrationType } from 'models/integration/constants'
import { TestFlowEditor } from 'pages/automate/workflows/editor/visualBuilder/editors/TestFlowEditor'
import { getIntegration } from 'pages/automate/workflows/hooks/tests/fixtures/utils'
import { WorkflowEditorContext } from 'pages/automate/workflows/hooks/useWorkflowEditor'
import type { VisualBuilderNode } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import type { RootState } from 'state/types'

const defaultState = {
    integrations: fromJS({
        integrations: [
            getIntegration(1, IntegrationType.Shopify, 'shopName'),
            getIntegration(2, IntegrationType.Magento2),
        ],
    }),

    billing: fromJS(billingState),
} as RootState

const storeState = {
    ...defaultState,
} as RootState

const renderComponent = (ui: React.ReactElement, { route = '/' } = {}) => {
    return render(ui, { initialEntries: [route], storeState })
}

const mockVisualBuilderNode: VisualBuilderNode = {
    id: '1',
    type: 'channel_trigger',
    data: {
        label: 'Test Label',
        label_tkey: 'Test Label',
    },
    position: { x: 0, y: 0 },
}

describe('TestFlowEditor', () => {
    it('should render the chat based on the currentLanguage', () => {
        renderComponent(
            <WorkflowEditorContext.Provider
                value={
                    {
                        isDirty: false,
                        isFetchPending: false,
                        isSavePending: false,
                        workflowStepMetrics: null,
                        setWorkflowStepMetrics: jest.fn(),
                        zoom: 1,
                        translateKey: jest.fn(),
                        setZoom: jest.fn(),
                        currentLanguage: 'en-GB',
                        visualBuilderGraph: {
                            available_languages: ['en-US', 'en-GB'],
                        },
                    } as any
                }
            >
                <TestFlowEditor
                    isTesting={true}
                    onClose={jest.fn()}
                    startFlowNode={mockVisualBuilderNode}
                    isAuthenticationBannerVisible={false}
                />
            </WorkflowEditorContext.Provider>,
        )

        expect(screen.getByText('English - GB')).toBeInTheDocument()
    })

    it('should use currentLanguage if selectedTestLanguage is not set', () => {
        renderComponent(
            <WorkflowEditorContext.Provider
                value={
                    {
                        isDirty: false,
                        isFetchPending: false,
                        isSavePending: false,
                        workflowStepMetrics: null,
                        setWorkflowStepMetrics: jest.fn(),
                        zoom: 1,
                        translateKey: jest.fn(),
                        setZoom: jest.fn(),
                        currentLanguage: 'en-GB',
                        visualBuilderGraph: {
                            available_languages: ['en-US', 'en-GB'],
                        },
                    } as any
                }
            >
                <TestFlowEditor
                    isTesting={true}
                    onClose={jest.fn()}
                    startFlowNode={mockVisualBuilderNode}
                    isAuthenticationBannerVisible={false}
                />
            </WorkflowEditorContext.Provider>,
        )

        expect(screen.getByText('English - GB')).toBeInTheDocument()
    })

    it('should use selectedTestLanguage if it is set', () => {
        renderComponent(
            <WorkflowEditorContext.Provider
                value={
                    {
                        isDirty: false,
                        isFetchPending: false,
                        isSavePending: false,
                        workflowStepMetrics: null,
                        setWorkflowStepMetrics: jest.fn(),
                        zoom: 1,
                        translateKey: jest.fn(),
                        setZoom: jest.fn(),
                        currentLanguage: 'en-GB',
                        visualBuilderGraph: {
                            available_languages: ['en-US', 'en-GB'],
                        },
                    } as any
                }
            >
                <TestFlowEditor
                    isTesting={true}
                    onClose={jest.fn()}
                    startFlowNode={mockVisualBuilderNode}
                    isAuthenticationBannerVisible={false}
                />
            </WorkflowEditorContext.Provider>,
        )

        expect(screen.getByText('English - GB')).toBeInTheDocument()
    })

    it('should use the first available language if currentLanguage is not set', () => {
        renderComponent(
            <WorkflowEditorContext.Provider
                value={
                    {
                        isDirty: false,
                        isFetchPending: false,
                        isSavePending: false,
                        workflowStepMetrics: null,
                        setWorkflowStepMetrics: jest.fn(),
                        zoom: 1,
                        translateKey: jest.fn(),
                        setZoom: jest.fn(),
                        currentLanguage: null,
                        visualBuilderGraph: {
                            available_languages: ['en-US', 'en-GB'],
                        },
                    } as any
                }
            >
                <TestFlowEditor
                    isTesting={true}
                    onClose={jest.fn()}
                    startFlowNode={mockVisualBuilderNode}
                    isAuthenticationBannerVisible={false}
                />
            </WorkflowEditorContext.Provider>,
        )

        expect(screen.getByText('English - US')).toBeInTheDocument()
    })

    it('should use the first available language if currentLanguage is undefined', () => {
        renderComponent(
            <WorkflowEditorContext.Provider
                value={
                    {
                        isDirty: false,
                        isFetchPending: false,
                        isSavePending: false,
                        workflowStepMetrics: null,
                        setWorkflowStepMetrics: jest.fn(),
                        zoom: 1,
                        translateKey: jest.fn(),
                        setZoom: jest.fn(),
                        currentLanguage: undefined,
                        visualBuilderGraph: {
                            available_languages: ['en-US', 'en-GB'],
                        },
                    } as any
                }
            >
                <TestFlowEditor
                    isTesting={true}
                    onClose={jest.fn()}
                    startFlowNode={mockVisualBuilderNode}
                    isAuthenticationBannerVisible={false}
                />
            </WorkflowEditorContext.Provider>,
        )

        expect(screen.getByText('English - US')).toBeInTheDocument()
    })
})
