import {ulid} from 'ulidx'
import {produce} from 'immer'

import {
    buildNodeCommonProperties,
    walkVisualBuilderGraph,
} from '../../models/visualBuilderGraph.model'
import {
    AutomatedAnswerNodeType,
    EndNodeType,
    MultipleChoicesNodeType,
    VisualBuilderEdge,
    VisualBuilderGraph,
} from '../../models/visualBuilderGraph.types'

export function greyOutBranch(
    graph: VisualBuilderGraph,
    nodeId: string,
    isGreyedOut: boolean
): VisualBuilderGraph {
    const {nodes} = graph
    const childrenIds: Set<string> = new Set()
    walkVisualBuilderGraph(graph, nodeId, (node) => {
        childrenIds.add(node.id)
    })
    return {
        ...graph,
        nodes: nodes.map((n) =>
            childrenIds.has(n.id)
                ? produce(n, (draft) => {
                      draft.data.isGreyedOut = isGreyedOut
                  })
                : n
        ),
    }
}

export function deleteBranch(
    graph: VisualBuilderGraph,
    nodeId: string,
    {keepIncomingEdge}: {keepIncomingEdge?: boolean} = {}
) {
    const {nodes, edges} = graph
    const nodeIdsToDelete: Set<string> = new Set()
    const edgeIdsToDelete: Set<string> = new Set()
    let nodeToDeleteIncomingEdge: VisualBuilderEdge | undefined
    walkVisualBuilderGraph(
        graph,
        nodeId,
        (node, {incomingEdge, outgoingEdges}) => {
            nodeIdsToDelete.add(node.id)
            if (incomingEdge && !nodeToDeleteIncomingEdge) {
                nodeToDeleteIncomingEdge = incomingEdge
            }
            if (
                incomingEdge &&
                (!keepIncomingEdge ||
                    incomingEdge.id !== nodeToDeleteIncomingEdge?.id)
            )
                edgeIdsToDelete.add(incomingEdge.id)
            outgoingEdges.forEach((edge) => edgeIdsToDelete.add(edge.id))
        }
    )
    if (!nodeToDeleteIncomingEdge) return graph
    const nextGraph = {
        ...graph,
        nodes: nodes.filter((n) => !nodeIdsToDelete.has(n.id)),
        edges: edges.filter((e) => !edgeIdsToDelete.has(e.id)),
    }
    return nextGraph
}

export const buildAutomatedAnswerNode: () => AutomatedAnswerNodeType = () => ({
    ...buildNodeCommonProperties(),
    type: 'automated_answer',
    data: {
        wfConfigurationRef: {
            wfConfigurationMessagesStepId: ulid(),
        },
        content: {
            html: '',
            text: '',
        },
    },
})

export const buildMultipleChoicesNode: () => MultipleChoicesNodeType = () => ({
    ...buildNodeCommonProperties(),
    type: 'multiple_choices',
    data: {
        wfConfigurationRef: {
            wfConfigurationMessagesStepId: ulid(),
            wfConfigurationChoicesStepId: ulid(),
        },
        content: {
            html: '',
            text: '',
        },
        choices: [
            {
                event_id: ulid(),
                label: '',
            },
            {
                event_id: ulid(),
                label: '',
            },
        ],
    },
})

export const buildEndNode: () => EndNodeType = () => ({
    ...buildNodeCommonProperties(),
    type: 'end',
    data: {
        wfConfigurationRef: {
            wfConfigurationWorkflowCallStepId: ulid(),
        },
    },
})
