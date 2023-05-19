/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {renderHook} from '@testing-library/react-hooks'
import {Edge, Node, useReactFlow} from 'reactflow'
import {WorkflowConfiguration} from '../../../../types'
import {useWorkflowConfigurationContext} from '../../../hooks/useWorkflowConfiguration'
import {workflowConfigurationFactory} from '../../../../hooks/useWorkflowApi'
import {useWorkflowEntrypointContext} from '../../../hooks/useWorkflowEntrypoint'
import {useSyncWorkflowToReactFlow} from '../useSyncWorkflowToReactFlow'
import {reducer} from '../../../hooks/useWorkflowConfigurationReducer'

jest.mock('../../../hooks/useWorkflowConfiguration')
jest.mock('../../../hooks/useWorkflowEntrypoint')
jest.mock('reactflow')

describe('useSyncWorkflowToReactFlow', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('created nodes and edges correctly for a new workflow configuration', () => {
        const mockSetNodes = jest.fn()
        const mockSetEdges = jest.fn()
        ;(useReactFlow as jest.MockedFn<typeof useReactFlow>).mockReturnValue({
            getNodes: () => [],
            setEdges: mockSetEdges,
            setNodes: mockSetNodes,
        } as unknown as ReturnType<typeof useReactFlow>)
        ;(
            useWorkflowConfigurationContext as jest.MockedFn<
                typeof useWorkflowConfigurationContext
            >
        ).mockReturnValue({
            configuration: {
                ...workflowConfigurationFactory(1, 'a'),
                name: 'workflow name',
            },
        } as ReturnType<typeof useWorkflowConfigurationContext>)
        ;(
            useWorkflowEntrypointContext as jest.MockedFn<
                typeof useWorkflowEntrypointContext
            >
        ).mockReturnValue({
            label: 'entrypoint label',
        } as ReturnType<typeof useWorkflowEntrypointContext>)

        renderHook(() => useSyncWorkflowToReactFlow())

        const edges = mockSetEdges.mock.lastCall?.[0]
        expect(edges).toHaveLength(2)
        const nodes = mockSetNodes.mock.lastCall?.[0]
        const nodeTypes = nodes.map((n: any) => n.type).sort()
        expect(nodeTypes).toEqual([
            'automated_message',
            'placeholder',
            'trigger_button',
        ])
    })

    it('correctly map choices step to reply_button nodes', () => {
        const mockSetNodes = jest.fn()
        const mockSetEdges = jest.fn()
        ;(useReactFlow as jest.MockedFn<typeof useReactFlow>).mockReturnValue({
            getNodes: () => [],
            setEdges: mockSetEdges,
            setNodes: mockSetNodes,
        } as unknown as ReturnType<typeof useReactFlow>)
        const baseWorkflow = workflowConfigurationFactory(1, 'a')
        const workflow: WorkflowConfiguration = {
            ...reducer(baseWorkflow, {
                type: 'ADD_REPLY_BUTTONS',
                step_id: baseWorkflow.initial_step_id,
            }),
        }
        ;(
            useWorkflowConfigurationContext as jest.MockedFn<
                typeof useWorkflowConfigurationContext
            >
        ).mockReturnValue({
            configuration: workflow,
        } as ReturnType<typeof useWorkflowConfigurationContext>)
        ;(
            useWorkflowEntrypointContext as jest.MockedFn<
                typeof useWorkflowEntrypointContext
            >
        ).mockReturnValue({
            label: 'entrypoint label',
        } as ReturnType<typeof useWorkflowEntrypointContext>)

        renderHook(() => useSyncWorkflowToReactFlow())
        const edges: Edge[] = mockSetEdges.mock.lastCall?.[0]
        expect(edges).toHaveLength(7)
        const nodes: Node[] = mockSetNodes.mock.lastCall?.[0]
        const nodesReplyButtons = nodes.filter((n) => n.type === 'reply_button')
        const nodesMessages = nodes.filter(
            (n) => n.type === 'automated_message'
        )
        const nodesPlaceholder = nodes.filter((n) => n.type === 'placeholder')
        expect(nodesReplyButtons.length).toEqual(2)
        expect(nodesMessages.length).toEqual(3)
        expect(nodesPlaceholder.length).toEqual(2)

        const exploredNodesIds = new Set<string>()

        // walk the graph following all edges, every node should have at least one edge, except for placeholders that are the graph leaves
        function checkAllStepsAreLinked(
            currentNodeId = baseWorkflow.initial_step_id
        ): boolean {
            exploredNodesIds.add(currentNodeId)
            const node = nodes.find((n) => n.id === currentNodeId)
            if (!node) return false
            if (node?.type === 'placeholder') return true
            const edgesToFollow = edges.filter((e) => e.source === node.id)
            if (edgesToFollow.length === 0) return false
            return edgesToFollow.reduce<boolean>(
                (res, edge) => res && checkAllStepsAreLinked(edge.target),
                true
            )
        }

        expect(checkAllStepsAreLinked()).toBe(true)
        expect(exploredNodesIds.size).toEqual(
            workflow.steps.length +
                1 + // 1 step choices becomes 2 steps reply_button
                2 -
                2 // 2 placeholder nodes are added, one for each choice leaf, but 2 steps corresponding to the wasItHelpful workflow_call are invisible, hence 2 - 2
        )
    })
})
