import { act, render as renderWithProviders } from '@repo/testing'

// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import { useFlag } from '@repo/feature-flags'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { produce } from 'immer'
import { fromJS } from 'immutable'
import { useLocation } from 'react-router-dom'
import { ulid } from 'ulidx'

import { integrationsState } from 'fixtures/integrations'
import { useFindAllGuidancesKnowledgeResources } from 'models/knowledgeService/queries'
import {
    useGetStoreApps,
    useGetStoreWorkflowsConfigurations,
    useGetWorkflowConfigurationTemplates,
    useListActionsApps,
} from 'models/workflows/queries'
import { useAddStoreApp } from 'pages/aiAgent/actions/hooks/useAddStoreApp'
import { useDeleteAction } from 'pages/aiAgent/actions/hooks/useDeleteAction'
import { useThreeplIntegrations } from 'pages/aiAgent/actions/hooks/useThreeplIntegrations'
import { useUpsertAction } from 'pages/aiAgent/actions/hooks/useUpsertAction'
import { useAiAgentEnabled } from 'pages/aiAgent/hooks/useAiAgentEnabled'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { usePlaygroundPanel } from 'pages/aiAgent/hooks/usePlaygroundPanel'
import { useApps } from 'pages/automate/actionsPlatform/hooks/useApps'
import { computeNodesPositions } from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer/utils'
import type { LLMPromptTriggerNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {
    transformWorkflowConfigurationIntoVisualBuilderGraph,
    WorkflowConfigurationBuilder,
} from 'pages/automate/workflows/models/workflowConfiguration.model'
import * as serverValidationErrors from 'pages/automate/workflows/utils/serverValidationErrors'

import { EditActionView } from '../EditActionView'

jest.mock('models/workflows/queries')
jest.mock('models/knowledgeService/queries')
jest.mock('pages/aiAgent/actions/hooks/useUpsertAction')
jest.mock('pages/aiAgent/actions/hooks/useDeleteAction')
jest.mock('pages/automate/actionsPlatform/hooks/useApps')
jest.mock('pages/aiAgent/hooks/useAiAgentEnabled')
jest.mock('pages/aiAgent/actions/hooks/useAddStoreApp')
jest.mock('pages/aiAgent/actions/hooks/useThreeplIntegrations')
jest.mock('@repo/feature-flags')
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
const mockUseGetStoreApps = jest.mocked(useGetStoreApps)
const mockuse3plIntegrations = jest.mocked(useThreeplIntegrations)
const mockUseAddStoreApp = jest.mocked(useAddStoreApp)
const mockUseFlag = jest.mocked(useFlag)
const mockUseGetStoreWorkflowsConfigurations = jest.mocked(
    useGetStoreWorkflowsConfigurations,
)
const mockUseListActionsApps = jest.mocked(useListActionsApps)
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
const LocationPath = () => {
    const location = useLocation()

    return <div>{location.pathname}</div>
}
const defaultStoreState = {
    integrations: fromJS(integrationsState),
}
type RenderOptions = NonNullable<Parameters<typeof renderWithProviders>[1]>
const render = (
    ui: Parameters<typeof renderWithProviders>[0],
    options?: RenderOptions,
) =>
    renderWithProviders(ui, {
        ...options,
        storeState: {
            ...defaultStoreState,
            ...options?.storeState,
        },
    })
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
                is_standalone: true,
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
        render(
            <>
                {' '}
                <EditActionView configuration={configuration} />{' '}
                <LocationPath />{' '}
            </>,
            {},
        )
        expect(screen.getByText('Save changes')).toBeInTheDocument()
    })
    // Anchors come from `copilotAnchorProps` (@gorgias/copilot), mocked
    // wholesale in tests/setup.tsx. The real export ships on the unpublished
    // SDK branch, so the source typechecks only once the catalog bumps past
    // 0.66.1.
    it('renders the support-action entity, configuration, and status anchors', () => {
        const { container } = render(
            <>
                {' '}
                <EditActionView configuration={configuration} />{' '}
                <LocationPath />{' '}
            </>,
            {},
        )

        expect(
            container.querySelector(
                `[data-copilot-anchor="support-action:${configuration.id}"]`,
            ),
        ).toBeInTheDocument()
        expect(
            container.querySelector(
                `[data-copilot-anchor="support-action:${configuration.id}:configuration"]`,
            ),
        ).toBeInTheDocument()
        expect(
            container.querySelector(
                `[data-copilot-anchor="support-action:${configuration.id}:status"]`,
            ),
        ).toBeInTheDocument()
    })
    it('should redirect on "Back to support actions" click', () => {
        render(
            <>
                {' '}
                <EditActionView configuration={configuration} />{' '}
                <LocationPath />{' '}
            </>,
            {
                path: '/app/ai-agent/:shopType/:shopName/actions',
                initialEntries: [
                    `/app/ai-agent/shopify/shopify-store/actions/edit/${configuration.id}`,
                ],
            },
        )
        act(() => {
            fireEvent.click(screen.getByText('Back to support actions'))
        })
        expect(
            screen.getByText('/app/ai-agent/shopify/shopify-store/actions'),
        ).toBeInTheDocument()
    })
    it('should redirect on "View Events" click', () => {
        render(
            <>
                {' '}
                <EditActionView configuration={configuration} />{' '}
                <LocationPath />{' '}
            </>,
            {
                path: '/app/ai-agent/:shopType/:shopName/actions',
                initialEntries: [
                    `/app/ai-agent/shopify/shopify-store/actions/edit/${configuration.id}`,
                ],
            },
        )
        act(() => {
            fireEvent.click(screen.getByText('View Events'))
        })
        expect(
            screen.getByText(
                `/app/ai-agent/shopify/shopify-store/actions/events/${configuration.id}`,
            ),
        ).toBeInTheDocument()
    })
    it('should redirect on "Cancel" click', () => {
        render(
            <>
                {' '}
                <EditActionView configuration={configuration} />{' '}
                <LocationPath />{' '}
            </>,
            {
                path: '/app/ai-agent/:shopType/:shopName/actions',
                initialEntries: [
                    `/app/ai-agent/shopify/shopify-store/actions/edit/${configuration.id}`,
                ],
            },
        )
        act(() => {
            fireEvent.click(screen.getByText('Cancel'))
        })
        expect(
            screen.getByText('/app/ai-agent/shopify/shopify-store/actions'),
        ).toBeInTheDocument()
    })
    it('should not redirect after successful edit (stays on edit page)', async () => {
        mockUseUpsertAction.mockReturnValue({
            isLoading: false,
            mutateAsync: jest.fn(),
            isSuccess: true,
        } as unknown as ReturnType<typeof useUpsertAction>)
        render(
            <>
                {' '}
                <EditActionView configuration={configuration} />{' '}
                <LocationPath />{' '}
            </>,
            {
                path: '/app/ai-agent/:shopType/:shopName/actions',
                initialEntries: [
                    `/app/ai-agent/shopify/shopify-store/actions/edit/${configuration.id}`,
                ],
            },
        )
        await waitFor(() => {
            expect(
                screen.getByText(
                    `/app/ai-agent/shopify/shopify-store/actions/edit/${configuration.id}`,
                ),
            ).toBeInTheDocument()
        })
    })
    it('should open playground panel when "Save and test" succeeds', async () => {
        const mockUpsertAction = jest.fn().mockResolvedValue({ success: true })
        const mockOpenPlayground = jest.fn()
        let isSuccess = false
        mockUseUpsertAction.mockImplementation(
            () =>
                ({
                    isLoading: false,
                    mutateAsync: mockUpsertAction.mockImplementation(
                        async (...__) => {
                            isSuccess = true
                            return { success: true }
                        },
                    ),
                    get isSuccess() {
                        return isSuccess
                    },
                }) as any,
        )
        mockUsePlaygroundPanel.mockReturnValue({
            openPlayground: mockOpenPlayground,
            closePlayground: jest.fn(),
        } as unknown as ReturnType<typeof usePlaygroundPanel>)
        const { rerender } = render(
            <EditActionView configuration={configuration} />,
            {
                path: '/app/ai-agent/:shopType/:shopName/actions',
                initialEntries: [
                    `/app/ai-agent/shopify/shopify-store/actions/edit/${configuration.id}`,
                ],
            },
        )
        await act(async () => {
            fireEvent.click(screen.getByText('Save and test'))
        })
        mockUseUpsertAction.mockReturnValue({
            isLoading: false,
            mutateAsync: mockUpsertAction,
            isSuccess: true,
        } as unknown as ReturnType<typeof useUpsertAction>)
        rerender(<EditActionView configuration={configuration} />)
        await waitFor(() => {
            expect(mockOpenPlayground).toHaveBeenCalled()
        })
    })
    it('should not open playground panel when "Save changes" succeeds (not "Save and test")', async () => {
        const mockUpsertAction = jest.fn().mockResolvedValue({ success: true })
        const mockOpenPlayground = jest.fn()
        mockUseUpsertAction.mockReturnValue({
            isLoading: false,
            mutateAsync: mockUpsertAction,
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAction>)
        mockUsePlaygroundPanel.mockReturnValue({
            openPlayground: mockOpenPlayground,
            closePlayground: jest.fn(),
        } as unknown as ReturnType<typeof usePlaygroundPanel>)
        const { rerender } = render(
            <EditActionView configuration={configuration} />,
            {
                path: '/app/ai-agent/:shopType/:shopName/actions',
                initialEntries: [
                    `/app/ai-agent/shopify/shopify-store/actions/edit/${configuration.id}`,
                ],
            },
        )
        await act(async () => {
            fireEvent.click(screen.getByText('Save changes'))
        })
        mockUseUpsertAction.mockReturnValue({
            isLoading: false,
            mutateAsync: mockUpsertAction,
            isSuccess: true,
        } as unknown as ReturnType<typeof useUpsertAction>)
        rerender(<EditActionView configuration={configuration} />)
        await waitFor(() => {
            expect(mockOpenPlayground).not.toHaveBeenCalled()
        })
    })
    it('should not open playground panel when isEditActionSuccess is true but no button was clicked', async () => {
        const mockOpenPlayground = jest.fn()
        mockUseUpsertAction.mockReturnValue({
            isLoading: false,
            mutateAsync: jest.fn(),
            isSuccess: true,
        } as unknown as ReturnType<typeof useUpsertAction>)
        mockUsePlaygroundPanel.mockReturnValue({
            openPlayground: mockOpenPlayground,
            closePlayground: jest.fn(),
        } as unknown as ReturnType<typeof usePlaygroundPanel>)
        render(
            <>
                {' '}
                <EditActionView configuration={configuration} />{' '}
                <LocationPath />{' '}
            </>,
            {
                path: '/app/ai-agent/:shopType/:shopName/actions',
                initialEntries: [
                    `/app/ai-agent/shopify/shopify-store/actions/edit/${configuration.id}`,
                ],
            },
        )
        await waitFor(() => {
            expect(mockOpenPlayground).not.toHaveBeenCalled()
        })
    })
    it('should redirect to actions on delete success', async () => {
        mockUseDeleteAction.mockReturnValue({
            isLoading: false,
            mutateAsync: jest.fn(),
            isSuccess: true,
        } as unknown as ReturnType<typeof useDeleteAction>)
        render(
            <>
                {' '}
                <EditActionView configuration={configuration} />{' '}
                <LocationPath />{' '}
            </>,
            {
                path: '/app/ai-agent/:shopType/:shopName/actions',
                initialEntries: [
                    `/app/ai-agent/shopify/shopify-store/actions/edit/${configuration.id}`,
                ],
            },
        )
        await waitFor(() => {
            expect(
                screen.getByText('/app/ai-agent/shopify/shopify-store/actions'),
            ).toBeInTheDocument()
        })
    })
    it('should disable "Save and test" button if action is disabled', () => {
        render(
            <EditActionView
                configuration={produce(configuration, (draft) => {
                    if (draft.entrypoints) {
                        draft.entrypoints[0].deactivated_datetime =
                            new Date().toISOString()
                    }
                })}
            />,
            {},
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
        render(
            <>
                {' '}
                <EditActionView configuration={configuration} />{' '}
                <LocationPath />{' '}
            </>,
            {},
        )
        expect(
            screen.getByRole('button', { name: /Save changes/ }),
        ).toBeAriaDisabled()
        expect(
            screen.getByRole('button', { name: /Save and test/ }),
        ).toBeAriaDisabled()
    })
    it('should display errors', async () => {
        const mockUpsertAction = jest.fn()
        mockUseUpsertAction.mockReturnValue({
            isLoading: false,
            mutateAsync: mockUpsertAction,
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAction>)
        render(
            <>
                {' '}
                <EditActionView configuration={configuration} />{' '}
                <LocationPath />{' '}
            </>,
            {},
        )
        act(() => {
            fireEvent.change(screen.getByDisplayValue('Action name'), {
                target: { value: '' },
            })
        })
        act(() => {
            fireEvent.click(screen.getByText('Save changes'))
        })
        expect(
            await screen.findByRole('status', {
                name: 'Fix errors in order to save Action',
            }),
        ).toBeInTheDocument()
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
        render(
            <>
                {' '}
                <EditActionView configuration={configuration} />{' '}
                <LocationPath />{' '}
            </>,
            {
                path: '/app/ai-agent/:shopType/:shopName/actions',
                initialEntries: [
                    `/app/ai-agent/shopify/shopify-store/actions/edit/${configuration.id}`,
                ],
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
        render(
            <>
                {' '}
                <EditActionView configuration={configuration} />{' '}
                <LocationPath />{' '}
            </>,
            {},
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
        const mockVisualBuilderDispatch = jest.fn()
        mockUseUpsertAction.mockReturnValue({
            isLoading: false,
            mutateAsync: mockEditAction,
            isSuccess: false,
        } as unknown as ReturnType<typeof useUpsertAction>)
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
        render(
            <>
                {' '}
                <EditActionView configuration={configuration} />{' '}
                <LocationPath />{' '}
            </>,
            {
                path: '/app/ai-agent/:shopType/:shopName/actions',
                initialEntries: [
                    `/app/ai-agent/shopify/shopify-store/actions/edit/${configuration.id}`,
                ],
            },
        )
        // Trigger the save action that will cause error handling
        await act(async () => {
            fireEvent.click(screen.getByText('Save changes'))
        })
        // Verify mapServerErrorsToGraph was called (line 189)
        expect(
            mockServerValidationErrors.mapServerErrorsToGraph,
        ).toHaveBeenCalledWith(serverValidationError, visualBuilderGraph)
        // Verify that the graph was updated with server errors (line 196)
        expect(mockVisualBuilderDispatch).toHaveBeenCalledWith({
            type: 'RESET_GRAPH',
            graph: graphWithMappedErrors,
        })
        expect(
            await screen.findByRole('status', {
                name: 'Please fix the validation errors below and try again',
            }),
        ).toBeInTheDocument()
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
        render(
            <>
                {' '}
                <EditActionView configuration={configuration} />{' '}
                <LocationPath />{' '}
            </>,
            {
                path: '/app/ai-agent/:shopType/:shopName/actions',
                initialEntries: [
                    `/app/ai-agent/shopify/shopify-store/actions/edit/${configuration.id}`,
                ],
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
            ).toHaveBeenCalledWith(genericError, expect.any(Object))
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
