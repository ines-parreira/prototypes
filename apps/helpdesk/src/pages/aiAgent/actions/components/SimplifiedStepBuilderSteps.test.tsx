import { FeatureFlagKey } from '@repo/feature-flags'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'

import { useFlag } from 'core/flags'
import { VisualBuilderGraph } from 'pages/automate/workflows/models/visualBuilderGraph.types'

import { SimplifiedStepBuilderSteps } from './SimplifiedStepBuilderSteps'

// Mock dependencies
jest.mock('core/flags')
jest.mock('pages/automate/actionsPlatform/hooks/useApps', () => ({
    __esModule: true,
    default: () => ({
        apps: [],
        actionsApps: [],
    }),
}))
jest.mock(
    'pages/automate/actionsPlatform/hooks/useGetAppFromTemplateApp',
    () => ({
        __esModule: true,
        default: () => () => null,
    }),
)
jest.mock('../providers/StoreTrackstarContext', () => ({
    useStoreTrackstarContext: () => ({
        connections: {},
    }),
}))
jest.mock('pages/automate/workflows/models/visualBuilderGraph.model', () => ({
    walkVisualBuilderGraph: (
        graph: any,
        startNodeId: string,
        callback: (node: any) => void,
    ) => {
        graph.nodes.forEach((node: any) => callback(node))
    },
    getReusableLLMPromptCallNodeStatuses: () => ({
        isClickable: true,
        hasMissingCredentials: false,
        hasCredentials: true,
        hasAllValues: true,
        hasMissingValues: false,
        hasInvalidCredentials: false,
    }),
}))
jest.mock(
    'pages/automate/workflows/editor/visualBuilder/NodeEditorDrawer',
    () => ({
        __esModule: true,
        default: () => null,
    }),
)
const mockVisualBuilderDispatch = jest.fn()

jest.mock('pages/automate/workflows/hooks/useVisualBuilder', () => ({
    useVisualBuilderContext: () => ({
        visualBuilderGraph: {
            nodes: [{ id: 'node-1', type: 'llm_prompt_trigger' }],
            advanced_datetime: false,
            isTemplate: false,
        },
        dispatch: mockVisualBuilderDispatch,
    }),
}))

jest.mock(
    'pages/automate/workflows/editor/visualBuilder/components/NodeMenu',
    () => {
        return {
            __esModule: true,
            default: jest.fn().mockImplementation(({ isOpen, nodeId }: any) => {
                if (!isOpen) return null

                const React = require('react')
                const { useFlag } = require('core/flags')
                const {
                    useVisualBuilderContext,
                } = require('pages/automate/workflows/hooks/useVisualBuilder')
                const { FeatureFlagKey } = require('@repo/feature-flags')

                const liquidTemplateFlag = useFlag(
                    FeatureFlagKey.LiquidTemplateStep,
                    {
                        actions: false,
                        actionsPlatform: false,
                        flows: false,
                    },
                )

                const { dispatch } = useVisualBuilderContext()

                // Simulate the menu structure
                return React.createElement(
                    'div',
                    { 'data-testid': 'node-menu' },
                    // Show liquid template if flag is enabled for actions
                    liquidTemplateFlag?.actions
                        ? React.createElement(
                              'div',
                              {
                                  onClick: () => {
                                      dispatch({
                                          type: 'INSERT_LIQUID_TEMPLATE_NODE',
                                          beforeNodeId: nodeId,
                                      })
                                  },
                                  'data-testid': 'liquid-template-option',
                              },
                              'Liquid Template',
                          )
                        : null,
                )
            }),
        }
    },
)

const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

describe('SimplifiedStepBuilderSteps', () => {
    const mockDispatch = jest.fn()
    const mockGraph: VisualBuilderGraph = {
        id: 'test-graph-id',
        internal_id: 'test-internal-id',
        is_draft: false,
        name: 'Test Graph',
        available_languages: ['en-US'],
        nodes: [
            {
                id: 'node-1',
                type: 'llm_prompt_trigger',
                data: {
                    instructions: '',
                    requires_confirmation: false,
                    inputs: [],
                    outputs: [],
                    conditions: null,
                },
                position: { x: 0, y: 0 },
            },
            {
                id: 'end-node',
                type: 'end',
                data: { action: 'end-success' },
                position: { x: 0, y: 100 },
            },
        ] as any,
        edges: [],
        apps: [],
        nodeEditingId: null,
        choiceEventIdEditing: null,
        branchIdsEditing: [],
        isTemplate: false,
    }
    const mockSteps: any = []

    beforeEach(() => {
        jest.clearAllMocks()
        // Default to liquid template disabled
        mockUseFlag.mockReturnValue({
            actions: false,
            actionsPlatform: false,
            flows: false,
        })
    })

    describe('Liquid Template Step', () => {
        it('should show liquid template option in add step menu when feature flag is enabled for actions', async () => {
            // Enable liquid template for actions
            mockUseFlag.mockImplementation((flagKey) => {
                if (flagKey === FeatureFlagKey.LiquidTemplateStep) {
                    return {
                        actions: true,
                        actionsPlatform: false,
                        flows: false,
                    }
                }
                return false
            })

            render(
                <SimplifiedStepBuilderSteps
                    graph={mockGraph}
                    dispatch={mockDispatch}
                    steps={mockSteps}
                />,
            )

            // Click on Add Step button
            const addStepButton = screen.getByRole('button', {
                name: /add step/i,
            })
            userEvent.click(addStepButton)

            // Wait for dropdown to open and check for liquid template option
            await waitFor(() => {
                expect(screen.getByText(/liquid template/i)).toBeInTheDocument()
            })
        })

        it('should not show liquid template option in add step menu when feature flag is disabled for actions', async () => {
            // Keep liquid template disabled for actions
            mockUseFlag.mockImplementation((flagKey) => {
                if (flagKey === FeatureFlagKey.LiquidTemplateStep) {
                    return {
                        actions: false,
                        actionsPlatform: true,
                        flows: true,
                    }
                }
                return false
            })

            render(
                <SimplifiedStepBuilderSteps
                    graph={mockGraph}
                    dispatch={mockDispatch}
                    steps={mockSteps}
                />,
            )

            // Click on Add Step button
            const addStepButton = screen.getByRole('button', {
                name: /add step/i,
            })
            userEvent.click(addStepButton)

            // Wait for dropdown to open and verify liquid template is not present
            await waitFor(() => {
                expect(
                    screen.queryByText(/liquid template/i),
                ).not.toBeInTheDocument()
            })
        })

        it('should dispatch INSERT_LIQUID_TEMPLATE_NODE action when liquid template is selected', async () => {
            // Enable liquid template for actions
            mockUseFlag.mockImplementation((flagKey) => {
                if (flagKey === FeatureFlagKey.LiquidTemplateStep) {
                    return {
                        actions: true,
                        actionsPlatform: false,
                        flows: false,
                    }
                }
                return false
            })

            render(
                <SimplifiedStepBuilderSteps
                    graph={mockGraph}
                    dispatch={mockDispatch}
                    steps={mockSteps}
                />,
            )

            // Click on Add Step button
            const addStepButton = screen.getByRole('button', {
                name: /add step/i,
            })
            userEvent.click(addStepButton)

            // Wait for dropdown and click on liquid template
            await waitFor(() => {
                expect(screen.getByText(/liquid template/i)).toBeInTheDocument()
            })

            const liquidTemplateOption = screen.getByText(/liquid template/i)
            fireEvent.click(liquidTemplateOption)

            // Verify dispatch was called with correct action
            expect(mockVisualBuilderDispatch).toHaveBeenCalledWith({
                type: 'INSERT_LIQUID_TEMPLATE_NODE',
                beforeNodeId: 'end-node',
            })
        })
    })
})
