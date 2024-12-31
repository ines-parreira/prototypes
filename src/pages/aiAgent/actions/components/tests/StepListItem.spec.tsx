import {QueryClientProvider} from '@tanstack/react-query'
import {fireEvent, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {IntegrationType} from 'models/integration/constants'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'
import useGetAppFromTemplateApp from 'pages/automate/actionsPlatform/hooks/useGetAppFromTemplateApp'
import {StoreIntegrationContext} from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import {VisualBuilderContext} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {WorkflowChannelSupportContext} from 'pages/automate/workflows/hooks/useWorkflowChannelSupport'
import {VisualBuilderGraph} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {renderWithRouterAndDnD} from 'utils/testing'

import {StepListItem} from '../StepListItem'

jest.mock('pages/automate/actionsPlatform/hooks/useApps')
jest.mock('pages/automate/actionsPlatform/hooks/useGetAppFromTemplateApp')

const mockUseApps = useApps as jest.MockedFunction<typeof useApps>
const mockUseGetAppFromTemplateApp =
    useGetAppFromTemplateApp as jest.MockedFunction<
        typeof useGetAppFromTemplateApp
    >
const mockStore = configureMockStore()
const queryClient = mockQueryClient()

const mockStoreIntegration = {
    id: 5,
    type: IntegrationType.Shopify,
    name: 'test-store',
    description: null,
    created_datetime: '',
    updated_datetime: '',
    locked_datetime: null,
    deactivated_datetime: null,
    deleted_datetime: null,
    uri: '',
    decoration: null,
    user: {
        id: 1,
    },
    meta: {
        oauth: {
            status: '',
            error: '',
            scope: '',
        },
        shop_name: 'test-store',
        webhooks: [],
    },
    managed: false,
}

const renderWithProviders = (
    ui: React.ReactElement,
    graph: VisualBuilderGraph,
    contextDispatch = jest.fn()
) => {
    return renderWithRouterAndDnD(
        <Provider store={mockStore({})}>
            <QueryClientProvider client={queryClient}>
                <StoreIntegrationContext.Provider
                    value={
                        mockStoreIntegration as unknown as (typeof StoreIntegrationContext.Provider)['arguments'][0]
                    }
                >
                    <WorkflowChannelSupportContext.Provider
                        value={{
                            isStepUnsupportedInAllChannels: () => false,
                            getUnsupportedConnectedChannels: () => [],
                            getSupportedChannels: () => [],
                            getUnsupportedChannels: () => [],
                            getUnsupportedNodeTypes: () => [],
                        }}
                    >
                        <VisualBuilderContext.Provider
                            value={{
                                visualBuilderGraph: graph,
                                initialVisualBuilderGraph: graph,
                                checkNodeHasVariablesUsedInChildren: () =>
                                    false,
                                dispatch: contextDispatch,
                                getVariableListInChildren: () => [],
                                checkNewVisualBuilderNode: () => false,
                                getVariableListForNode: () => [],
                                isNew: false,
                            }}
                        >
                            {ui}
                        </VisualBuilderContext.Provider>
                    </WorkflowChannelSupportContext.Provider>
                </StoreIntegrationContext.Provider>
            </QueryClientProvider>
        </Provider>
    )
}

describe('StepListItem', () => {
    const mockOnDelete = jest.fn()
    const mockOnMove = jest.fn()
    const mockOnDrop = jest.fn()
    const mockOnCancel = jest.fn()
    const mockOnClick = jest.fn()
    const mockDispatch = jest.fn()
    const mockContextDispatch = jest.fn()

    const defaultProps = {
        isTemplate: false,
        index: 0,
        nodeValues: {},
        graphApps: [],
        apps: [],
        step: {
            id: 'step1',
            internal_id: 'internal1',
            name: 'Test Step',
            is_draft: false,
            initial_step_id: 'step1',
            steps: [],
            apps: [
                {
                    type: 'app',
                    app_id: 'test-app',
                    api_key: null,
                    account_oauth2_token_id: null,
                    refresh_token: null,
                },
            ],
            transitions: [],
            available_languages: [],
            created_datetime: '2023-01-01T00:00:00Z',
            updated_datetime: '2023-01-01T00:00:00Z',
            entrypoints: [],
            triggers: [],
            inputs: [],
            description: null,
            short_description: null,
        },
        onDelete: mockOnDelete,
        onMove: mockOnMove,
        onDrop: mockOnDrop,
        onCancel: mockOnCancel,
        onClick: mockOnClick,
    }

    beforeEach(() => {
        const testApp = {
            id: 'test-app',
            auth_type: 'api-key',
            auth_settings: {},
            name: 'Test App',
            icon: 'test-icon',
            type: IntegrationType.Shopify,
        } as const

        mockUseApps.mockReturnValue({
            apps: [testApp],
            actionsApps: [testApp],
            isLoading: false,
        })

        mockUseGetAppFromTemplateApp.mockReturnValue(() => testApp)

        mockDispatch.mockClear()
        mockContextDispatch.mockClear()
    })

    it('handles click when step is clickable (app type and not template)', () => {
        const props = {
            ...defaultProps,
            step: {
                ...defaultProps.step,
                apps: [
                    {
                        type: 'app' as const,
                        app_id: 'test-app',
                        api_key: null,
                        account_oauth2_token_id: null,
                        refresh_token: null,
                    },
                ],
            },
        }

        renderWithProviders(
            <StepListItem {...props} />,
            {} as VisualBuilderGraph
        )

        const button = screen.getByRole('button')
        fireEvent.click(button)

        expect(mockOnClick).toHaveBeenCalled()
    })

    it('does not handle click when step is not clickable', () => {
        const props = {
            ...defaultProps,
            step: {
                ...defaultProps.step,
                apps: [
                    {
                        type: 'shopify' as const,
                    },
                ],
            },
            isTemplate: true,
        }

        renderWithProviders(
            <StepListItem {...props} />,
            {} as VisualBuilderGraph
        )

        const button = screen.getByRole('button')
        fireEvent.click(button)

        expect(mockOnClick).not.toHaveBeenCalled()
    })

    it('finds matching graphApp for Shopify type', () => {
        const props = {
            ...defaultProps,
            step: {
                ...defaultProps.step,
                apps: [
                    {
                        type: 'shopify' as const,
                    },
                ],
            },
            graphApps: [
                {
                    type: 'shopify' as const,
                },
                {
                    type: 'recharge' as const,
                },
            ],
        }

        renderWithProviders(
            <StepListItem {...props} />,
            {} as VisualBuilderGraph
        )

        const button = screen.getByRole('button')
        fireEvent.click(button)

        expect(mockOnClick).not.toHaveBeenCalled()
    })

    it('finds matching graphApp for Recharge type', () => {
        const props = {
            ...defaultProps,
            step: {
                ...defaultProps.step,
                apps: [
                    {
                        type: 'recharge' as const,
                    },
                ],
            },
            graphApps: [
                {
                    type: 'shopify' as const,
                },
                {
                    type: 'recharge' as const,
                },
            ],
        }

        renderWithProviders(
            <StepListItem {...props} />,
            {} as VisualBuilderGraph
        )

        const button = screen.getByRole('button')
        fireEvent.click(button)

        expect(mockOnClick).not.toHaveBeenCalled()
    })
})
