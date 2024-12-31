import {produce} from 'immer'

import {ulid} from 'ulidx'

import {buildEdgeCommonProperties} from '../../models/visualBuilderGraph.model'
import {
    ReusableLLMPromptCallNodeType,
    VisualBuilderGraph,
} from '../../models/visualBuilderGraph.types'
import {WorkflowConfiguration} from '../../models/workflowConfiguration.types'
import {
    buildEndNode,
    buildReusableLLMPromptCallNode,
    computeNodesPositions,
    getFallibleNodeSuccessConditions,
} from './utils'

export type VisualBuilderReusableLLMPromptCallAction =
    | {
          type: 'INSERT_REUSABLE_LLM_PROMPT_CALL_NODE'
          beforeNodeId: string
          configurationId: ReusableLLMPromptCallNodeType['data']['configuration_id']
          configurationInternalId: ReusableLLMPromptCallNodeType['data']['configuration_internal_id']
          trigger: Extract<
              NonNullable<WorkflowConfiguration['triggers']>[number],
              {kind: 'reusable-llm-prompt'}
          >['settings']
          entrypoint: Extract<
              NonNullable<WorkflowConfiguration['entrypoints']>[number],
              {kind: 'reusable-llm-prompt-call-step'}
          >['settings']
          app: NonNullable<WorkflowConfiguration['apps']>[number]
          values: WorkflowConfiguration['values']
      }
    | {
          type: 'SET_REUSABLE_LLM_PROMPT_CALL_VALUE'
          reusableLLMPromptCallNodeId: string
          inputId: keyof ReusableLLMPromptCallNodeType['data']['values']
          value: ReusableLLMPromptCallNodeType['data']['values'][keyof ReusableLLMPromptCallNodeType['data']['values']]
      }
    | {
          type: 'REUSABLE_LLM_PROMPT_CALL_NODE'
          nodeIds: string[]
      }

// bridge between type system and runtime
// allow to keep a type safe list of all action types for this reducer
type ActionTypes = {
    [K in VisualBuilderReusableLLMPromptCallAction['type']]: true
}
const visualBuilderReusableLLMPromptCallActionTypes: ActionTypes = {
    INSERT_REUSABLE_LLM_PROMPT_CALL_NODE: true,
    SET_REUSABLE_LLM_PROMPT_CALL_VALUE: true,
    REUSABLE_LLM_PROMPT_CALL_NODE: true,
}

export function isVisualBuilderReusableLLMPromptCallAction(action: {
    type: string
}): action is VisualBuilderReusableLLMPromptCallAction {
    return Object.keys(visualBuilderReusableLLMPromptCallActionTypes).includes(
        action.type
    )
}

export function reusableLLMPromptCallReducer(
    graph: VisualBuilderGraph,
    action: VisualBuilderReusableLLMPromptCallAction
): VisualBuilderGraph {
    switch (action.type) {
        case 'INSERT_REUSABLE_LLM_PROMPT_CALL_NODE':
            return computeNodesPositions(
                insertReusableLLMPromptCall(
                    graph,
                    action.configurationId,
                    action.configurationInternalId,
                    action.trigger,
                    action.entrypoint,
                    action.app,
                    action.values,
                    action.beforeNodeId
                )
            )
        case 'SET_REUSABLE_LLM_PROMPT_CALL_VALUE':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is ReusableLLMPromptCallNodeType =>
                        n.id === action.reusableLLMPromptCallNodeId &&
                        n.type === 'reusable_llm_prompt_call'
                )

                if (node) {
                    node.data.values[action.inputId] = action.value
                }
            })
        case 'REUSABLE_LLM_PROMPT_CALL_NODE':
            return computeNodesPositions(reorderNodes(graph, action.nodeIds))
    }
}

function insertReusableLLMPromptCall(
    graph: VisualBuilderGraph,
    configurationId: ReusableLLMPromptCallNodeType['data']['configuration_id'],
    configurationInternalId: ReusableLLMPromptCallNodeType['data']['configuration_internal_id'],
    trigger: Extract<
        NonNullable<WorkflowConfiguration['triggers']>[number],
        {kind: 'reusable-llm-prompt'}
    >['settings'],
    entrypoint: Extract<
        NonNullable<WorkflowConfiguration['entrypoints']>[number],
        {kind: 'reusable-llm-prompt-call-step'}
    >['settings'],
    app: NonNullable<WorkflowConfiguration['apps']>[number],
    values: WorkflowConfiguration['values'],
    beforeNodeId: string
) {
    return produce(graph, (draft) => {
        const edge = draft.edges.find((e) => e.target === beforeNodeId)
        if (!edge) return

        const triggerNode = draft.nodes[0]

        if (triggerNode.type !== 'llm_prompt_trigger') {
            throw new Error()
        }

        const reusableLLMPromptCallNode = buildReusableLLMPromptCallNode({
            configuration_id: configurationId,
            configuration_internal_id: configurationInternalId,
            values: values ?? {},
        })

        draft.apps ??= []

        if (
            !draft.apps.find((a) =>
                a.type === 'app'
                    ? a.type === app.type && a.app_id === app.app_id
                    : a.type === app.type
            )
        ) {
            draft.apps.push({...app})
        }

        if (entrypoint.requires_confirmation) {
            triggerNode.data.requires_confirmation = true
        }

        trigger.custom_inputs.forEach((input) => {
            reusableLLMPromptCallNode.data.custom_inputs ??= {}

            let triggerInput = triggerNode.data.inputs.find((triggerInput) => {
                return (
                    'data_type' in triggerInput &&
                    triggerInput.name === input.name &&
                    triggerInput.instructions === input.instructions &&
                    triggerInput.data_type === input.data_type
                )
            })

            if (!triggerInput) {
                triggerInput = {
                    ...input,
                    id: ulid(),
                }

                triggerNode.data.inputs.push(triggerInput)
            }

            reusableLLMPromptCallNode.data.custom_inputs[input.id] =
                `{{custom_inputs.${triggerInput.id}}}`
        })

        trigger.object_inputs.forEach((input) => {
            reusableLLMPromptCallNode.data.objects ??= {}

            switch (input.kind) {
                case 'customer':
                    reusableLLMPromptCallNode.data.objects.customer =
                        '{{objects.customer}}'
                    break
                case 'order':
                    reusableLLMPromptCallNode.data.objects.order =
                        '{{objects.order}}'
                    break
                case 'product': {
                    reusableLLMPromptCallNode.data.objects.products ??= {}

                    let triggerInput = triggerNode.data.inputs.find(
                        (triggerInput) => {
                            return (
                                'kind' in triggerInput &&
                                triggerInput.name === input.name &&
                                triggerInput.instructions ===
                                    input.instructions &&
                                triggerInput.kind === input.kind
                            )
                        }
                    )

                    if (!triggerInput) {
                        triggerInput = {
                            ...input,
                            id: ulid(),
                        }

                        triggerNode.data.inputs.push(triggerInput)
                    }

                    reusableLLMPromptCallNode.data.objects.products[input.id] =
                        `{{objects.products.${triggerInput.id}}}`
                }
            }
        })

        const endNode = buildEndNode('end-failure')

        draft.nodes.push(reusableLLMPromptCallNode, endNode)
        edge.target = reusableLLMPromptCallNode.id
        draft.edges.push(
            {
                ...buildEdgeCommonProperties(),
                source: reusableLLMPromptCallNode.id,
                target: beforeNodeId,
                data: {
                    name: 'Success',
                    conditions: getFallibleNodeSuccessConditions(
                        reusableLLMPromptCallNode.id
                    ),
                },
            },
            {
                ...buildEdgeCommonProperties(),
                source: reusableLLMPromptCallNode.id,
                target: endNode.id,
                data: {
                    name: 'Error',
                },
            }
        )

        if (
            (app.type === 'app' && !draft.isTemplate) ||
            Object.keys(values ?? {}).length
        ) {
            draft.nodeEditingId = reusableLLMPromptCallNode.id
            draft.choiceEventIdEditing = null
            draft.branchIdsEditing = []
        }
    })
}

export function reorderNodes(
    graph: VisualBuilderGraph,
    nodeIds: string[]
): VisualBuilderGraph {
    // Create ordered reusable nodes
    const orderedReusableNodes = nodeIds
        .map((id) => {
            const nodeIndex = graph.nodes.findIndex((node) => node.id === id)
            if (nodeIndex === -1) return undefined
            return [graph.nodes[nodeIndex], graph.nodes[nodeIndex + 1]]
        })
        .filter(Boolean)
        .reduce((acc, node) => (acc ?? []).concat(node ?? []), [])

    const triggerNode = graph.nodes[0]
    const endNode = graph.nodes.find(
        (node) => node.type === 'end' && node.data.action === 'end-success'
    )

    if (!triggerNode || !endNode || !orderedReusableNodes) return graph

    const newEdges = [
        {
            ...graph.edges[0],
            target: orderedReusableNodes[0].id,
        },
    ]
    // Connect reusable nodes in sequence
    orderedReusableNodes.forEach((node, index) => {
        if (node.type === 'reusable_llm_prompt_call') {
            const nextNode = orderedReusableNodes[index + 2] // Skip the failure node
            const failureNode = orderedReusableNodes[index + 1]

            newEdges.push({
                ...buildEdgeCommonProperties(),
                source: node.id,
                target: nextNode ? nextNode.id : endNode.id,
                data: {
                    name: 'Success',
                    conditions: getFallibleNodeSuccessConditions(node.id),
                },
            })

            if (failureNode && failureNode.type === 'end') {
                newEdges.push({
                    ...buildEdgeCommonProperties(),
                    source: node.id,
                    target: failureNode.id,
                    data: {
                        name: 'Error',
                    },
                })
            }
        }
    })

    return {
        ...graph,
        nodes: [triggerNode, endNode, ...orderedReusableNodes],
        edges: newEdges,
    }
}
