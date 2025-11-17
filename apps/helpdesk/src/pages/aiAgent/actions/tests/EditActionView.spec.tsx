// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import { QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { produce } from 'immer'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { ulid } from 'ulidx'

import { useFlag } from 'core/flags'
import { billingState } from 'fixtures/billing'
import useAppDispatch from 'hooks/useAppDispatch'
import { useFindAllGuidancesKnowledgeResources } from 'models/knowledgeService/queries'
import {
    useGetStoreApps,
    useGetStoreWorkflowsConfigurations,
    useGetWorkflowConfigurationTemplates,
    useListActionsApps,
    useListTrackstarConnections,
} from 'models/workflows/queries'
import useAddStoreApp from 'pages/aiAgent/actions/hooks/useAddStoreApp'
import useDeleteAction from 'pages/aiAgent/actions/hooks/useDeleteAction'
import useThreeplIntegrations from 'pages/aiAgent/actions/hooks/useThreeplIntegrations'
import useUpsertAction from 'pages/aiAgent/actions/hooks/useUpsertAction'
import { useAiAgentEnabled } from 'pages/aiAgent/hooks/useAiAgentEnabled'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { usePlaygroundPanel } from 'pages/aiAgent/hooks/usePlaygroundPanel'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'
import { computeNodesPositions } from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer/utils'
import type { LLMPromptTriggerNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {
    transformWorkflowConfigurationIntoVisualBuilderGraph,
    WorkflowConfigurationBuilder,
} from 'pages/automate/workflows/models/workflowConfiguration.model'
import * as serverValidationErrors from 'pages/automate/workflows/utils/serverValidationErrors'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import EditActionView from '../EditActionView'

jest.mock('models/workflows/queries')
jest.mock('models/knowledgeService/queries')
jest.mock('pages/aiAgent/actions/hooks/useUpsertAction')
jest.mock('pages/aiAgent/actions/hooks/useDeleteAction')
jest.mock('pages/automate/actionsPlatform/hooks/useApps')
jest.mock('pages/aiAgent/hooks/useAiAgentEnabled')
jest.mock('state/notifications/actions')
jest.mock('hooks/useAppDispatch')
jest.mock('pages/aiAgent/actions/hooks/useAddStoreApp')
jest.mock('pages/aiAgent/actions/hooks/useThreeplIntegrations')
jest.mock('core/flags')
jest.mock('pages/automate/workflows/utils/serverValidationErrors')
jest.mock('pages/aiAgent/hooks/useAiAgentNavigation')
jest.mock('pages/AppContext')
jest.mock('pages/aiAgent/hooks/usePlaygroundPanel')

const mockUseGetWorkflowConfigurationTemplates = jest.mocked(
    useGetWorkflowConfigurationTemplates,
)
const mockUseUpsertAction = jest.mocked(useUpsertAction)
const mockUseDeleteAction = jest.mocked(useDeleteAction)
const mockUseApps = jest.mocked(useApps)
const mockUseEnableAiAgent = jest.mocked(useAiAgentEnabled)
const mockUseAppDispatch = jest.mocked(useAppDispatch)
const mockUseGetStoreApps = jest.mocked(useGetStoreApps)
const mockuse3plIntegrations = jest.mocked(useThreeplIntegrations)
const mockUseAddStoreApp = jest.mocked(useAddStoreApp)
const mockUseFlag = jest.mocked(useFlag)
const mockUseGetStoreWorkflowsConfigurations = jest.mocked(
    useGetStoreWorkflowsConfigurations,
)
const mockUseListActionsApps = jest.mocked(useListActionsApps)
const mockUseListTrackstarConnections = jest.mocked(useListTrackstarConnections)
const mockUseFindAllGuidancesKnowledgeResources = jest.mocked(
    useFindAllGuidancesKnowledgeResources,
)
const mockServerValidationErrors = jest.mocked(serverValidationErrors)
const mockUseAiAgentNavigation = jest.mocked(useAiAgentNavigation)
const mockUsePlaygroundPanel = jest.mocked(usePlaygroundPanel)

const { useAppContext } = require('pages/AppContext')
const mockUseAppContext = jest.mocked(useAppContext)

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('state/integrations/selectors', () => ({
    ...jest.requireActual('state/integrations/selectors'),
    getIntegrationsList: () => [
        { type: 'shopify', count: 1 },
        { type: 'recharge', count: 0 },
    ],
}))

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])({
    billing: fromJS(billingState),
    integrations: fromJS({
        integrations: [
            {
                type: 'shopify',
                count: 1,
                meta: { store_name: 'shopify-store' },
            },
            {
                type: 'recharge',
                count: 0,
                meta: { store_name: 'recharge-store' },
            },
        ],
    }),
} as RootState)

const queryClient = mockQueryClient()

const b = new WorkflowConfigurationBuilder({
    id: ulid(),
    name: 'Action name',
    initialStep: {
        id: ulid(),
        kind: 'http-request',
        settings: {
            headers: {},
            method: 'GET',
            name: 'name',
            url: 'https://example.com',
            variables: [],
        },
    },
    entrypoints: [
        {
            kind: 'llm-conversation',
            trigger: 'llm-prompt',
            settings: {
                instructions: 'instructions',
                requires_confirmation: false,
            },
            deactivated_datetime: null,
        },
    ],
    triggers: [
        {
            kind: 'llm-prompt',
            settings: {
                custom_inputs: [],
                object_inputs: [],
                outputs: [],
                conditions: null,
            },
        },
    ],
    is_draft: false,
    apps: [],
    available_languages: [],
})
b.insertHttpRequestConditionAndEndStepAndSelect('success', { success: true })
b.selectParentStep()
b.insertHttpRequestConditionAndEndStepAndSelect('error', { success: false })

const configuration = b.build()

describe('<EditActionView />', () => {
    beforeEach(() => {
        mockUseGetWorkflowConfigurationTemplates.mockReturnValue({
            data: [],
        } as unknown as ReturnType<typeof useGetWorkflowConfigurationTemplates>)
        mockUseUpsertAction.mockReturnValue({
            isLoading: false,
            mutateAsync: jest.fn(),
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAction>)
        mockUseDeleteAction.mockReturnValue({
            isLoading: false,
            mutateAsync: jest.fn(),
            isSuccess: false,
        } as unknown as ReturnType<typeof useDeleteAction>)
        mockUseApps.mockReturnValue({
            isLoading: false,
            apps: [],
            actionsApps: [],
        })
        mockUseEnableAiAgent.mockReturnValue({
            updateSettingsAfterAiAgentEnabled: jest.fn(),
        })
        mockUseFlag.mockReturnValue(true)
        mockUseAppDispatch.mockReturnValue(jest.fn())
        mockUseGetStoreApps.mockReturnValue({
            data: [],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetStoreApps>)
        mockUseAddStoreApp.mockReturnValue(jest.fn())
        mockuse3plIntegrations.mockReturnValue([])
        mockUseGetStoreWorkflowsConfigurations.mockReturnValue({
            data: [],
        } as unknown as ReturnType<typeof useGetStoreWorkflowsConfigurations>)
        mockUseListActionsApps.mockReturnValue({
            data: [],
        } as unknown as ReturnType<typeof useListActionsApps>)
        mockUseListTrackstarConnections.mockReturnValue({
            data: [],
        } as unknown as ReturnType<typeof useListTrackstarConnections>)
        mockUseFindAllGuidancesKnowledgeResources.mockReturnValue({
            data: {},
        } as unknown as ReturnType<
            typeof useFindAllGuidancesKnowledgeResources
        >)

        // Default mock for server validation errors - can be overridden in individual tests
        mockServerValidationErrors.mapServerErrorsToGraph = jest
            .fn()
            .mockReturnValue(null)

        mockUseAiAgentNavigation.mockReturnValue({
            routes: {
                actions: '/app/ai-agent/shopify/shopify-store/actions',
                test: '/app/ai-agent/shopify/shopify-store/test',
                actionEvents: (id: string) =>
                    `/app/ai-agent/shopify/shopify-store/actions/events/${id}`,
            },
            navigationItems: [],
        } as unknown as ReturnType<typeof useAiAgentNavigation>)

        mockUsePlaygroundPanel.mockReturnValue({
            openPlayground: jest.fn(),
            closePlayground: jest.fn(),
        } as unknown as ReturnType<typeof usePlaygroundPanel>)

        mockUseAppContext.mockReturnValue({
            setCollapsibleColumnChildren: jest.fn(),
            collapsibleColumnChildren: null,
            isCollapsibleColumnOpen: false,
            setIsCollapsibleColumnOpen: jest.fn(),
        })
    })

    it('should render edit action page', () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={queryClient}>
                    <EditActionView configuration={configuration} />
                </QueryClientProvider>
            </Provider>,
        )

        expect(screen.getByText('Save changes')).toBeInTheDocument()
    })

    it('should redirect on "Back to support actions" click', () => {
        const history = createMemoryHistory({
            initialEntries: [
                `/app/ai-agent/shopify/shopify-store/actions/edit/${configuration.id}`,
            ],
        })
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={queryClient}>
                    <EditActionView configuration={configuration} />
                </QueryClientProvider>
            </Provider>,
            {
                history,
                path: '/app/ai-agent/:shopType/:shopName/actions/edit/:id',
                route: `/app/ai-agent/shopify/shopify-store/actions/edit/${configuration.id}`,
            },
        )

        act(() => {
            fireEvent.click(screen.getByText('Back to support actions'))
        })

        expect(historyPushSpy).toHaveBeenCalledWith(
            '/app/ai-agent/shopify/shopify-store/actions',
        )
    })

    it('should redirect on "View Events" click', () => {
        const history = createMemoryHistory({
            initialEntries: [
                `/app/ai-agent/shopify/shopify-store/actions/edit/${configuration.id}`,
            ],
        })
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={queryClient}>
                    <EditActionView configuration={configuration} />
                </QueryClientProvider>
            </Provider>,
            {
                history,
                path: '/app/ai-agent/:shopType/:shopName/actions/edit/:id',
                route: `/app/ai-agent/shopify/shopify-store/actions/edit/${configuration.id}`,
            },
        )

        act(() => {
            fireEvent.click(screen.getByText('View Events'))
        })

        expect(historyPushSpy).toHaveBeenCalledWith(
            `/app/ai-agent/shopify/shopify-store/actions/events/${configuration.id}`,
        )
    })

    it('should redirect on "Cancel" click', () => {
        const history = createMemoryHistory({
            initialEntries: [
                `/app/ai-agent/shopify/shopify-store/actions/edit/${configuration.id}`,
            ],
        })
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={queryClient}>
                    <EditActionView configuration={configuration} />
                </QueryClientProvider>
            </Provider>,
            {
                history,
                path: '/app/ai-agent/:shopType/:shopName/actions/edit/:id',
                route: `/app/ai-agent/shopify/shopify-store/actions/edit/${configuration.id}`,
            },
        )

        act(() => {
            fireEvent.click(screen.getByText('Cancel'))
        })

        expect(historyPushSpy).toHaveBeenCalledWith(
            `/app/ai-agent/shopify/shopify-store/actions`,
        )
    })

    it('should not redirect after successful edit (stays on edit page)', async () => {
        mockUseUpsertAction.mockReturnValue({
            isLoading: false,
            mutateAsync: jest.fn(),
            isSuccess: true,
        } as unknown as ReturnType<typeof useUpsertAction>)

        const history = createMemoryHistory({
            initialEntries: [
                `/app/ai-agent/shopify/shopify-store/actions/edit/${configuration.id}`,
            ],
        })
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={queryClient}>
                    <EditActionView configuration={configuration} />
                </QueryClientProvider>
            </Provider>,
            {
                history,
                path: '/app/ai-agent/:shopType/:shopName/actions/edit/:id',
                route: `/app/ai-agent/shopify/shopify-store/actions/edit/${configuration.id}`,
            },
        )

        await waitFor(() => {
            expect(historyPushSpy).not.toHaveBeenCalled()
        })
    })

    it('should redirect to actions on delete success', async () => {
        mockUseDeleteAction.mockReturnValue({
            isLoading: false,
            mutateAsync: jest.fn(),
            isSuccess: true,
        } as unknown as ReturnType<typeof useDeleteAction>)

        const history = createMemoryHistory({
            initialEntries: [
                `/app/ai-agent/shopify/shopify-store/actions/edit/${configuration.id}`,
            ],
        })
        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={queryClient}>
                    <EditActionView configuration={configuration} />
                </QueryClientProvider>
            </Provider>,
            {
                history,
                path: '/app/ai-agent/:shopType/:shopName/actions/edit/:id',
                route: `/app/ai-agent/shopify/shopify-store/actions/edit/${configuration.id}`,
            },
        )

        await waitFor(() => {
            expect(historyPushSpy).toHaveBeenCalledWith(
                `/app/ai-agent/shopify/shopify-store/actions`,
            )
        })
    })

    it('should disable "Save and test" button if action is disabled', () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={queryClient}>
                    <EditActionView
                        configuration={produce(configuration, (draft) => {
                            if (draft.entrypoints) {
                                draft.entrypoints[0].deactivated_datetime =
                                    new Date().toISOString()
                            }
                        })}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        expect(
            screen.getByRole('button', { name: 'Save and test' }),
        ).toBeAriaDisabled()
    })

    it('should disable save buttons if action is editing', () => {
        mockUseUpsertAction.mockReturnValue({
            isLoading: true,
            mutateAsync: jest.fn(),
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAction>)

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={queryClient}>
                    <EditActionView configuration={configuration} />
                </QueryClientProvider>
            </Provider>,
        )

        expect(
            screen.getByRole('button', { name: /Save changes/ }),
        ).toBeAriaDisabled()
        expect(
            screen.getByRole('button', { name: /Save and test/ }),
        ).toBeAriaDisabled()
    })

    it('should display errors', () => {
        const mockUpsertAction = jest.fn()

        mockUseUpsertAction.mockReturnValue({
            isLoading: false,
            mutateAsync: mockUpsertAction,
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAction>)

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={queryClient}>
                    <EditActionView configuration={configuration} />
                </QueryClientProvider>
            </Provider>,
        )

        act(() => {
            fireEvent.change(screen.getByDisplayValue('Action name'), {
                target: { value: '' },
            })
        })

        act(() => {
            fireEvent.click(screen.getByText('Save changes'))
        })

        expect(notify).toHaveBeenCalledWith({
            showDismissButton: true,
            status: NotificationStatus.Error,
            message: 'Fix errors in order to save Action',
        })

        expect(screen.getByText('Action name is required')).toBeInTheDocument()
        expect(mockUpsertAction).not.toHaveBeenCalled()
    })

    it('should save changes', () => {
        const mockUpsertAction = jest.fn()

        mockUseUpsertAction.mockReturnValue({
            isLoading: false,
            mutateAsync: mockUpsertAction,
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAction>)

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={queryClient}>
                    <EditActionView configuration={configuration} />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/app/ai-agent/:shopType/:shopName/actions/edit/:id',
                route: `/app/ai-agent/shopify/shopify-store/actions/edit/${configuration.id}`,
            },
        )

        act(() => {
            fireEvent.click(screen.getByText('Save changes'))
        })

        expect(mockUpsertAction).toHaveBeenCalledWith([
            {
                internal_id: configuration.internal_id,
                store_name: 'shopify-store',
                store_type: 'shopify',
            },
            expect.objectContaining({
                name: configuration.name,
                steps: configuration.steps,
                entrypoints: configuration.entrypoints,
                triggers: configuration.triggers,
            }),
        ])
    })

    it('should open/close visual builder', () => {
        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={queryClient}>
                    <EditActionView configuration={configuration} />
                </QueryClientProvider>
            </Provider>,
        )

        // Switch to advanced view
        act(() => {
            fireEvent.click(screen.getByText(/Advanced options/i))
        })

        act(() => {
            fireEvent.click(screen.getByText('Convert To Advanced View'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Edit'))
        })

        expect(
            screen.getByText(
                'Add at least one step with a 3rd party app or an HTTP request to perform the Action.',
            ),
        ).toBeInTheDocument()
        expect(screen.queryByText('Save changes')).not.toBeInTheDocument()

        act(() => {
            fireEvent.click(screen.getByText('close'))
        })

        expect(
            screen.queryByText(
                'Add at least one step with a 3rd party app or an HTTP request to perform the Action.',
            ),
        ).not.toBeInTheDocument()
        expect(screen.getByText('Save changes')).toBeInTheDocument()
    })

    it('should handle server validation errors during save', async () => {
        // This integration test executes the actual error handling code path
        // to ensure server validation errors are properly mapped and displayed

        const serverValidationError = {
            response: {
                status: 400,
                data: {
                    message: [
                        'steps.0.settings.template: output "{{age}}" not closed, line:5, col:1',
                    ],
                },
            },
        }

        const mockEditAction = jest
            .fn()
            .mockRejectedValue(serverValidationError)
        const mockAppDispatch = jest.fn()
        const mockVisualBuilderDispatch = jest.fn()

        mockUseUpsertAction.mockReturnValue({
            isLoading: false,
            mutateAsync: mockEditAction,
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAction>)

        mockUseAppDispatch.mockReturnValue(mockAppDispatch)

        // Create a proper visual builder graph for this test
        const visualBuilderGraph = computeNodesPositions(
            transformWorkflowConfigurationIntoVisualBuilderGraph<LLMPromptTriggerNodeType>(
                configuration,
                false,
            ),
        )

        // Spy on the visual builder reducer for this specific test
        const useVisualBuilderGraphReducerSpy = jest
            .spyOn(
                require('pages/automate/workflows/hooks/useVisualBuilderGraphReducer'),
                'useVisualBuilderGraphReducer',
            )
            .mockReturnValue([visualBuilderGraph, mockVisualBuilderDispatch])

        // Mock that server errors were successfully mapped to graph - use visual builder graph structure
        const graphWithMappedErrors = {
            ...visualBuilderGraph,
            nodes: visualBuilderGraph.nodes.map((node, index) =>
                index === 0
                    ? {
                          ...node,
                          data: {
                              ...node.data,
                              errors: {
                                  template:
                                      'output "{{age}}" not closed, line:5, col:1',
                              },
                          },
                      }
                    : node,
            ),
        }
        mockServerValidationErrors.mapServerErrorsToGraph.mockReturnValue(
            graphWithMappedErrors as any,
        )

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={queryClient}>
                    <EditActionView configuration={configuration} />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/app/ai-agent/:shopType/:shopName/actions/edit/:id',
                route: `/app/ai-agent/shopify/shopify-store/actions/edit/${configuration.id}`,
            },
        )

        // Trigger the save action that will cause error handling
        await act(async () => {
            fireEvent.click(screen.getByText('Save changes'))
        })

        // Verify mapServerErrorsToGraph was called (line 189)
        expect(
            mockServerValidationErrors.mapServerErrorsToGraph,
        ).toHaveBeenCalledWith(
            serverValidationError,
            visualBuilderGraph, // visualBuilderGraphDirty
        )

        // Verify that the graph was updated with server errors (line 196)
        expect(mockVisualBuilderDispatch).toHaveBeenCalledWith({
            type: 'RESET_GRAPH',
            graph: graphWithMappedErrors,
        })

        // Verify notification was dispatched (line 201)
        expect(mockAppDispatch).toHaveBeenCalledWith(
            notify({
                showDismissButton: true,
                status: NotificationStatus.Error,
                message: 'Please fix the validation errors below and try again',
            }),
        )

        // Verify editAction was called but failed
        expect(mockEditAction).toHaveBeenCalled()

        // The handleSave function should return Promise.reject() (line 210)
        // which prevents navigation and keeps the user on the form

        // Clean up the spy
        useVisualBuilderGraphReducerSpy.mockRestore()
    })

    it('should handle generic server errors during save', async () => {
        // This integration test executes the actual error handling code path
        // to ensure generic errors are properly re-thrown

        const genericError = new Error('Network error')

        const mockEditAction = jest.fn().mockRejectedValue(genericError)

        mockUseUpsertAction.mockReturnValue({
            isLoading: false,
            mutateAsync: mockEditAction,
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAction>)

        // Mock that this is NOT a validation error (returns null)
        mockServerValidationErrors.mapServerErrorsToGraph.mockReturnValue(null)

        renderWithRouter(
            <Provider store={mockStore}>
                <QueryClientProvider client={queryClient}>
                    <EditActionView configuration={configuration} />
                </QueryClientProvider>
            </Provider>,
            {
                path: '/app/ai-agent/:shopType/:shopName/actions/edit/:id',
                route: `/app/ai-agent/shopify/shopify-store/actions/edit/${configuration.id}`,
            },
        )

        // Mock console.error to avoid noise in test output
        const originalConsoleError = console.error
        console.error = jest.fn()

        try {
            // Trigger the save action that will cause error handling
            await act(async () => {
                fireEvent.click(screen.getByText('Save changes'))
            })

            // Verify mapServerErrorsToGraph was called (line 189)
            expect(
                mockServerValidationErrors.mapServerErrorsToGraph,
            ).toHaveBeenCalledWith(
                genericError,
                expect.any(Object), // visualBuilderGraphDirty
            )

            // Verify editAction was called
            expect(mockEditAction).toHaveBeenCalled()

            // The error should be re-thrown (line 214) since mapServerErrorsToGraph returned null
            // This allows the useUpsertAction hook's onError to handle it with default behavior
        } finally {
            // Restore console.error
            console.error = originalConsoleError
        }
    })
})
