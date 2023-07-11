import {produce} from 'immer'
import {ulid} from 'ulidx'

import {
    AutomatedMessageNodeType,
    MultipleChoicesNodeType,
    VisualBuilderGraph,
} from '../../models/visualBuilderGraph.types'
import {MessageContent} from '../../models/workflowConfiguration.types'
import {buildEdgeCommonProperties} from '../../models/visualBuilderGraph.model'
import {
    buildEndNode,
    buildMultipleChoicesNode,
    deleteBranch,
    greyOutBranch,
} from './utils'

export type VisualBuilderChoicesAction =
    | {
          type: 'SET_MULTIPLE_CHOICES_CONTENT'
          multipleChoicesNodeId: string
          content: MessageContent
      }
    | {
          type: 'INSERT_MULTIPLE_CHOICES_NODE'
          beforeNodeId: string
      }
    | {
          type: 'ADD_MULTIPLE_CHOICES_CHOICE'
          multipleChoicesNodeId: string
      }
    | {
          type: 'DELETE_MULTIPLE_CHOICES_CHOICE'
          nodeId: string
          eventId: string
      }
    | {
          type: 'REORDER_CHOICES'
          multipleChoicesNodeId: string
          orderedEventIds: string[]
      }
    | {
          type: 'SET_CHOICE_LABEL'
          multipleChoicesNodeId: string
          eventId: string
          label: string
      }
    | {
          type: 'GREY_OUT_CHOICE_CHILDREN'
          multipleChoicesNodeId: string
          eventId: string
          isGreyedOut: boolean
      }

// bridge between type system and runtime
// allow to keep a type safe list of all action types for this reducer
type ActionTypes = {
    [K in VisualBuilderChoicesAction['type']]: true
}
const visualBuilderChoiceActionTypes: ActionTypes = {
    SET_MULTIPLE_CHOICES_CONTENT: true,
    ADD_MULTIPLE_CHOICES_CHOICE: true,
    SET_CHOICE_LABEL: true,
    REORDER_CHOICES: true,
    INSERT_MULTIPLE_CHOICES_NODE: true,
    DELETE_MULTIPLE_CHOICES_CHOICE: true,
    GREY_OUT_CHOICE_CHILDREN: true,
}

export function isVisualBuilderChoiceAction(action: {
    type: string
}): action is VisualBuilderChoicesAction {
    return Object.keys(visualBuilderChoiceActionTypes).includes(action.type)
}

export function choicesReducer(
    graph: VisualBuilderGraph,
    action: VisualBuilderChoicesAction
): VisualBuilderGraph {
    switch (action.type) {
        case 'SET_MULTIPLE_CHOICES_CONTENT':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is AutomatedMessageNodeType =>
                        n.id === action.multipleChoicesNodeId &&
                        n.type === 'multiple_choices'
                )
                if (node) {
                    node.data.content = action.content
                }
            })
        case 'INSERT_MULTIPLE_CHOICES_NODE':
            return insertMultipleChoices(graph, action.beforeNodeId)
        case 'DELETE_MULTIPLE_CHOICES_CHOICE': {
            const nextGraph = produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is MultipleChoicesNodeType => n.id === action.nodeId
                )
                if (!node) return
                node.data.choices = node.data.choices.filter(
                    (c) => c.event_id !== action.eventId
                )
            })
            const childNodeId = graph.edges.find(
                (e) =>
                    e.source === action.nodeId &&
                    e.data?.event?.id === action.eventId
            )?.target
            if (childNodeId) return deleteBranch(nextGraph, childNodeId)
            return nextGraph
        }
        case 'ADD_MULTIPLE_CHOICES_CHOICE':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is MultipleChoicesNodeType =>
                        n.id === action.multipleChoicesNodeId &&
                        n.type === 'multiple_choices'
                )
                if (!node) return
                const eventId = ulid()
                node.data.choices.push({
                    event_id: eventId,
                    label_tkey: ulid(),
                    label: '',
                })
                draft.nodes.push(buildEndNode())
                draft.edges.push({
                    ...buildEdgeCommonProperties(),
                    source: action.multipleChoicesNodeId,
                    target: draft.nodes[draft.nodes.length - 1].id,
                    data: {
                        event: {
                            id: eventId,
                            kind: 'choices',
                        },
                    },
                })
            })
        case 'REORDER_CHOICES':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is MultipleChoicesNodeType =>
                        n.id === action.multipleChoicesNodeId &&
                        n.type === 'multiple_choices'
                )
                if (!node) return
                const choiceByEventId = node.data.choices.reduce(
                    (acc, choice) => {
                        const {event_id} = choice
                        return {...acc, [event_id]: choice}
                    },
                    {} as Record<
                        string,
                        MultipleChoicesNodeType['data']['choices'][number]
                    >
                )
                node.data.choices = action.orderedEventIds.map(
                    (eventId) => choiceByEventId[eventId]
                )
                // reorder edges so that the nodes are ordered in the visual builder
                const outgoingEdgesSorted = graph.edges
                    .filter((e) => e.source === action.multipleChoicesNodeId)
                    .sort(
                        (a, b) =>
                            node.data.choices.findIndex(
                                (c) => a.data?.event?.id === c.event_id
                            ) -
                            node.data.choices.findIndex(
                                (c) => b.data?.event?.id === c.event_id
                            )
                    )
                draft.edges = [
                    ...graph.edges.filter(
                        (e) => e.source !== action.multipleChoicesNodeId
                    ),
                    ...outgoingEdgesSorted,
                ]
            })
        case 'SET_CHOICE_LABEL':
            return produce(graph, (draft) => {
                const choice = draft.nodes
                    .find(
                        (n): n is MultipleChoicesNodeType =>
                            n.id === action.multipleChoicesNodeId &&
                            n.type === 'multiple_choices'
                    )
                    ?.data.choices.find((c) => action.eventId === c.event_id)
                if (choice) choice.label = action.label
            })
        case 'GREY_OUT_CHOICE_CHILDREN': {
            const incomingEdge = graph.edges.find(
                (e) =>
                    e.source === action.multipleChoicesNodeId &&
                    e.data?.event?.id === action.eventId
            )
            if (!incomingEdge) return graph
            return greyOutBranch(graph, incomingEdge.target, action.isGreyedOut)
        }
    }
}

function insertMultipleChoices(
    graph: VisualBuilderGraph,
    beforeEndNodeId: string
) {
    return produce(graph, (draft) => {
        const edge = draft.edges.find((e) => e.target === beforeEndNodeId)
        if (!edge) return
        const multipleChoicesNode = buildMultipleChoicesNode()
        const endNode = buildEndNode()
        draft.nodes.push(multipleChoicesNode, endNode)
        edge.target = multipleChoicesNode.id
        draft.edges.push(
            {
                ...buildEdgeCommonProperties(),
                source: multipleChoicesNode.id,
                target: beforeEndNodeId,
                data: {
                    event: {
                        kind: 'choices',
                        id: multipleChoicesNode.data.choices[0].event_id,
                    },
                },
            },
            {
                ...buildEdgeCommonProperties(),
                source: multipleChoicesNode.id,
                target: endNode.id,
                data: {
                    event: {
                        kind: 'choices',
                        id: multipleChoicesNode.data.choices[1].event_id,
                    },
                },
            }
        )
    })
}
