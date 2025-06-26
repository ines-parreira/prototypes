import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen, within } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { IntegrationType } from 'models/integration/constants'
import useApps from 'pages/automate/actionsPlatform/hooks/useApps'
import useGetAppFromTemplateApp from 'pages/automate/actionsPlatform/hooks/useGetAppFromTemplateApp'
import {
    ActionsApp,
    ActionTemplate,
    App,
} from 'pages/automate/actionsPlatform/types'
import { StoreIntegrationContext } from 'pages/automate/common/hooks/useSelfServiceStoreIntegration'
import { VisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import { WorkflowChannelSupportContext } from 'pages/automate/workflows/hooks/useWorkflowChannelSupport'
import { VisualBuilderGraph } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouterAndDnD } from 'utils/testing'

import { SimplifiedStepBuilder } from '../SimplifiedStepBuilder'

jest.mock('pages/automate/actionsPlatform/hooks/useApps')
jest.mock('pages/automate/actionsPlatform/hooks/useGetAppFromTemplateApp')
jest.mock(
    'pages/automate/workflows/editor/visualBuilder/editors/ReusableLLMPromptCallEditor',
    () => {
        const {
            useNodeEditorDrawerContext,
            // eslint-disable-next-line @typescript-eslint/no-var-requires
        } = require('pages/automate/workflows/editor/visualBuilder/NodeEditorDrawerContext')
        return {
            __esModule: true,
            default: () => {
                // eslint-disable-next-line react-hooks/rules-of-hooks, @typescript-eslint/no-unsafe-call
                const { onClose } = useNodeEditorDrawerContext()
                return (
                    <div data-testid="reusable-llm-prompt-call-editor">
                        <button
                            data-testid="node-editor-close-drawer"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                )
            },
        }
    },
)

jest.mock('../../providers/StoreAppsProvider', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

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
    contextDispatch = jest.fn(),
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
        </Provider>,
    )
}

describe('SimplifiedStepBuilder', () => {
    const mockDispatch = jest.fn()
    const mockContextDispatch = jest.fn()

    const defaultGraph = {
        nodes: [
            {
                id: 'start',
                type: 'channel_trigger',
                position: { x: 0, y: 0 },
                data: {
                    label: 'Start',
                    label_tkey: 'start',
                },
            },
            {
                id: 'node1',
                type: 'reusable_llm_prompt_call',
                position: { x: 0, y: 100 },
                data: {
                    configuration_id: 'config1',
                    values: {},
                    configuration_internal_id: 'internal1',
                },
            },
        ],
        edges: [
            {
                id: 'edge1',
                source: 'start',
                target: 'node1',
            },
        ],
        name: 'Test Graph',
    } as unknown as VisualBuilderGraph

    const defaultSteps: ActionTemplate[] = [
        {
            id: 'config1',
            internal_id: 'internal1',
            name: 'Test Step',
            is_draft: false,
            initial_step_id: 'step1',
            steps: [],
            apps: [
                {
                    type: IntegrationType.App,
                    app_id: 'test-app',
                },
            ],
            inputs: [],
            transitions: [],
            available_languages: [],
            created_datetime: '2023-01-01T00:00:00Z',
            updated_datetime: '2023-01-01T00:00:00Z',
            entrypoints: [],
            triggers: [],
        },
    ]

    beforeEach(() => {
        const testApp: App = {
            id: 'test-app',
            name: 'Test App',
            icon: 'test-icon',
            type: IntegrationType.App,
        }
        const testActionsApp: ActionsApp = {
            id: 'test-app',
            auth_type: 'api-key',
            auth_settings: {},
        }

        mockUseApps.mockReturnValue({
            apps: [testApp],
            actionsApps: [testActionsApp],
            isLoading: false,
        })

        mockUseGetAppFromTemplateApp.mockReturnValue(() => testApp)

        mockDispatch.mockClear()
        mockContextDispatch.mockClear()
    })

    it('renders without crashing', () => {
        renderWithProviders(
            <SimplifiedStepBuilder
                graph={defaultGraph}
                dispatch={mockDispatch}
                steps={defaultSteps}
                shopName="test-store"
                shopType="shopify"
            />,
            defaultGraph,
            mockContextDispatch,
        )
        expect(screen.getByText('Action steps')).toBeInTheDocument()
    })

    it('displays the correct number of steps', () => {
        renderWithProviders(
            <SimplifiedStepBuilder
                graph={defaultGraph}
                dispatch={mockDispatch}
                steps={defaultSteps}
                shopName="test-store"
                shopType="shopify"
            />,
            defaultGraph,
            mockContextDispatch,
        )
        const stepList = screen.getByRole('list')
        const stepItems = within(stepList).getAllByText(
            /test step in test app/i,
        )
        expect(stepItems).toHaveLength(1)
    })

    it('shows warning when authentication is required', () => {
        const graphWithMissingAuth: VisualBuilderGraph = {
            ...defaultGraph,
            apps: [
                {
                    type: IntegrationType.App,
                    app_id: 'test-app',
                    api_key: '',
                },
            ],
        }

        renderWithProviders(
            <SimplifiedStepBuilder
                graph={graphWithMissingAuth}
                dispatch={mockDispatch}
                steps={defaultSteps}
                shopName="test-store"
                shopType="shopify"
            />,
            graphWithMissingAuth,
            mockContextDispatch,
        )

        expect(screen.getByText(/provide authentication/i)).toBeInTheDocument()
    })

    it('shows warning when values are missing', () => {
        const stepsWithInputs: ActionTemplate[] = [
            {
                ...defaultSteps[0],
                inputs: [
                    {
                        id: 'input1',
                        name: 'Input 1',
                        description: 'Input 1 description',
                        data_type: 'string',
                    },
                ],
            },
        ]

        renderWithProviders(
            <SimplifiedStepBuilder
                graph={defaultGraph}
                dispatch={mockDispatch}
                steps={stepsWithInputs}
                shopName="test-store"
                shopType="shopify"
            />,
            defaultGraph,
            mockContextDispatch,
        )

        expect(screen.getByText(/provide values/i)).toBeInTheDocument()
    })

    it('filters apps that have no steps', () => {
        const appsWithNoSteps: App[] = [
            {
                id: 'app-with-no-steps',
                type: IntegrationType.App,
                name: 'App with no steps',
                icon: '',
            },
            {
                id: 'shopify',
                type: IntegrationType.App,
                name: 'Shopify',
                icon: '',
            },
        ]

        mockUseApps.mockReturnValue({
            isLoading: false,
            apps: appsWithNoSteps,
            actionsApps: [],
        })

        renderWithProviders(
            <SimplifiedStepBuilder
                graph={defaultGraph}
                dispatch={mockDispatch}
                steps={defaultSteps}
                shopName="test-store"
                shopType="shopify"
            />,
            defaultGraph,
            mockContextDispatch,
        )

        // Open dropdown
        fireEvent.click(screen.getByText('Add Step'))

        // App with no steps should not be shown
        expect(screen.queryByText('App with no steps')).not.toBeInTheDocument()
    })

    it('shows both warnings when values and authentication are missing', () => {
        const stepsWithInputs: ActionTemplate[] = [
            {
                ...defaultSteps[0],
                inputs: [
                    {
                        id: 'input1',
                        name: 'Input 1',
                        description: 'Input 1 description',
                        data_type: 'string',
                    },
                ],
            },
        ]

        const graphWithMissingAuth: VisualBuilderGraph = {
            ...defaultGraph,
            apps: [
                {
                    type: IntegrationType.App,
                    app_id: 'test-app',
                    api_key: '',
                },
            ],
        }

        renderWithProviders(
            <SimplifiedStepBuilder
                graph={graphWithMissingAuth}
                dispatch={mockDispatch}
                steps={stepsWithInputs}
                shopName="test-store"
                shopType="shopify"
            />,
            graphWithMissingAuth,
            mockContextDispatch,
        )

        expect(
            screen.getByText(/provide values and authentication/i),
        ).toBeInTheDocument()
    })

    it('handles step deletion', () => {
        renderWithProviders(
            <SimplifiedStepBuilder
                graph={defaultGraph}
                dispatch={mockDispatch}
                steps={defaultSteps}
                shopName="test-store"
                shopType="shopify"
            />,
            defaultGraph,
            mockContextDispatch,
        )

        const deleteIcon = screen.getByRole('button', { name: 'Delete step' })
        fireEvent.click(deleteIcon)

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_NODE_EDITING_ID',
            nodeId: 'node1',
        })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'DELETE_NODE',
            nodeId: 'node1',
            steps: defaultSteps,
            apps: [
                {
                    type: IntegrationType.App,
                    id: 'test-app',
                    name: 'Test App',
                    icon: 'test-icon',
                },
            ],
        })
    })

    it('opens app selector dropdown when Add Step is clicked', () => {
        renderWithProviders(
            <SimplifiedStepBuilder
                graph={defaultGraph}
                dispatch={mockDispatch}
                steps={defaultSteps}
                shopName="test-store"
                shopType="shopify"
            />,
            defaultGraph,
            mockContextDispatch,
        )

        const addStepButton = screen.getByRole('button', { name: /add step/i })
        fireEvent.click(addStepButton)

        expect(screen.getByTestId('floating-overlay')).toBeInTheDocument()
    })

    it('filters apps correctly based on available steps', () => {
        mockUseApps.mockReturnValue({
            apps: [
                {
                    id: 'test-app',
                    auth_type: 'api-key',
                    auth_settings: {},
                    name: 'Test App',
                    icon: 'test-icon',
                    type: IntegrationType.Shopify,
                },
                {
                    id: 'unused-app',
                    auth_type: 'api-key',
                    auth_settings: {},
                    name: 'Unused App',
                    icon: 'test-icon',
                    type: IntegrationType.Shopify,
                },
            ],
            actionsApps: [
                {
                    id: 'test-app',
                    auth_type: 'api-key',
                    auth_settings: {},
                    name: 'Test App',
                },
            ],
            isLoading: false,
            error: null,
        } as any)

        const stepsWithMultipleApps: ActionTemplate[] = [
            {
                id: 'config1',
                internal_id: 'internal1',
                name: 'Test Step 1',
                is_draft: false,
                initial_step_id: 'step1',
                steps: [],
                apps: [
                    {
                        type: IntegrationType.App,
                        app_id: 'test-app',
                    },
                ],
                inputs: [],
                transitions: [],
                available_languages: [],
                created_datetime: '2023-01-01T00:00:00Z',
                updated_datetime: '2023-01-01T00:00:00Z',
                entrypoints: [],
                triggers: [],
            },
            {
                id: 'config2',
                internal_id: 'internal2',
                name: 'Test Step 2',
                is_draft: false,
                initial_step_id: 'step2',
                steps: [],
                apps: [
                    {
                        type: IntegrationType.App,
                        app_id: 'unused-app',
                    },
                ],
                inputs: [],
                transitions: [],
                available_languages: [],
                created_datetime: '2023-01-01T00:00:00Z',
                updated_datetime: '2023-01-01T00:00:00Z',
                entrypoints: [],
                triggers: [],
            },
        ]

        renderWithProviders(
            <SimplifiedStepBuilder
                graph={defaultGraph}
                dispatch={mockDispatch}
                steps={stepsWithMultipleApps}
                shopName="test-store"
                shopType="shopify"
            />,
            defaultGraph,
            mockContextDispatch,
        )

        const addStepButton = screen.getByRole('button', { name: /add step/i })
        fireEvent.click(addStepButton)

        const dropdown = screen.getByTestId('floating-overlay')
        expect(dropdown).toBeInTheDocument()

        expect(screen.getByText(/Test Step 1 in Test App/i)).toBeInTheDocument()
        expect(
            screen.queryByText(/Test Step 2 in Unused App/i),
        ).not.toBeInTheDocument()
    })

    it('handles empty steps array', () => {
        renderWithProviders(
            <SimplifiedStepBuilder
                graph={defaultGraph}
                dispatch={mockDispatch}
                steps={[]}
                shopName="test-store"
                shopType="shopify"
            />,
            defaultGraph,
            mockContextDispatch,
        )

        expect(screen.getByText(/Add one or more steps/i)).toBeInTheDocument()
    })

    it('validates required inputs before saving', () => {
        const stepsWithRequiredInputs: ActionTemplate[] = [
            {
                ...defaultSteps[0],
                inputs: [
                    {
                        id: 'input1',
                        name: 'Required Input',
                        description: 'This input is required',
                        data_type: 'string',
                    },
                ],
            },
        ]

        renderWithProviders(
            <SimplifiedStepBuilder
                graph={defaultGraph}
                dispatch={mockDispatch}
                steps={stepsWithRequiredInputs}
                shopName="test-store"
                shopType="shopify"
            />,
            defaultGraph,
            mockContextDispatch,
        )

        expect(screen.getByText(/provide values/i)).toBeInTheDocument()
    })

    it('handles app authentication state changes', () => {
        const initialGraph = {
            ...defaultGraph,
            apps: [
                {
                    type: IntegrationType.App,
                    app_id: 'test-app',
                    api_key: 'valid-key',
                },
            ],
        } as unknown as VisualBuilderGraph

        renderWithProviders(
            <SimplifiedStepBuilder
                graph={initialGraph}
                dispatch={mockDispatch}
                steps={defaultSteps}
                shopName="test-store"
                shopType="shopify"
            />,
            initialGraph,
            mockContextDispatch,
        )

        expect(
            screen.queryByText(/provide authentication/i),
        ).not.toBeInTheDocument()

        const graphWithInvalidAuth = {
            ...initialGraph,
            apps: [
                {
                    type: IntegrationType.App,
                    app_id: 'test-app',
                    api_key: '',
                },
            ],
        } as unknown as VisualBuilderGraph

        renderWithProviders(
            <SimplifiedStepBuilder
                graph={graphWithInvalidAuth}
                dispatch={mockDispatch}
                steps={defaultSteps}
                shopName="test-store"
                shopType="shopify"
            />,
            graphWithInvalidAuth,
            mockContextDispatch,
        )

        expect(screen.getByText(/provide authentication/i)).toBeInTheDocument()
    })

    it('handles step reordering', () => {
        const graphWithMultipleSteps = {
            ...defaultGraph,
            nodes: [
                defaultGraph.nodes[0],
                {
                    id: 'node1',
                    type: 'reusable_llm_prompt_call',
                    position: { x: 0, y: 100 },
                    data: {
                        configuration_id: 'config1',
                        values: {},
                        configuration_internal_id: 'internal1',
                    },
                },
                {
                    id: 'node2',
                    type: 'reusable_llm_prompt_call',
                    position: { x: 0, y: 200 },
                    data: {
                        configuration_id: 'config2',
                        values: {},
                        configuration_internal_id: 'internal2',
                    },
                },
            ],
            edges: [
                {
                    id: 'edge1',
                    source: 'start',
                    target: 'node1',
                },
                {
                    id: 'edge2',
                    source: 'node1',
                    target: 'node2',
                },
            ],
        } as unknown as VisualBuilderGraph

        const { container } = renderWithProviders(
            <SimplifiedStepBuilder
                graph={graphWithMultipleSteps}
                dispatch={mockDispatch}
                steps={[
                    {
                        ...defaultSteps[0],
                        id: 'config1',
                        internal_id: 'internal1',
                        name: 'Step 1',
                    },
                    {
                        ...defaultSteps[0],
                        id: 'config2',
                        internal_id: 'internal2',
                        name: 'Step 2',
                    },
                ]}
                shopName="test-store"
                shopType="shopify"
            />,
            graphWithMultipleSteps,
            mockContextDispatch,
        )

        // Find the draggable items
        const stepItems = container.querySelectorAll('[draggable="true"]')
        expect(stepItems).toHaveLength(2)

        // Simulate drag and drop with proper coordinates
        const dragElement = stepItems[1] as HTMLElement
        const dropElement = stepItems[0] as HTMLElement

        // Get bounding rectangles for realistic coordinates
        const dragRect = dragElement.getBoundingClientRect()

        const clientX = dragRect.left + dragRect.width / 2
        const clientY = dragRect.top + dragRect.height / 2

        fireEvent.dragStart(dragElement, { clientX, clientY })
        fireEvent.dragEnter(dropElement, { clientX, clientY })
        fireEvent.dragOver(dropElement, { clientX, clientY })
        fireEvent.drop(dropElement, { clientX, clientY })

        // Verify the dispatch was called with the correct reordering action
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'REORDER_REUSABLE_LLM_PROMPT_CALL_NODE',
            nodeIds: ['node2', 'node1'],
        })
    })

    it('handles invalid drag and drop operations', () => {
        const graphWithMultipleSteps = {
            ...defaultGraph,
            nodes: [
                defaultGraph.nodes[0],
                {
                    id: 'node1',
                    type: 'reusable_llm_prompt_call',
                    position: { x: 0, y: 100 },
                    data: {
                        configuration_id: 'config1',
                        values: {},
                        configuration_internal_id: 'internal1',
                    },
                },
            ],
            edges: [
                {
                    id: 'edge1',
                    source: 'start',
                    target: 'node1',
                },
            ],
        } as unknown as VisualBuilderGraph

        const { container } = renderWithProviders(
            <SimplifiedStepBuilder
                graph={graphWithMultipleSteps}
                dispatch={mockDispatch}
                steps={[
                    {
                        ...defaultSteps[0],
                        id: 'config1',
                        internal_id: 'internal1',
                        name: 'Step 1',
                    },
                ]}
                shopName="test-store"
                shopType="shopify"
            />,
            graphWithMultipleSteps,
            mockContextDispatch,
        )

        // Find the drag handle
        const dragHandle = container.querySelector('.dragIcon')
        expect(dragHandle).toBeTruthy()

        // Simulate invalid drag and drop
        const dragStartEvent = new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            clientX: 0,
            clientY: 0,
        })
        dragHandle!.dispatchEvent(dragStartEvent)

        const dragEvent = new MouseEvent('mousemove', {
            bubbles: true,
            cancelable: true,
            clientX: 100,
            clientY: 100, // Move to invalid target
        })
        document.dispatchEvent(dragEvent)

        const dropEvent = new MouseEvent('mouseup', {
            bubbles: true,
            cancelable: true,
            clientX: 100,
            clientY: 100,
        })
        container.dispatchEvent(dropEvent)

        // Verify no reordering dispatch was called
        expect(mockDispatch).not.toHaveBeenCalledWith({
            type: 'REORDER_REUSABLE_LLM_PROMPT_CALL_NODE',
            nodeIds: expect.any(Array),
        })
    })

    it('closes NodeEditorDrawer when onClose is called', async () => {
        const graphWithEditingNode = {
            ...defaultGraph,
            nodeEditingId: 'node1',
            nodes: [
                {
                    id: 'node1',
                    type: 'reusable_llm_prompt_call',
                    position: { x: 0, y: 100 },
                    data: {
                        configuration_id: 'config1',
                        values: {},
                        configuration_internal_id: 'internal1',
                    },
                },
            ],
        } as unknown as VisualBuilderGraph

        renderWithProviders(
            <SimplifiedStepBuilder
                graph={graphWithEditingNode}
                dispatch={mockDispatch}
                steps={defaultSteps}
                shopName="test-store"
                shopType="shopify"
            />,
            graphWithEditingNode,
            mockContextDispatch,
        )

        // Find and click the drawer close button
        const closeButton = await screen.findByTestId(
            'node-editor-close-drawer',
        )
        fireEvent.click(closeButton)

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'CLOSE_EDITOR',
        })
    })

    it('toggles app selector dropdown state correctly', () => {
        renderWithProviders(
            <SimplifiedStepBuilder
                graph={defaultGraph}
                dispatch={mockDispatch}
                steps={defaultSteps}
                shopName="test-store"
                shopType="shopify"
            />,
            defaultGraph,
            mockContextDispatch,
        )

        expect(screen.queryByTestId('floating-overlay')).not.toBeInTheDocument()

        const addStepButton = screen.getByRole('button', { name: /add step/i })
        fireEvent.click(addStepButton)
        expect(screen.getByTestId('floating-overlay')).toBeInTheDocument()

        const dropdown = screen.getByTestId('floating-overlay')
        fireEvent.keyDown(dropdown, { key: 'Escape' })
        expect(screen.queryByTestId('floating-overlay')).not.toBeInTheDocument()
    })

    it('closes advanced view modal when close button is clicked', async () => {
        renderWithProviders(
            <SimplifiedStepBuilder
                graph={defaultGraph}
                dispatch={mockDispatch}
                steps={defaultSteps}
                shopName="test-store"
                shopType="shopify"
            />,
            defaultGraph,
            mockContextDispatch,
        )

        // Open the advanced view modal
        const advancedButton = screen.getByRole('button', {
            name: /advanced options/i,
        })
        fireEvent.click(advancedButton)

        // Verify modal is open
        expect(screen.getByRole('dialog')).toBeInTheDocument()

        // Close the modal
        const closeButton = screen.getByRole('button', {
            name: /back to editing/i,
        })
        fireEvent.click(closeButton)

        // Wait for modal animation to complete
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Verify modal is closed
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('handles step click', () => {
        const mockDispatch = jest.fn()
        const graph = {
            ...defaultGraph,
            nodes: [
                defaultGraph.nodes[0],
                {
                    id: 'node1',
                    type: 'reusable_llm_prompt_call',
                    position: { x: 0, y: 100 },
                    data: {
                        configuration_id: 'config1',
                        values: {},
                        configuration_internal_id: 'internal1',
                    },
                },
            ],
            edges: [
                {
                    id: 'edge1',
                    source: 'start',
                    target: 'node1',
                },
            ],
        } as unknown as VisualBuilderGraph

        renderWithProviders(
            <SimplifiedStepBuilder
                graph={graph}
                dispatch={mockDispatch}
                steps={[
                    {
                        ...defaultSteps[0],
                        id: 'config1',
                        internal_id: 'internal1',
                        name: 'Step 1',
                    },
                ]}
                shopName="test-store"
                shopType="shopify"
            />,
            graph,
            mockContextDispatch,
        )

        fireEvent.click(screen.getByText(/Step 1 in Test App/))

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_NODE_EDITING_ID',
            nodeId: 'node1',
        })
    })

    it('closes drawer editor when onDrawerEditorClose is called', async () => {
        const graphWithEditingNode = {
            ...defaultGraph,
            nodeEditingId: 'node1',
            nodes: [
                {
                    id: 'node1',
                    type: 'reusable_llm_prompt_call',
                    position: { x: 0, y: 100 },
                    data: {
                        configuration_id: 'config1',
                        values: {},
                        configuration_internal_id: 'internal1',
                    },
                },
            ],
        } as unknown as VisualBuilderGraph

        renderWithProviders(
            <SimplifiedStepBuilder
                graph={graphWithEditingNode}
                dispatch={mockDispatch}
                steps={defaultSteps}
                shopName="test-store"
                shopType="shopify"
            />,
            graphWithEditingNode,
            mockContextDispatch,
        )

        const closeButton = await screen.findByTestId(
            'node-editor-close-drawer',
        )
        fireEvent.click(closeButton)

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'CLOSE_EDITOR',
        })
    })

    it('handles step reordering with error nodes correctly', () => {
        const graphWithMultipleSteps = {
            ...defaultGraph,
            nodes: [
                defaultGraph.nodes[0], // trigger node
                {
                    id: 'node1',
                    type: 'reusable_llm_prompt_call',
                    position: { x: 0, y: 100 },
                    data: {
                        configuration_id: 'config1',
                        values: {},
                        configuration_internal_id: 'internal1',
                    },
                },
                {
                    id: 'error1',
                    type: 'end',
                    position: { x: 100, y: 100 },
                    data: { action: 'end-failure' },
                },
                {
                    id: 'node2',
                    type: 'reusable_llm_prompt_call',
                    position: { x: 0, y: 200 },
                    data: {
                        configuration_id: 'config2',
                        values: {},
                        configuration_internal_id: 'internal2',
                    },
                },
                {
                    id: 'error2',
                    type: 'end',
                    position: { x: 100, y: 200 },
                    data: { action: 'end-failure' },
                },
                {
                    id: 'success',
                    type: 'end',
                    position: { x: 0, y: 300 },
                    data: { action: 'end-success' },
                },
            ],
            edges: [
                {
                    id: 'edge1',
                    source: 'start',
                    target: 'node1',
                },
                {
                    id: 'edge2',
                    source: 'node1',
                    target: 'error1',
                    data: { name: 'Error' },
                },
                {
                    id: 'edge3',
                    source: 'node1',
                    target: 'node2',
                    data: {
                        name: 'Success',
                        conditions: {
                            and: [
                                {
                                    equals: [
                                        { var: 'steps_state.node1.success' },
                                        true,
                                    ],
                                },
                            ],
                        },
                    },
                },
                {
                    id: 'edge4',
                    source: 'node2',
                    target: 'error2',
                    data: { name: 'Error' },
                },
                {
                    id: 'edge5',
                    source: 'node2',
                    target: 'success',
                    data: {
                        name: 'Success',
                        conditions: {
                            and: [
                                {
                                    equals: [
                                        { var: 'steps_state.node2.success' },
                                        true,
                                    ],
                                },
                            ],
                        },
                    },
                },
            ],
        } as unknown as VisualBuilderGraph

        const { container } = renderWithProviders(
            <SimplifiedStepBuilder
                graph={graphWithMultipleSteps}
                dispatch={mockDispatch}
                shopName="test-store"
                shopType="shopify"
                steps={[
                    {
                        ...defaultSteps[0],
                        id: 'config1',
                        internal_id: 'internal1',
                        name: 'Step 1',
                    },
                    {
                        ...defaultSteps[0],
                        id: 'config2',
                        internal_id: 'internal2',
                        name: 'Step 2',
                    },
                ]}
            />,
            graphWithMultipleSteps,
            mockContextDispatch,
        )

        const stepItems = container.querySelectorAll('[draggable="true"]')
        expect(stepItems).toHaveLength(2)

        // Simulate drag and drop with proper coordinates
        const dragElement = stepItems[1] as HTMLElement
        const dropElement = stepItems[0] as HTMLElement

        // Get bounding rectangles for realistic coordinates
        const dragRect = dragElement.getBoundingClientRect()

        const clientX = dragRect.left + dragRect.width / 2
        const clientY = dragRect.top + dragRect.height / 2

        fireEvent.dragStart(dragElement, { clientX, clientY })
        fireEvent.dragEnter(dropElement, { clientX, clientY })
        fireEvent.dragOver(dropElement, { clientX, clientY })
        fireEvent.drop(dropElement, { clientX, clientY })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'REORDER_REUSABLE_LLM_PROMPT_CALL_NODE',
            nodeIds: ['node2', 'node1'],
        })
    })

    it('preserves error nodes and connections when reordering multiple steps', () => {
        const graphWithThreeSteps = {
            ...defaultGraph,
            nodes: [
                defaultGraph.nodes[0],
                {
                    id: 'node1',
                    type: 'reusable_llm_prompt_call',
                    position: { x: 0, y: 100 },
                    data: {
                        configuration_id: 'config1',
                        values: {},
                        configuration_internal_id: 'internal1',
                    },
                },
                {
                    id: 'error1',
                    type: 'end',
                    position: { x: 100, y: 100 },
                    data: { action: 'end-failure' },
                },
                {
                    id: 'node2',
                    type: 'reusable_llm_prompt_call',
                    position: { x: 0, y: 200 },
                    data: {
                        configuration_id: 'config2',
                        values: {},
                        configuration_internal_id: 'internal2',
                    },
                },
                {
                    id: 'error2',
                    type: 'end',
                    position: { x: 100, y: 200 },
                    data: { action: 'end-failure' },
                },
                {
                    id: 'node3',
                    type: 'reusable_llm_prompt_call',
                    position: { x: 0, y: 300 },
                    data: {
                        configuration_id: 'config3',
                        values: {},
                        configuration_internal_id: 'internal3',
                    },
                },
                {
                    id: 'error3',
                    type: 'end',
                    position: { x: 100, y: 300 },
                    data: { action: 'end-failure' },
                },
                {
                    id: 'success',
                    type: 'end',
                    position: { x: 0, y: 400 },
                    data: { action: 'end-success' },
                },
            ],
            edges: [
                {
                    id: 'edge1',
                    source: 'start',
                    target: 'node1',
                },
                {
                    id: 'edge2',
                    source: 'node1',
                    target: 'error1',
                    data: { name: 'Error' },
                },
                {
                    id: 'edge3',
                    source: 'node1',
                    target: 'node2',
                    data: {
                        name: 'Success',
                        conditions: {
                            and: [
                                {
                                    equals: [
                                        { var: 'steps_state.node1.success' },
                                        true,
                                    ],
                                },
                            ],
                        },
                    },
                },
                {
                    id: 'edge4',
                    source: 'node2',
                    target: 'error2',
                    data: { name: 'Error' },
                },
                {
                    id: 'edge5',
                    source: 'node2',
                    target: 'node3',
                    data: {
                        name: 'Success',
                        conditions: {
                            and: [
                                {
                                    equals: [
                                        { var: 'steps_state.node2.success' },
                                        true,
                                    ],
                                },
                            ],
                        },
                    },
                },
                {
                    id: 'edge6',
                    source: 'node3',
                    target: 'error3',
                    data: { name: 'Error' },
                },
                {
                    id: 'edge7',
                    source: 'node3',
                    target: 'success',
                    data: {
                        name: 'Success',
                        conditions: {
                            and: [
                                {
                                    equals: [
                                        { var: 'steps_state.node3.success' },
                                        true,
                                    ],
                                },
                            ],
                        },
                    },
                },
            ],
        } as unknown as VisualBuilderGraph

        const { container } = renderWithProviders(
            <SimplifiedStepBuilder
                graph={graphWithThreeSteps}
                dispatch={mockDispatch}
                shopName="test-store"
                shopType="shopify"
                steps={[
                    {
                        ...defaultSteps[0],
                        id: 'config1',
                        internal_id: 'internal1',
                        name: 'Step 1',
                    },
                    {
                        ...defaultSteps[0],
                        id: 'config2',
                        internal_id: 'internal2',
                        name: 'Step 2',
                    },
                    {
                        ...defaultSteps[0],
                        id: 'config3',
                        internal_id: 'internal3',
                        name: 'Step 3',
                    },
                ]}
            />,
            graphWithThreeSteps,
            mockContextDispatch,
        )

        // Find the draggable items
        const stepItems = container.querySelectorAll('[draggable="true"]')
        expect(stepItems).toHaveLength(3)

        // Simulate complex reordering: move last item to first position
        const dragElement = stepItems[2] as HTMLElement
        const dropElement = stepItems[0] as HTMLElement

        // Get bounding rectangles for realistic coordinates
        const dragRect = dragElement.getBoundingClientRect()

        const clientX = dragRect.left + dragRect.width / 2
        const clientY = dragRect.top + dragRect.height / 2

        fireEvent.dragStart(dragElement, { clientX, clientY })
        fireEvent.dragEnter(dropElement, { clientX, clientY })
        fireEvent.dragOver(dropElement, { clientX, clientY })
        fireEvent.drop(dropElement, { clientX, clientY })

        // Verify the dispatch was called with the correct reordering action
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'REORDER_REUSABLE_LLM_PROMPT_CALL_NODE',
            nodeIds: ['node3', 'node1', 'node2'],
        })
    })

    it('handles reordering when some steps have no error nodes', () => {
        const graphWithMixedSteps = {
            ...defaultGraph,
            nodes: [
                defaultGraph.nodes[0], // trigger node
                {
                    id: 'node1',
                    type: 'reusable_llm_prompt_call',
                    position: { x: 0, y: 100 },
                    data: {
                        configuration_id: 'config1',
                        values: {},
                        configuration_internal_id: 'internal1',
                    },
                },
                {
                    id: 'node2',
                    type: 'reusable_llm_prompt_call',
                    position: { x: 0, y: 200 },
                    data: {
                        configuration_id: 'config2',
                        values: {},
                        configuration_internal_id: 'internal2',
                    },
                },
                {
                    id: 'error2',
                    type: 'end',
                    position: { x: 100, y: 200 },
                    data: { action: 'end-failure' },
                },
                {
                    id: 'success',
                    type: 'end',
                    position: { x: 0, y: 300 },
                    data: { action: 'end-success' },
                },
            ],
            edges: [
                {
                    id: 'edge1',
                    source: 'start',
                    target: 'node1',
                },
                {
                    id: 'edge2',
                    source: 'node1',
                    target: 'node2',
                    data: {
                        name: 'Success',
                        conditions: {
                            and: [
                                {
                                    equals: [
                                        { var: 'steps_state.node1.success' },
                                        true,
                                    ],
                                },
                            ],
                        },
                    },
                },
                {
                    id: 'edge3',
                    source: 'node2',
                    target: 'error2',
                    data: { name: 'Error' },
                },
                {
                    id: 'edge4',
                    source: 'node2',
                    target: 'success',
                    data: {
                        name: 'Success',
                        conditions: {
                            and: [
                                {
                                    equals: [
                                        { var: 'steps_state.node2.success' },
                                        true,
                                    ],
                                },
                            ],
                        },
                    },
                },
            ],
        } as unknown as VisualBuilderGraph

        const { container } = renderWithProviders(
            <SimplifiedStepBuilder
                graph={graphWithMixedSteps}
                dispatch={mockDispatch}
                shopName="test-store"
                shopType="shopify"
                steps={[
                    {
                        ...defaultSteps[0],
                        id: 'config1',
                        internal_id: 'internal1',
                        name: 'Step 1',
                    },
                    {
                        ...defaultSteps[0],
                        id: 'config2',
                        internal_id: 'internal2',
                        name: 'Step 2',
                    },
                ]}
            />,
            graphWithMixedSteps,
            mockContextDispatch,
        )

        // Find the draggable items
        const stepItems = container.querySelectorAll('[draggable="true"]')
        expect(stepItems).toHaveLength(2)

        // Simulate reordering
        const dragElement = stepItems[1] as HTMLElement
        const dropElement = stepItems[0] as HTMLElement

        // Get bounding rectangles for realistic coordinates
        const dragRect = dragElement.getBoundingClientRect()

        const clientX = dragRect.left + dragRect.width / 2
        const clientY = dragRect.top + dragRect.height / 2

        fireEvent.dragStart(dragElement, { clientX, clientY })
        fireEvent.dragEnter(dropElement, { clientX, clientY })
        fireEvent.dragOver(dropElement, { clientX, clientY })
        fireEvent.drop(dropElement, { clientX, clientY })

        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'REORDER_REUSABLE_LLM_PROMPT_CALL_NODE',
            nodeIds: ['node2', 'node1'],
        })
    })
})
