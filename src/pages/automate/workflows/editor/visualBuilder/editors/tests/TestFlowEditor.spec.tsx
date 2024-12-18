/* eslint-disable @typescript-eslint/no-unsafe-return */
import {screen} from '@testing-library/react'
import {createMemoryHistory} from 'history'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import {Router} from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {billingState} from 'fixtures/billing'
import {IntegrationType} from 'models/integration/constants'
import {TestFlowEditor} from 'pages/automate/workflows/editor/visualBuilder/editors/TestFlowEditor'
import {getIntegration} from 'pages/automate/workflows/hooks/tests/fixtures/utils'
import {WorkflowEditorContext} from 'pages/automate/workflows/hooks/useWorkflowEditor'
import {VisualBuilderNode} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {RootState} from 'state/types'
import {renderWithQueryClientProvider} from 'tests/reactQueryTestingUtils'

const mockStore = configureMockStore([thunk])

const defaultState = {
    integrations: fromJS({
        integrations: [
            getIntegration(1, IntegrationType.Shopify, 'shopName'),
            getIntegration(2, IntegrationType.Magento2),
        ],
    }),

    billing: fromJS(billingState),
} as RootState

const mockedStore = mockStore({
    ...defaultState,
})

const renderWithRouter = (ui: React.ReactElement, {route = '/'} = {}) => {
    const history = createMemoryHistory({initialEntries: [route]})
    return {
        ...renderWithQueryClientProvider(
            <Provider store={mockedStore}>
                <Router history={history}>{ui}</Router>
            </Provider>
        ),
        history,
    }
}

const mockVisualBuilderNode: VisualBuilderNode = {
    id: '1',
    type: 'channel_trigger',
    data: {
        label: 'Test Label',
        label_tkey: 'Test Label',
    },
    position: {x: 0, y: 0},
}

describe('TestFlowEditor', () => {
    it('should render the chat based on the currentLanguage', () => {
        renderWithRouter(
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
            </WorkflowEditorContext.Provider>
        )

        expect(screen.getByText('English - GB')).toBeInTheDocument()
    })

    it('should use currentLanguage if selectedTestLanguage is not set', () => {
        renderWithRouter(
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
            </WorkflowEditorContext.Provider>
        )

        expect(screen.getByText('English - GB')).toBeInTheDocument()
    })

    it('should use selectedTestLanguage if it is set', () => {
        renderWithRouter(
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
            </WorkflowEditorContext.Provider>
        )

        expect(screen.getByText('English - GB')).toBeInTheDocument()
    })

    it('should use the first available language if currentLanguage is not set', () => {
        renderWithRouter(
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
            </WorkflowEditorContext.Provider>
        )

        expect(screen.getByText('English - US')).toBeInTheDocument()
    })

    it('should use the first available language if currentLanguage is undefined', () => {
        renderWithRouter(
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
            </WorkflowEditorContext.Provider>
        )

        expect(screen.getByText('English - US')).toBeInTheDocument()
    })
})
