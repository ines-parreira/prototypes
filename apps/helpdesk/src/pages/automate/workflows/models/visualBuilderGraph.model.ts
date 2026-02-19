import type { Edge, Node } from '@xyflow/react'
import _cloneDeep from 'lodash/cloneDeep'
import _groupBy from 'lodash/groupBy'
import _isEqual from 'lodash/isEqual'
import _keyBy from 'lodash/keyBy'
import _merge from 'lodash/merge'
import _omit from 'lodash/omit'
import _omitBy from 'lodash/omitBy'
import _setWith from 'lodash/setWith'
import { ulid } from 'ulidx'

import { validateHttpHeaderName, validateWebhookURL } from 'utils'

import type {
    ActionsApp,
    ActionTemplate,
    ActionTemplateApp,
} from '../../actionsPlatform/types'
import type { TrackstarConnection } from '../types'
import type {
    ConditionSchema,
    ConditionsSchema,
    VarSchema,
} from './conditions.types'
import {
    extractVariablesFromNode,
    getWorkflowVariableListForNode,
    hasInvalidVariables,
    isValidLiquidSyntax,
    parseWorkflowVariable,
    unescapeUrlEncodedVariables,
    validateJSONWithVariables,
} from './variables.model'
import type {
    AvailableIntegrations,
    WorkflowVariableList,
} from './variables.types'
import { SHIPMONK_APPLICATION_ID } from './variables.types'
import type {
    AutomatedMessageNodeType,
    CancelSubscriptionNodeType,
    ChannelTriggerNodeType,
    ConditionsNodeType,
    FileUploadNodeType,
    HttpRequestNodeType,
    LiquidTemplateNodeType,
    LLMPromptTriggerNodeType,
    MultipleChoicesNodeType,
    OrderLineItemSelectionNodeType,
    OrderSelectionNodeType,
    RemoveItemNodeType,
    ReplaceItemNodeType,
    ReusableLLMPromptCallNodeType,
    ReusableLLMPromptTriggerNodeType,
    SkipChargeNodeType,
    TextReplyNodeType,
    UpdateShippingAddressNodeType,
    VisualBuilderEdge,
    VisualBuilderGraph,
    VisualBuilderGraphApp,
    VisualBuilderGraphAppApp,
    VisualBuilderNode,
} from './visualBuilderGraph.types'
import {
    isConditionsNodeType,
    isHttpRequestNodeType,
    isMultipleChoicesNodeType,
} from './visualBuilderGraph.types'
import type {
    WorkflowConfiguration,
    WorkflowStepAttachmentsInput,
    WorkflowStepCancelOrder,
    WorkflowStepCancelSubscription,
    WorkflowStepChoices,
    WorkflowStepConditions,
    WorkflowStepCreateDiscountCode,
    WorkflowStepEditOrderNote,
    WorkflowStepEnd,
    WorkflowStepHandover,
    WorkflowStepHelpfulPrompt,
    WorkflowStepHttpRequest,
    WorkflowStepLiquidTemplate,
    WorkflowStepMessage,
    WorkflowStepOrderLineItemSelection,
    WorkflowStepOrderSelection,
    WorkflowStepRefundOrder,
    WorkflowStepRefundShippingCosts,
    WorkflowStepRemoveItem,
    WorkflowStepReplaceItem,
    WorkflowStepReshipForFree,
    WorkflowStepReusableLLMPromptCall,
    WorkflowStepShopperAuthentication,
    WorkflowStepSkipCharge,
    WorkflowStepTextInput,
    WorkflowStepUpdateShippingAddress,
} from './workflowConfiguration.types'

export const buildEdgeCommonProperties: () => Pick<
    Edge,
    'id' | 'type' | 'style' | 'interactionWidth' | 'data'
> & { id: string } = () => ({
    id: ulid(),
    type: 'custom',
    style: { stroke: '#D2D7DE' },
    interactionWidth: 0,
    data: {},
})

export const buildNodeCommonProperties: () => Pick<
    Node,
    'id' | 'position'
> = () => ({
    id: ulid(),
    position: { x: 0, y: 0 },
})

export function areGraphsEqual(
    g1: VisualBuilderGraph,
    g2: VisualBuilderGraph,
    ignoreTouched = true,
): boolean {
    const essentialGraph = (g: VisualBuilderGraph) =>
        _omit(
            {
                ...g,
                nodes: g.nodes
                    .map((node) => {
                        let data = _omitBy(
                            _omit(
                                node.data,
                                ignoreTouched
                                    ? ['isGreyedOut', 'errors', 'touched']
                                    : ['isGreyedOut', 'errors'],
                            ),
                            (value) => value === undefined,
                        )

                        if (node.type === 'http_request') {
                            data = _omit(
                                data,
                                ignoreTouched
                                    ? ['testRequestResult', 'errors', 'touched']
                                    : ['testRequestResult', 'errors'],
                            )

                            return {
                                id: node.id,
                                type: node.type,
                                data: {
                                    ...data,
                                    headers: node.data.headers.map(
                                        (header) => ({
                                            ...header,
                                            name: header.name.toLowerCase(),
                                        }),
                                    ),
                                },
                            }
                        }

                        return { id: node.id, type: node.type, data }
                    })
                    .sort((a, b) => a.id.localeCompare(b.id)),
                edges: g.edges
                    .map(({ source, target, data }) => ({
                        source,
                        target,
                        data,
                    }))
                    .sort((a, b) =>
                        `${a.source}-${a.target}`.localeCompare(
                            `${b.source}-${b.target}`,
                        ),
                    ),
                apps: g.apps?.map((app) =>
                    _omit(
                        app,
                        ignoreTouched ? ['errors', 'touched'] : ['errors'],
                    ),
                ),
            },
            ignoreTouched
                ? [
                      'nodeEditingId',
                      'choiceEventIdEditing',
                      'branchIdsEditing',
                      'errors',
                      'touched',
                  ]
                : [
                      'nodeEditingId',
                      'choiceEventIdEditing',
                      'branchIdsEditing',
                      'errors',
                  ],
        )

    return _isEqual(essentialGraph(g1), essentialGraph(g2))
}

export function walkVisualBuilderGraph(
    g: VisualBuilderGraph,
    currentNodeId: string,
    f: (
        node: VisualBuilderNode,
        context: {
            previousNode: VisualBuilderNode | undefined
            nextNodes: VisualBuilderNode[]
            incomingEdge: VisualBuilderEdge | undefined
            outgoingEdges: VisualBuilderEdge[]
        },
    ) => void,
    direction: 'upwards' | 'downwards' = 'downwards',
    indexes?: {
        nodeById: Record<string, VisualBuilderNode>
        edgesBySource: Record<string, VisualBuilderEdge[]>
        edgesByTarget: Record<string, VisualBuilderEdge[]>
    },
) {
    const { nodes, edges } = g
    // Build indexes on first iteration
    const { nodeById, edgesBySource, edgesByTarget } = indexes ?? {
        nodeById: _keyBy(nodes, 'id'),
        edgesBySource: _groupBy(edges, 'source'),
        edgesByTarget: _groupBy(edges, 'target'),
    }

    const node = nodeById[currentNodeId]
    if (!node) return

    let nextEdges = []
    let previousNode
    let incomingEdge

    if (direction === 'downwards') {
        nextEdges = edgesBySource[currentNodeId] ?? []
        incomingEdge = edgesByTarget[currentNodeId]?.[0]
        previousNode = incomingEdge ? nodeById[incomingEdge.source] : undefined
    } else {
        nextEdges = edgesByTarget[currentNodeId] ?? []
        const outgoingEdge = nextEdges.length > 0 ? nextEdges[0] : undefined
        previousNode = outgoingEdge ? nodeById[outgoingEdge.target] : undefined
    }

    const nextNodes = nextEdges.map(
        (e) => nodeById[direction === 'downwards' ? e.target : e.source],
    )

    f(node, { previousNode, nextNodes, incomingEdge, outgoingEdges: nextEdges })

    for (const edge of nextEdges) {
        walkVisualBuilderGraph(
            g,
            direction === 'downwards' ? edge.target : edge.source,
            f,
            direction,
            {
                nodeById,
                edgesBySource,
                edgesByTarget,
            },
        )
    }
}

export function cleanConditionsFromEmptyVariables(
    conditions: ConditionsSchema,
    availableVariables: WorkflowVariableList,
) {
    const clear = (condition: ConditionSchema) => {
        const operator = Object.keys(condition)?.[0] as keyof ConditionSchema

        const schema = condition[operator] as [VarSchema, string]

        const [variable] = schema

        return parseWorkflowVariable(variable.var, availableVariables) != null
    }

    if (!conditions.and && !conditions.or) {
        return conditions
    }

    if (conditions.and) {
        return {
            ...conditions,
            and: conditions.and.filter(clear),
        }
    } else if (conditions.or) {
        return {
            ...conditions,
            or: conditions.or.filter(clear),
        }
    }

    return conditions
}

function setLLMPromptCustomerObjectInput(
    trigger: Extract<
        NonNullable<WorkflowConfiguration['triggers']>[number],
        { kind: 'llm-prompt' }
    >,
): void {
    if (
        !trigger.settings.object_inputs.find(
            (input) => input.kind === 'customer',
        )
    ) {
        trigger.settings.object_inputs.push({
            kind: 'customer',
            integration_id: '{{store.helpdesk_integration_id}}',
        })
    }
}

function setLLMPromptOrderObjectInput(
    trigger: Extract<
        NonNullable<WorkflowConfiguration['triggers']>[number],
        { kind: 'llm-prompt' }
    >,
): void {
    setLLMPromptCustomerObjectInput(trigger)

    if (
        !trigger.settings.object_inputs.find((input) => input.kind === 'order')
    ) {
        trigger.settings.object_inputs.push({
            kind: 'order',
            integration_id: '{{store.helpdesk_integration_id}}',
        })
    }
}

function setLLMPromptShipmonkOrderObjectInput(
    trigger: Extract<
        NonNullable<WorkflowConfiguration['triggers']>[number],
        { kind: 'llm-prompt' }
    >,
    availableIntegrations: AvailableIntegrations,
): void {
    const shipmonkIntegration = availableIntegrations?.find(
        (integration) => integration.application_id === SHIPMONK_APPLICATION_ID,
    )
    if (!shipmonkIntegration) return
    setLLMPromptCustomerObjectInput(trigger)

    if (
        !trigger.settings.object_inputs.find(
            (input) => input.kind === 'order-shipmonk',
        )
    ) {
        trigger.settings.object_inputs.push({
            kind: 'order-shipmonk',
            integration_id: shipmonkIntegration.integration_id,
        })
    }
}

function setLLMPromptObjectInputs(
    g: VisualBuilderGraph,
    node: VisualBuilderNode,
    trigger: Extract<
        NonNullable<WorkflowConfiguration['triggers']>[number],
        { kind: 'llm-prompt' }
    >,
    availableIntegrations: AvailableIntegrations = [],
) {
    const variables = extractVariablesFromNode(node, g.edges)
    const availableVariables = getWorkflowVariableListForNode(
        g,
        node.id,
        [],
        [],
        availableIntegrations,
    )

    variables
        .map((variable) => parseWorkflowVariable(variable, availableVariables))
        .forEach((variable) => {
            switch (variable?.nodeType) {
                case 'shopper_authentication':
                    setLLMPromptCustomerObjectInput(trigger)
                    break
                case 'order_selection':
                    setLLMPromptOrderObjectInput(trigger)
                    break
                case 'order_shipmonk':
                    setLLMPromptShipmonkOrderObjectInput(
                        trigger,
                        availableIntegrations,
                    )
                    break
            }
        })
}

function setReusableLLMPromptObjectInputs(
    g: VisualBuilderGraph,
    node: VisualBuilderNode,
    trigger: Extract<
        NonNullable<WorkflowConfiguration['triggers']>[number],
        { kind: 'reusable-llm-prompt' }
    >,
) {
    const variables = extractVariablesFromNode(node, g.edges)
    const availableVariables = getWorkflowVariableListForNode(
        g,
        node.id,
        [],
        [],
    )

    variables
        .map((variable) => parseWorkflowVariable(variable, availableVariables))
        .forEach((variable) => {
            switch (variable?.nodeType) {
                case 'shopper_authentication':
                    {
                        if (
                            !trigger.settings.object_inputs.find(
                                (input) => input.kind === 'customer',
                            )
                        ) {
                            const index =
                                trigger.settings.object_inputs.findIndex(
                                    (input) => input.kind === 'order',
                                )

                            if (index !== -1) {
                                trigger.settings.object_inputs.splice(
                                    index,
                                    0,
                                    { kind: 'customer' },
                                )
                            } else {
                                trigger.settings.object_inputs.push({
                                    kind: 'customer',
                                })
                            }
                        }
                    }
                    break
                case 'order_selection':
                    {
                        if (
                            !trigger.settings.object_inputs.find(
                                (input) => input.kind === 'customer',
                            )
                        ) {
                            const index =
                                trigger.settings.object_inputs.findIndex(
                                    (input) => input.kind === 'order',
                                )

                            if (index !== -1) {
                                trigger.settings.object_inputs.splice(
                                    index,
                                    0,
                                    { kind: 'customer' },
                                )
                            } else {
                                trigger.settings.object_inputs.push({
                                    kind: 'customer',
                                })
                            }
                        }

                        if (
                            !trigger.settings.object_inputs.find(
                                (input) => input.kind === 'order',
                            )
                        ) {
                            trigger.settings.object_inputs.push({
                                kind: 'order',
                            })
                        }
                    }
                    break
            }
        })
}

function setStaticInputs(
    c: WorkflowConfiguration,
    inputs: Exclude<VisualBuilderGraph['inputs'], undefined | null>,
    values: Exclude<VisualBuilderGraph['values'], undefined | null>,
) {
    c.values = c.values || {}
    inputs.forEach(({ id }) => {
        c.values![id] = values[id]
    })

    c.inputs = (c.inputs || [])
        .filter(({ id }) => !inputs.some((input) => input.id === id))
        .concat(inputs)
}

function extractReferencedVariablesFromTheNode(
    referencedVariables: string[],
    node: VisualBuilderNode,
    edges?: VisualBuilderEdge[],
) {
    extractVariablesFromNode(node, edges).forEach((variable) => {
        if (referencedVariables.includes(variable)) return
        referencedVariables.push(variable)
    })
}

function setCustomInputs(
    c: WorkflowConfiguration,
    referencedVariables: string[],
) {
    // for simple step builder we remove unreferenced custom inputs
    if (
        c.advanced_datetime ||
        !c.triggers?.[0] ||
        c.triggers[0].kind !== 'llm-prompt'
    )
        return

    const trigger = c.triggers[0] as Extract<
        NonNullable<WorkflowConfiguration['triggers']>[number],
        { kind: 'llm-prompt' }
    >

    trigger.settings.custom_inputs = trigger.settings.custom_inputs.filter(
        (input) => referencedVariables.includes(`custom_inputs.${input.id}`),
    )
}

export function transformVisualBuilderGraphIntoWfConfiguration(
    g: VisualBuilderGraph,
    isDraft = true,
    steps: WorkflowConfiguration[],
    availableIntegrations: AvailableIntegrations = [],
) {
    const c: WorkflowConfiguration = {
        id: g.id,
        internal_id: g.internal_id,
        is_draft: isDraft,
        name: g.name,
        advanced_datetime: g.advanced_datetime?.toISOString(),
        initial_step_id: null,
        available_languages: g.available_languages,
        steps: [],
        transitions: [],
        apps: g.apps?.map(
            (app) => _omit(app, ['errors', 'touched']) as ActionTemplateApp,
        ),
        inputs: _cloneDeep(g.inputs),
        values: _cloneDeep(g.values),
        template_internal_id: g.template_internal_id,
        category: g.category,
    }

    const stepIdByNodeId: Record<string, string> = {}

    const referencedVariables: string[] = []

    walkVisualBuilderGraph(
        g,
        g.nodes[0].id,
        (node, { previousNode, incomingEdge }) => {
            if (node.type === 'channel_trigger') {
                c.entrypoint = {
                    label: node.data.label,
                    label_tkey: node.data.label_tkey,
                }
                return
            } else if (node.type === 'llm_prompt_trigger') {
                extractReferencedVariablesFromTheNode(
                    referencedVariables,
                    node,
                    g.edges,
                )
                const trigger: Extract<
                    NonNullable<WorkflowConfiguration['triggers']>[number],
                    { kind: 'llm-prompt' }
                > = {
                    kind: 'llm-prompt',
                    settings: {
                        custom_inputs: node.data.inputs.filter(
                            (
                                input,
                            ): input is Extract<
                                NonNullable<
                                    WorkflowConfiguration['triggers']
                                >[number],
                                { kind: 'llm-prompt' }
                            >['settings']['custom_inputs'][number] =>
                                'data_type' in input,
                        ),
                        object_inputs: node.data.inputs
                            .filter(
                                (
                                    input,
                                ): input is Extract<
                                    LLMPromptTriggerNodeType['data']['inputs'][number],
                                    { kind: 'product' }
                                > =>
                                    'kind' in input && input.kind === 'product',
                            )
                            .map((input) => ({
                                ...input,
                                integration_id:
                                    '{{store.helpdesk_integration_id}}',
                            })),
                        conditions:
                            node.data.conditionsType === 'or'
                                ? {
                                      [node.data.conditionsType]:
                                          node.data.conditions,
                                  }
                                : node.data.conditionsType === 'and'
                                  ? {
                                        [node.data.conditionsType]:
                                            node.data.conditions,
                                    }
                                  : null,
                        outputs: [],
                    },
                }
                setLLMPromptObjectInputs(
                    g,
                    node,
                    trigger,
                    availableIntegrations,
                )

                c.triggers = [trigger]
                c.entrypoints = [
                    {
                        kind: 'llm-conversation',
                        trigger: 'llm-prompt',
                        settings: {
                            requires_confirmation:
                                node.data.requires_confirmation,
                            instructions: node.data.instructions,
                        },
                        deactivated_datetime: node.data.deactivated_datetime,
                    },
                ]

                return
            } else if (node.type === 'reusable_llm_prompt_trigger') {
                c.triggers = [
                    {
                        kind: 'reusable-llm-prompt',
                        settings: {
                            custom_inputs: node.data.inputs.filter(
                                (
                                    input,
                                ): input is Extract<
                                    NonNullable<
                                        WorkflowConfiguration['triggers']
                                    >[number],
                                    { kind: 'reusable-llm-prompt' }
                                >['settings']['custom_inputs'][number] =>
                                    'data_type' in input,
                            ),
                            object_inputs: node.data.inputs.filter(
                                (
                                    input,
                                ): input is Extract<
                                    ReusableLLMPromptTriggerNodeType['data']['inputs'][number],
                                    { kind: 'product' }
                                > =>
                                    'kind' in input && input.kind === 'product',
                            ),
                            outputs: [],
                        },
                    },
                ]
                c.entrypoints = [
                    {
                        kind: 'reusable-llm-prompt-call-step',
                        trigger: 'reusable-llm-prompt',
                        settings: {
                            requires_confirmation:
                                node.data.requires_confirmation,
                            conditions:
                                node.data.conditionsType === 'or'
                                    ? {
                                          [node.data.conditionsType]:
                                              node.data.conditions,
                                      }
                                    : node.data.conditionsType === 'and'
                                      ? {
                                            [node.data.conditionsType]:
                                                node.data.conditions,
                                        }
                                      : null,
                        },
                        deactivated_datetime: null,
                    },
                ]
                return
            } else if (node.type === 'automated_message') {
                const step: WorkflowStepMessage = {
                    id: node.id,
                    kind: 'message',
                    settings: {
                        message: {
                            content: node.data.content,
                        },
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id
            } else if (node.type === 'text_reply') {
                const step: WorkflowStepTextInput = {
                    id: node.id,
                    kind: 'text-input',
                    settings: {
                        message: {
                            content: node.data.content,
                        },
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id
            } else if (node.type === 'file_upload') {
                const step: WorkflowStepAttachmentsInput = {
                    id: node.id,
                    kind: 'attachments-input',
                    settings: {
                        message: {
                            content: node.data.content,
                        },
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id
            } else if (node.type === 'order_selection') {
                const step: WorkflowStepOrderSelection = {
                    id: node.id,
                    kind: 'order-selection',
                    settings: {
                        message: {
                            content: node.data.content,
                        },
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id
            } else if (node.type === 'multiple_choices') {
                const step: WorkflowStepChoices = {
                    id: node.id,
                    kind: 'choices',
                    settings: {
                        choices: node.data.choices,
                        message: {
                            content: node.data.content,
                        },
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id
            } else if (
                node.type === 'end' &&
                node.data.action === 'ask-for-feedback'
            ) {
                const step: WorkflowStepHelpfulPrompt = {
                    id: node.id,
                    kind: 'helpful-prompt',
                    settings: {
                        ticket_tags: node.data.ticketTags,
                        ticket_assignee_user_id: node.data.ticketAssigneeUserId,
                        ticket_assignee_team_id: node.data.ticketAssigneeTeamId,
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id
            } else if (
                node.type === 'end' &&
                node.data.action === 'create-ticket'
            ) {
                const step: WorkflowStepHandover = {
                    id: node.id,
                    kind: 'handover',
                    settings: {
                        ticket_tags: node.data.ticketTags,
                        ticket_assignee_user_id: node.data.ticketAssigneeUserId,
                        ticket_assignee_team_id: node.data.ticketAssigneeTeamId,
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id
            } else if (node.type === 'end' && node.data.action === 'end') {
                const step: WorkflowStepEnd = {
                    id: node.id,
                    kind: 'end',
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id
            } else if (
                node.type === 'end' &&
                node.data.action === 'end-success'
            ) {
                const step: WorkflowStepEnd = {
                    id: node.id,
                    kind: 'end',
                    settings: {
                        success: true,
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id
            } else if (
                node.type === 'end' &&
                node.data.action === 'end-failure'
            ) {
                const step: WorkflowStepEnd = {
                    id: node.id,
                    kind: 'end',
                    settings: {
                        success: false,
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id
            } else if (node.type === 'conditions') {
                const step: WorkflowStepConditions = {
                    id: node.id,
                    kind: 'conditions',
                    settings: {
                        name: node.data.name,
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id

                const trigger = c.triggers?.[0]

                if (trigger?.kind === 'llm-prompt') {
                    setLLMPromptObjectInputs(
                        g,
                        node,
                        trigger,
                        availableIntegrations,
                    )
                }

                if (trigger?.kind === 'reusable-llm-prompt') {
                    setReusableLLMPromptObjectInputs(g, node, trigger)
                }
            } else if (node.type === 'reusable_llm_prompt_call') {
                const step: WorkflowStepReusableLLMPromptCall = {
                    id: node.id,
                    kind: 'reusable-llm-prompt-call',
                    settings: {
                        objects: node.data.objects,
                        configuration_id: node.data.configuration_id,
                        custom_inputs: node.data.custom_inputs,
                        values: node.data.values,
                        configuration_internal_id:
                            node.data.configuration_internal_id,
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id

                const trigger = c.triggers?.[0]

                if (trigger?.kind === 'llm-prompt') {
                    if (node.data.objects?.customer) {
                        setLLMPromptCustomerObjectInput(trigger)
                    }

                    if (node.data.objects?.order) {
                        setLLMPromptOrderObjectInput(trigger)
                    }

                    const configuration = steps.find(
                        (step) => step.id === node.data.configuration_id,
                    )

                    configuration?.triggers?.forEach((t) => {
                        if (t.kind === 'reusable-llm-prompt') {
                            t.settings.outputs.forEach((output) => {
                                trigger.settings.outputs.push({
                                    id: ulid(),
                                    description: output.description,
                                    path: `steps_state.${node.id}.outputs.${output.id}`,
                                })
                            })
                        }
                    })
                    extractReferencedVariablesFromTheNode(
                        referencedVariables,
                        node,
                        g.edges,
                    )
                }
            } else if (node.type === 'http_request') {
                const headers = node.data.headers.reduce<
                    Record<string, string>
                >((acc, header) => {
                    acc[header.name.toLowerCase()] = header.value
                    return acc
                }, {})

                if (node.data.bodyContentType) {
                    headers['content-type'] = node.data.bodyContentType
                }

                let body: string | undefined | null

                switch (node.data.bodyContentType) {
                    case 'application/json':
                        body = node.data.json
                        break
                    case 'application/x-www-form-urlencoded': {
                        const entries = node.data.formUrlencoded?.map(
                            (entry) => [entry.key, entry.value],
                        )

                        body = unescapeUrlEncodedVariables(
                            new URLSearchParams(entries).toString(),
                        )
                        break
                    }
                }

                const step: WorkflowStepHttpRequest = {
                    id: node.id,
                    kind: 'http-request',
                    settings: {
                        name: node.data.name,
                        url: node.data.url,
                        method: node.data.method,
                        headers,
                        body,
                        oauth2_token_settings: node.data.oauth2TokenSettings,
                        trackstar_integration_name:
                            node.data.trackstar_integration_name,
                        service_connection_settings:
                            node.data.serviceConnectionSettings,
                        variables: node.data.variables.map((variable) => ({
                            ...variable,
                            data_type:
                                variable.data_type === 'json'
                                    ? null
                                    : variable.data_type,
                        })),
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id

                const trigger = c.triggers?.[0]
                const variablesByOutputPath = _keyBy(
                    step.settings.variables,
                    (variable) =>
                        `steps_state.${step.id}.content.${variable.id}`,
                )

                if (trigger?.kind === 'llm-prompt') {
                    setLLMPromptObjectInputs(
                        g,
                        node,
                        trigger,
                        availableIntegrations,
                    )
                }

                if (trigger?.kind === 'llm-prompt' && node.data.outputs) {
                    trigger.settings.outputs.push(
                        ...node.data.outputs.filter(
                            (output) => output.path in variablesByOutputPath,
                        ),
                    )
                }

                if (trigger?.kind === 'reusable-llm-prompt') {
                    setReusableLLMPromptObjectInputs(g, node, trigger)
                }

                if (
                    trigger?.kind === 'reusable-llm-prompt' &&
                    node.data.outputs
                ) {
                    trigger.settings.outputs.push(
                        ...node.data.outputs
                            .filter(
                                (output) =>
                                    output.path in variablesByOutputPath,
                            )
                            .map((output) => ({
                                ...output,
                                name: variablesByOutputPath[output.path].name,
                                data_type:
                                    variablesByOutputPath[output.path]
                                        .data_type,
                            })),
                    )
                }
            } else if (node.type === 'liquid_template') {
                const step: WorkflowStepLiquidTemplate = {
                    id: node.id,
                    kind: 'liquid-template',
                    settings: {
                        name: node.data.name,
                        template: node.data.template,
                        output: {
                            data_type: node.data.output.data_type,
                        },
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id

                const trigger = c.triggers?.[0]

                if (trigger?.kind === 'llm-prompt') {
                    setLLMPromptObjectInputs(
                        g,
                        node,
                        trigger,
                        availableIntegrations,
                    )
                }

                if (trigger?.kind === 'llm-prompt') {
                    trigger.settings.outputs.push({
                        id: ulid(),
                        description: node.data.name,
                        path: `steps_state.${node.id}.output`,
                    })
                }

                if (trigger?.kind === 'reusable-llm-prompt') {
                    setReusableLLMPromptObjectInputs(g, node, trigger)
                }

                if (trigger?.kind === 'reusable-llm-prompt') {
                    trigger.settings.outputs.push({
                        id: ulid(),
                        name: node.data.name,
                        description: node.data.name,
                        path: `steps_state.${node.id}.output`,
                        data_type: node.data.output.data_type,
                    })
                }
            } else if (node.type === 'shopper_authentication') {
                const step: WorkflowStepShopperAuthentication = {
                    id: node.id,
                    kind: 'shopper-authentication',
                    settings: {
                        integration_id: node.data.integrationId,
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id
            } else if (node.type === 'order_line_item_selection') {
                const step: WorkflowStepOrderLineItemSelection = {
                    id: node.id,
                    kind: 'order-line-item-selection',
                    settings: {
                        message: {
                            content: node.data.content,
                        },
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id
            } else if (node.type === 'cancel_order') {
                const step: WorkflowStepCancelOrder = {
                    id: node.id,
                    kind: 'cancel-order',
                    settings: {
                        customer_id: node.data.customerId,
                        order_external_id: node.data.orderExternalId,
                        integration_id: node.data.integrationId,
                        restock: node.data.restock,
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id

                const trigger = c.triggers?.[0]

                if (trigger?.kind === 'llm-prompt') {
                    trigger.settings.outputs.push({
                        id: node.id,
                        description: '',
                        path: `steps_state.${node.id}.success`,
                    })

                    setLLMPromptObjectInputs(
                        g,
                        node,
                        trigger,
                        availableIntegrations,
                    )
                }

                if (trigger?.kind === 'reusable-llm-prompt') {
                    setReusableLLMPromptObjectInputs(g, node, trigger)
                }
            } else if (node.type === 'refund_order') {
                const step: WorkflowStepRefundOrder = {
                    id: node.id,
                    kind: 'refund-order',
                    settings: {
                        customer_id: node.data.customerId,
                        order_external_id: node.data.orderExternalId,
                        integration_id: node.data.integrationId,
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id

                const trigger = c.triggers?.[0]

                if (trigger?.kind === 'llm-prompt') {
                    trigger.settings.outputs.push({
                        id: node.id,
                        description: '',
                        path: `steps_state.${node.id}.success`,
                    })

                    setLLMPromptObjectInputs(
                        g,
                        node,
                        trigger,
                        availableIntegrations,
                    )
                }

                if (trigger?.kind === 'reusable-llm-prompt') {
                    setReusableLLMPromptObjectInputs(g, node, trigger)
                }
            } else if (node.type === 'update_shipping_address') {
                const step: WorkflowStepUpdateShippingAddress = {
                    id: node.id,
                    kind: 'update-shipping-address',
                    settings: {
                        customer_id: node.data.customerId,
                        order_external_id: node.data.orderExternalId,
                        integration_id: node.data.integrationId,
                        name: node.data.name,
                        address1: node.data.address1,
                        address2: node.data.address2,
                        city: node.data.city,
                        zip: node.data.zip,
                        province: node.data.province,
                        country: node.data.country,
                        phone: node.data.phone,
                        last_name: node.data.lastName,
                        first_name: node.data.firstName,
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id

                const trigger = c.triggers?.[0]

                if (trigger?.kind === 'llm-prompt') {
                    trigger.settings.outputs.push({
                        id: node.id,
                        description: '',
                        path: `steps_state.${node.id}.success`,
                    })

                    setLLMPromptObjectInputs(
                        g,
                        node,
                        trigger,
                        availableIntegrations,
                    )
                }

                if (trigger?.kind === 'reusable-llm-prompt') {
                    setReusableLLMPromptObjectInputs(g, node, trigger)
                }
            } else if (node.type === 'remove_item') {
                const step: WorkflowStepRemoveItem = {
                    id: node.id,
                    kind: 'remove-item',
                    settings: {
                        customer_id: node.data.customerId,
                        order_external_id: node.data.orderExternalId,
                        integration_id: node.data.integrationId,
                        product_variant_id: node.data.productVariantId,
                        quantity: node.data.quantity,
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id

                const trigger = c.triggers?.[0]

                if (trigger?.kind === 'llm-prompt') {
                    trigger.settings.outputs.push({
                        id: node.id,
                        description: '',
                        path: `steps_state.${node.id}.success`,
                    })

                    setLLMPromptObjectInputs(
                        g,
                        node,
                        trigger,
                        availableIntegrations,
                    )
                }

                if (trigger?.kind === 'reusable-llm-prompt') {
                    setReusableLLMPromptObjectInputs(g, node, trigger)
                }
            } else if (node.type === 'replace_item') {
                const step: WorkflowStepReplaceItem = {
                    id: node.id,
                    kind: 'replace-item',
                    settings: {
                        customer_id: node.data.customerId,
                        order_external_id: node.data.orderExternalId,
                        integration_id: node.data.integrationId,
                        product_variant_id: node.data.productVariantId,
                        quantity: node.data.quantity,
                        added_product_variant_id:
                            node.data.addedProductVariantId,
                        added_quantity: node.data.addedQuantity,
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id

                const trigger = c.triggers?.[0]

                if (trigger?.kind === 'llm-prompt') {
                    trigger.settings.outputs.push({
                        id: node.id,
                        description: '',
                        path: `steps_state.${node.id}.success`,
                    })

                    setLLMPromptObjectInputs(
                        g,
                        node,
                        trigger,
                        availableIntegrations,
                    )
                }

                if (trigger?.kind === 'reusable-llm-prompt') {
                    setReusableLLMPromptObjectInputs(g, node, trigger)
                }
            } else if (node.type === 'create_discount_code') {
                // TODO remove when UI for merchant inputs is implemented
                setStaticInputs(
                    c,
                    [
                        {
                            id: 'discount_type',
                            name: 'Discount Type',
                            description: '',
                            data_type: 'string',
                            options: [
                                {
                                    label: 'Fixed amount (currency set in Shopify)',
                                    value: 'fixed',
                                },
                                {
                                    label: 'Percentange (%)',
                                    value: 'percentage',
                                },
                            ],
                        },
                        {
                            id: 'amount',
                            name: 'Discount amount',
                            description: '',
                            data_type: 'number',
                        },
                        {
                            id: 'valid_for',
                            name: 'How many days should the discount code be valid?',
                            description: '',
                            data_type: 'number',
                        },
                    ],
                    {
                        discount_type: 'fixed',
                        amount: 0,
                        valid_for: 0,
                    },
                )

                const step: WorkflowStepCreateDiscountCode = {
                    id: node.id,
                    kind: 'create-discount-code',
                    settings: {
                        integration_id: node.data.integrationId,
                        type: '{{values.discount_type}}',
                        amount: '{{values.amount}}',
                        valid_for: '{{values.valid_for}}',
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id

                const trigger = c.triggers?.[0]

                if (trigger?.kind === 'llm-prompt') {
                    trigger.settings.outputs.push({
                        id: node.id,
                        description: 'Created discount code',
                        path: `steps_state.${node.id}.discount_code`,
                    })

                    setLLMPromptObjectInputs(
                        g,
                        node,
                        trigger,
                        availableIntegrations,
                    )
                }

                if (trigger?.kind === 'reusable-llm-prompt') {
                    trigger.settings.outputs.push({
                        id: node.id,
                        name: 'Discount code',
                        description: '',
                        path: `steps_state.${node.id}.discount_code`,
                        data_type: 'string',
                    })

                    setReusableLLMPromptObjectInputs(g, node, trigger)
                }
            } else if (node.type === 'edit_order_note') {
                // TODO remove when UI for merchant inputs is implemented
                setStaticInputs(
                    c,
                    [
                        {
                            id: 'note',
                            name: 'Order Note',
                            description: '',
                            data_type: 'string',
                        },
                    ],
                    {
                        note: '',
                    },
                )

                const step: WorkflowStepEditOrderNote = {
                    id: node.id,
                    kind: 'edit-order-note',
                    settings: {
                        integration_id: node.data.integrationId,
                        note: '{{values.note}}',
                        customer_id: node.data.customerId,
                        order_external_id: node.data.orderExternalId,
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id

                const trigger = c.triggers?.[0]

                if (trigger?.kind === 'llm-prompt') {
                    trigger.settings.outputs.push({
                        id: node.id,
                        description: 'Order note updated',
                        path: `steps_state.${node.id}.success`,
                    })

                    setLLMPromptObjectInputs(
                        g,
                        node,
                        trigger,
                        availableIntegrations,
                    )
                }

                if (trigger?.kind === 'reusable-llm-prompt') {
                    trigger.settings.outputs.push({
                        id: node.id,
                        name: 'Order note',
                        description: '',
                        path: `steps_state.${node.id}.success`,
                        data_type: 'string',
                    })

                    setReusableLLMPromptObjectInputs(g, node, trigger)
                }
            } else if (node.type === 'reship_for_free') {
                const step: WorkflowStepReshipForFree = {
                    id: node.id,
                    kind: 'reship-for-free',
                    settings: {
                        customer_id: node.data.customerId,
                        order_external_id: node.data.orderExternalId,
                        integration_id: node.data.integrationId,
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id

                const trigger = c.triggers?.[0]

                if (trigger?.kind === 'llm-prompt') {
                    trigger.settings.outputs.push({
                        id: node.id,
                        description: '',
                        path: `steps_state.${node.id}.success`,
                    })

                    setLLMPromptObjectInputs(
                        g,
                        node,
                        trigger,
                        availableIntegrations,
                    )
                }

                if (trigger?.kind === 'reusable-llm-prompt') {
                    setReusableLLMPromptObjectInputs(g, node, trigger)
                }
            } else if (node.type === 'refund_shipping_costs') {
                const step: WorkflowStepRefundShippingCosts = {
                    id: node.id,
                    kind: 'refund-shipping-costs',
                    settings: {
                        customer_id: node.data.customerId,
                        order_external_id: node.data.orderExternalId,
                        integration_id: node.data.integrationId,
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id

                const trigger = c.triggers?.[0]

                if (trigger?.kind === 'llm-prompt') {
                    trigger.settings.outputs.push({
                        id: node.id,
                        description: '',
                        path: `steps_state.${node.id}.success`,
                    })

                    setLLMPromptObjectInputs(
                        g,
                        node,
                        trigger,
                        availableIntegrations,
                    )
                }

                if (trigger?.kind === 'reusable-llm-prompt') {
                    setReusableLLMPromptObjectInputs(g, node, trigger)
                }
            } else if (node.type === 'cancel_subscription') {
                const step: WorkflowStepCancelSubscription = {
                    id: node.id,
                    kind: 'cancel-subscription',
                    settings: {
                        customer_id: node.data.customerId,
                        integration_id: node.data.integrationId,
                        subscription_id: node.data.subscriptionId,
                        reason: node.data.reason,
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id

                const trigger = c.triggers?.[0]

                if (trigger?.kind === 'llm-prompt') {
                    trigger.settings.outputs.push({
                        id: node.id,
                        description: '',
                        path: `steps_state.${node.id}.success`,
                    })

                    setLLMPromptObjectInputs(
                        g,
                        node,
                        trigger,
                        availableIntegrations,
                    )
                }

                if (trigger?.kind === 'reusable-llm-prompt') {
                    setReusableLLMPromptObjectInputs(g, node, trigger)
                }
            } else if (node.type === 'skip_charge') {
                const step: WorkflowStepSkipCharge = {
                    id: node.id,
                    kind: 'skip-charge',
                    settings: {
                        customer_id: node.data.customerId,
                        integration_id: node.data.integrationId,
                        subscription_id: node.data.subscriptionId,
                        charge_id: node.data.chargeId,
                    },
                }
                c.steps.push(step)
                stepIdByNodeId[node.id] = step.id

                const trigger = c.triggers?.[0]

                if (trigger?.kind === 'llm-prompt') {
                    trigger.settings.outputs.push({
                        id: node.id,
                        description: '',
                        path: `steps_state.${node.id}.success`,
                    })

                    setLLMPromptObjectInputs(
                        g,
                        node,
                        trigger,
                        availableIntegrations,
                    )
                }

                if (trigger?.kind === 'reusable-llm-prompt') {
                    setReusableLLMPromptObjectInputs(g, node, trigger)
                }
            } else {
                return
            }

            if (previousNode && stepIdByNodeId[previousNode.id]) {
                c.transitions.push({
                    id: ulid(),
                    from_step_id: stepIdByNodeId[previousNode.id],
                    to_step_id: stepIdByNodeId[node.id],
                    name: incomingEdge?.data?.name,
                    event: incomingEdge?.data?.event,
                    conditions: incomingEdge?.data?.conditions
                        ? cleanConditionsFromEmptyVariables(
                              incomingEdge.data.conditions,
                              getWorkflowVariableListForNode(
                                  g,
                                  node.id,
                                  steps,
                                  [],
                              ),
                          )
                        : undefined,
                })
            } else {
                c.initial_step_id = stepIdByNodeId[node.id]
            }
        },
    )

    setCustomInputs(c, referencedVariables)
    return c
}

export function getIncoming(
    visualBuilderGraph: VisualBuilderGraph,
    currentNodeId: string,
    type:
        | 'choice'
        | 'conditions'
        | 'http_request'
        | 'cancel_order'
        | 'refund_order'
        | 'update_shipping_address'
        | 'remove_item'
        | 'create_discount_code'
        | 'refund_shipping_costs'
        | 'reship_for_free'
        | 'cancel_subscription'
        | 'skip_charge'
        | 'reusable_llm_prompt_call'
        | 'edit_order_note',
    steps: WorkflowConfiguration[],
) {
    const incomingEdge = visualBuilderGraph.edges.find(
        ({ target }) => target === currentNodeId,
    )

    if (!incomingEdge) {
        return
    }

    const previousNodeId = incomingEdge.source
    const previousNode = previousNodeId
        ? visualBuilderGraph.nodes.find(({ id }) => id === previousNodeId)
        : undefined

    switch (type) {
        case 'choice': {
            const choiceEventId = incomingEdge.data?.event?.id
            const choiceIndex =
                previousNode?.type === 'multiple_choices' &&
                choiceEventId != null
                    ? previousNode.data.choices.findIndex(
                          ({ event_id }) => event_id === choiceEventId,
                      )
                    : -1
            if (
                choiceIndex >= 0 &&
                previousNode &&
                isMultipleChoicesNodeType(previousNode)
            ) {
                const choice = previousNode.data.choices[choiceIndex]
                return {
                    label: choice.label || `Option ${choiceIndex + 1}`,
                    eventId: choice.event_id,
                    nodeId: previousNode.id,
                }
            }
            break
        }
        case 'http_request': {
            const branchName = incomingEdge.data?.name
            const branchId = incomingEdge.id

            if (previousNode && isHttpRequestNodeType(previousNode)) {
                return {
                    id: branchId,
                    label: branchName,
                    nodeId: previousNode.id,
                    isFallback: !incomingEdge.data?.conditions,
                }
            }
            break
        }
        case 'cancel_order':
        case 'refund_order':
        case 'update_shipping_address':
        case 'remove_item':
        case 'create_discount_code':
        case 'refund_shipping_costs':
        case 'reship_for_free':
        case 'cancel_subscription':
        case 'skip_charge':
        case 'edit_order_note': {
            const branchName = incomingEdge.data?.name

            if (previousNode && previousNode.type === type) {
                return {
                    label: branchName,
                    nodeId: previousNode.id,
                }
            }

            break
        }
        case 'reusable_llm_prompt_call': {
            const branchName = incomingEdge.data?.name

            if (previousNode && previousNode.type === type) {
                const configuration = steps.find(
                    (step) =>
                        step.id === previousNode.data.configuration_id &&
                        step.internal_id ===
                            previousNode.data.configuration_internal_id,
                )

                const isClickable =
                    !!configuration?.inputs?.length ||
                    (configuration?.apps?.[0]?.type === 'app' &&
                        !visualBuilderGraph.isTemplate)

                return {
                    label: branchName,
                    nodeId: previousNode.id,
                    isClickable,
                }
            }

            break
        }
        case 'conditions': {
            const branchName = incomingEdge.data?.name
            const branchId = incomingEdge.id

            if (previousNode && isConditionsNodeType(previousNode)) {
                return {
                    id: branchId,
                    label: branchName,
                    nodeId: previousNode.id,
                    isFallback: !incomingEdge.data?.conditions,
                }
            }
        }
    }

    return undefined
}

export function isNodeUniquePerPath(
    type: VisualBuilderNode['type'],
    graph: VisualBuilderGraph,
    nodeId: string,
) {
    const { nodes } = graph
    const childrenIds: Set<string> = new Set()
    walkVisualBuilderGraph(
        graph,
        nodeId,
        (node) => {
            childrenIds.add(node.id)
        },
        'upwards',
    )
    walkVisualBuilderGraph(
        graph,
        nodeId,
        (node) => {
            childrenIds.add(node.id)
        },
        'downwards',
    )

    return !Boolean(
        nodes.find((node) => childrenIds.has(node.id) && node.type === type),
    )
}

export function hasParentNodeInPath(
    type: VisualBuilderNode['type'],
    graph: VisualBuilderGraph,
    nodeId: string,
) {
    let hasParentNode = false

    walkVisualBuilderGraph(
        graph,
        nodeId,
        (node) => {
            if (node.type === type && node.id !== nodeId) {
                hasParentNode = true
            }
        },
        'upwards',
    )

    return hasParentNode
}

export function getGraphTouched(): NonNullable<VisualBuilderGraph['touched']> {
    return {
        name: true,
        nodes: true,
    }
}

export function getGraphAppAppTouched(
    authType: ActionsApp['auth_type'],
): NonNullable<VisualBuilderGraphAppApp['touched']> {
    switch (authType) {
        case 'api-key':
            return {
                api_key: true,
            }
        case 'oauth2-token':
            return {
                refresh_token: true,
            }
        case 'trackstar':
            return {
                trackstar_connection: true,
            }
    }
}

export function getGraphAppAppErrors(
    app: VisualBuilderGraphAppApp,
    trackstarConnection?: TrackstarConnection,
): VisualBuilderGraphAppApp['errors'] {
    let errors: VisualBuilderGraphAppApp['errors'] = null

    if (app.touched?.api_key && !app.api_key?.trim()) {
        errors = mergeErrors(errors, 'api_key', 'API key is required')
    }

    if (app.touched?.refresh_token && !app.refresh_token?.trim()) {
        errors = mergeErrors(
            errors,
            'refresh_token',
            'Refresh token is required',
        )
    }

    if (app.touched?.trackstar_connection && !trackstarConnection) {
        errors = mergeErrors(
            errors,
            'trackstar_connection',
            'Trackstar connection is required',
        )
    }

    return errors
}

function mergeErrors<T extends VisualBuilderNode['data']['errors']>(
    errors: T,
    path: string,
    error: string,
): NonNullable<T> {
    return _merge(_setWith({}, path, error, Object), errors)
}

export function getLLMPromptTriggerNodeTouched(
    node: LLMPromptTriggerNodeType,
): NonNullable<LLMPromptTriggerNodeType['data']['touched']> {
    return {
        instructions: true,
        inputs: node.data.inputs.reduce<
            Record<
                string,
                {
                    name?: boolean
                    instructions?: boolean
                }
            >
        >(
            (touched, input) => ({
                ...touched,
                [input.id]: {
                    name: true,
                    instructions: true,
                },
            }),
            {},
        ),
        conditions: node.data.conditions.reduce<Record<string, boolean>>(
            (touched, _condition, index) => ({
                ...touched,
                [index]: true,
            }),
            {},
        ),
    }
}

export function getLLMPromptTriggerNodeErrors(
    node: LLMPromptTriggerNodeType,
    variables: WorkflowVariableList,
): LLMPromptTriggerNodeType['data']['errors'] {
    let errors: LLMPromptTriggerNodeType['data']['errors'] = null

    if (node.data.touched?.instructions && !node.data.instructions.trim()) {
        errors = mergeErrors(errors, 'instructions', 'Description is required')
    }

    node.data.inputs.forEach((input) => {
        if (node.data.touched?.inputs?.[input.id]?.name && !input.name.trim()) {
            errors = mergeErrors(
                errors,
                `inputs.${input.id}.name`,
                'Name is required',
            )
        }

        if (
            node.data.touched?.inputs?.[input.id]?.instructions &&
            !input.instructions.trim()
        ) {
            errors = mergeErrors(
                errors,
                `inputs.${input.id}.instructions`,
                'Description is required',
            )
        }
    })

    if (node.data.conditionsType) {
        if (!node.data.conditions.length) {
            if (node.data.touched?.conditions) {
                errors = mergeErrors(
                    errors,
                    `conditions`,
                    'Add conditions or select "No conditions required"',
                )
            }
        } else {
            for (let index = 0; index < node.data.conditions.length; index++) {
                if (
                    typeof node.data.touched?.conditions !== 'object' ||
                    !node.data.touched?.conditions?.[index]
                ) {
                    continue
                }

                const condition = node.data.conditions[index]
                const key = Object.keys(condition)[0] as AllKeys<
                    typeof condition
                >
                const schema = condition[key]!

                const variableInUse = schema[0].var
                const variable = parseWorkflowVariable(variableInUse, variables)

                if (!variable) {
                    errors = mergeErrors(
                        errors,
                        `conditions.${index}`,
                        'Invalid variables',
                    )
                } else if (
                    variable.type === 'date' &&
                    (key === 'greaterThan' || key === 'lessThan') &&
                    !schema[1]
                ) {
                    errors = mergeErrors(
                        errors,
                        `conditions.${index}`,
                        'Choose a date',
                    )
                } else if (
                    key !== 'exists' &&
                    key !== 'doesNotExist' &&
                    typeof schema[1] === 'undefined'
                ) {
                    errors = mergeErrors(
                        errors,
                        `conditions.${index}`,
                        'Enter a value',
                    )
                } else if (
                    variable.type === 'string' &&
                    typeof schema[1] === 'string' &&
                    !schema[1].trim()
                ) {
                    errors = mergeErrors(
                        errors,
                        `conditions.${index}`,
                        'Enter a value',
                    )
                } else if (
                    variable.type === 'number' &&
                    typeof schema[1] !== 'number' &&
                    key !== 'exists' &&
                    key !== 'doesNotExist'
                ) {
                    errors = mergeErrors(
                        errors,
                        `conditions.${index}`,
                        'Enter a value',
                    )
                }
            }
        }
    }

    return errors
}

export function getHTTPRequestNodeTouched(
    node: HttpRequestNodeType,
): NonNullable<HttpRequestNodeType['data']['touched']> {
    return {
        name: true,
        url: true,
        headers: node.data.headers.reduce<
            Record<
                string,
                {
                    name?: boolean
                    value?: boolean
                }
            >
        >(
            (touched, _header, index) => ({
                ...touched,
                [index]: {
                    name: true,
                    value: true,
                },
            }),
            {},
        ),
        json: true,
        formUrlencoded: node.data.formUrlencoded?.reduce<
            Record<
                string,
                {
                    key?: boolean
                    value?: boolean
                }
            >
        >(
            (touched, _header, index) => ({
                ...touched,
                [index]: {
                    key: true,
                    value: true,
                },
            }),
            {},
        ),
        variables: node.data.variables?.reduce<
            Record<
                string,
                {
                    name?: boolean
                    jsonpath?: boolean
                }
            >
        >(
            (touched, _header, index) => ({
                ...touched,
                [index]: {
                    name: true,
                    jsonpath: true,
                },
            }),
            {},
        ),
    }
}

export function getHTTPRequestNodeErrors(
    node: HttpRequestNodeType,
    variables: WorkflowVariableList,
): HttpRequestNodeType['data']['errors'] {
    let errors: HttpRequestNodeType['data']['errors'] = null

    if (node.data.touched?.name && !node.data.name.trim()) {
        errors = mergeErrors(errors, 'name', 'Request name is required')
    }

    if (node.data.touched?.url) {
        const isServiceConnection = !!node.data.serviceConnectionSettings
        const urlOrPath = isServiceConnection
            ? (node.data.serviceConnectionSettings?.path ?? '')
            : node.data.url

        if (!urlOrPath.trim()) {
            errors = mergeErrors(
                errors,
                'url',
                isServiceConnection ? 'Path is required' : 'URL is required',
            )
        } else if (!isServiceConnection) {
            const error = validateWebhookURL(node.data.url)

            if (error) {
                errors = mergeErrors(errors, 'url', error)
            } else if (hasInvalidVariables(node.data.url, variables)) {
                errors = mergeErrors(errors, 'url', 'Invalid variables')
            } else if (!isValidLiquidSyntax(node.data.url)) {
                errors = mergeErrors(errors, 'url', 'Invalid variables syntax')
            }
        } else {
            if (hasInvalidVariables(urlOrPath, variables)) {
                errors = mergeErrors(errors, 'url', 'Invalid variables')
            } else if (!isValidLiquidSyntax(urlOrPath)) {
                errors = mergeErrors(errors, 'url', 'Invalid variables syntax')
            }
        }
    }

    node.data.headers.forEach((header, index) => {
        if (node.data.touched?.headers?.[index]?.name) {
            if (!header.name.trim()) {
                errors = mergeErrors(
                    errors,
                    `headers.${index}.name`,
                    'Name is required',
                )
            } else if (!validateHttpHeaderName(header.name)) {
                errors = mergeErrors(errors, `headers.${index}`, 'Invalid name')
            }
        }

        if (node.data.touched?.headers?.[index]?.value) {
            if (!header.value.trim()) {
                errors = mergeErrors(
                    errors,
                    `headers.${index}.value`,
                    'Value is required',
                )
            } else if (hasInvalidVariables(header.value, variables)) {
                errors = mergeErrors(
                    errors,
                    `headers.${index}.value`,
                    'Invalid variables',
                )
            } else if (!isValidLiquidSyntax(header.value)) {
                errors = mergeErrors(
                    errors,
                    `headers.${index}.value`,
                    'Invalid variables syntax',
                )
            }
        }
    })

    switch (node.data.bodyContentType) {
        case 'application/json':
            {
                if (!node.data.touched?.json) {
                    break
                }

                if (hasInvalidVariables(node.data.json ?? '', variables)) {
                    errors = mergeErrors(errors, `json`, 'Invalid variables')
                } else if (
                    !validateJSONWithVariables(node.data.json ?? '', variables)
                ) {
                    errors = mergeErrors(errors, `json`, 'Invalid JSON')
                } else if (!isValidLiquidSyntax(node.data.json ?? '')) {
                    errors = mergeErrors(
                        errors,
                        `json`,
                        'Invalid variables syntax',
                    )
                }
            }
            break
        case 'application/x-www-form-urlencoded':
            {
                node.data.formUrlencoded?.forEach((item, index) => {
                    if (
                        node.data.touched?.formUrlencoded?.[index]?.key &&
                        !item.key.trim()
                    ) {
                        errors = mergeErrors(
                            errors,
                            `formUrlencoded.${index}.key`,
                            'Key is required',
                        )
                    }

                    if (node.data.touched?.formUrlencoded?.[index]?.value) {
                        if (!item.value.trim()) {
                            errors = mergeErrors(
                                errors,
                                `formUrlencoded.${index}.value`,
                                'Value is required',
                            )
                        } else if (hasInvalidVariables(item.value, variables)) {
                            errors = mergeErrors(
                                errors,
                                `formUrlencoded.${index}.value`,
                                'Invalid variables',
                            )
                        } else if (!isValidLiquidSyntax(item.value)) {
                            errors = mergeErrors(
                                errors,
                                `formUrlencoded.${index}.value`,
                                'Invalid variables syntax',
                            )
                        }
                    }
                })
            }
            break
    }

    node.data.variables.forEach((variable, index) => {
        if (
            node.data.touched?.variables?.[index]?.name &&
            !variable.name.trim()
        ) {
            errors = mergeErrors(
                errors,
                `variables.${index}.name`,
                'Name is required',
            )
        }

        if (
            node.data.touched?.variables?.[index]?.jsonpath &&
            !variable.jsonpath.trim()
        ) {
            errors = mergeErrors(
                errors,
                `variables.${index}.jsonpath`,
                'JSONPath is required',
            )
        }
    })

    return errors
}

export function getConditionsNodeTouched(
    edges: VisualBuilderGraph['edges'],
    node: ConditionsNodeType,
): NonNullable<ConditionsNodeType['data']['touched']> {
    return {
        branches: edges
            .filter((edge) => edge.source === node.id && edge.data?.conditions)
            .reduce<
                Record<
                    string,
                    {
                        name?: boolean
                        conditions?: boolean | Record<string, boolean>
                    }
                >
            >(
                (touched, edge) => ({
                    ...touched,
                    [edge.id]: {
                        name: true,
                        conditions: (
                            edge.data?.conditions?.and ??
                            edge.data?.conditions?.or ??
                            []
                        ).reduce<Record<string, boolean>>(
                            (touched, _condition, index) => ({
                                ...touched,
                                [index]: true,
                            }),
                            {},
                        ),
                    },
                }),
                {},
            ),
    }
}

export function getConditionsNodeErrors(
    edges: VisualBuilderGraph['edges'],
    node: ConditionsNodeType,
    variables: WorkflowVariableList,
): ConditionsNodeType['data']['errors'] {
    let errors: ConditionsNodeType['data']['errors'] = null

    edges
        .filter((edge) => edge.source === node.id && edge.data?.conditions)
        .forEach((edge) => {
            if (
                node.data.touched?.branches?.[edge.id]?.name &&
                !edge.data?.name?.trim()
            ) {
                errors = mergeErrors(
                    errors,
                    `branches.${edge.id}.name`,
                    'Name is required',
                )
            }

            const conditions = edge.data?.conditions?.and
                ? edge.data.conditions.and
                : (edge.data?.conditions?.or ?? [])

            if (
                node.data.touched?.branches?.[edge.id]?.conditions &&
                !conditions.length
            ) {
                errors = mergeErrors(
                    errors,
                    `branches.${edge.id}.conditions`,
                    'A branch must have at least 1 condition',
                )
            } else {
                for (let index = 0; index < conditions.length; index++) {
                    const touched =
                        node.data.touched?.branches?.[edge.id]?.conditions

                    if (typeof touched !== 'object' || !touched?.[index]) {
                        continue
                    }

                    const condition = conditions[index]
                    const key = Object.keys(condition)[0] as AllKeys<
                        typeof condition
                    >
                    const schema = condition[key]!

                    const variableInUse = schema[0].var
                    const variable = parseWorkflowVariable(
                        variableInUse,
                        variables,
                    )

                    if (!variable) {
                        errors = mergeErrors(
                            errors,
                            `branches.${edge.id}.conditions.${index}`,
                            'Invalid variables',
                        )
                    } else if (
                        variable.type === 'date' &&
                        (key === 'greaterThan' || key === 'lessThan') &&
                        !schema[1]
                    ) {
                        errors = mergeErrors(
                            errors,
                            `branches.${edge.id}.conditions.${index}`,
                            'Choose a date',
                        )
                    } else if (
                        key !== 'exists' &&
                        key !== 'doesNotExist' &&
                        typeof schema[1] === 'undefined'
                    ) {
                        errors = mergeErrors(
                            errors,
                            `branches.${edge.id}.conditions.${index}`,
                            'Enter a value',
                        )
                    } else if (
                        variable.type === 'string' &&
                        typeof schema[1] === 'string' &&
                        !schema[1].trim()
                    ) {
                        errors = mergeErrors(
                            errors,
                            `branches.${edge.id}.conditions.${index}`,
                            'Enter a value',
                        )
                    } else if (
                        variable.type === 'number' &&
                        typeof schema[1] !== 'number' &&
                        key !== 'exists' &&
                        key !== 'doesNotExist'
                    ) {
                        errors = mergeErrors(
                            errors,
                            `branches.${edge.id}.conditions.${index}`,
                            'Enter a value',
                        )
                    }
                }
            }
        })

    return errors
}

export function getChannelTriggerNodeTouched(): NonNullable<
    ChannelTriggerNodeType['data']['touched']
> {
    return {
        label: true,
    }
}

export function getChannelTriggerNodeErrors(
    node: ChannelTriggerNodeType,
): ChannelTriggerNodeType['data']['errors'] {
    let errors: ChannelTriggerNodeType['data']['errors'] = null

    if (node.data.touched?.label && !node.data.label.trim()) {
        errors = mergeErrors(errors, 'label', 'Trigger button is required')
    }

    return errors
}

export function getReusableLLMPromptTriggerNodeTouched(
    node: ReusableLLMPromptTriggerNodeType,
): NonNullable<ReusableLLMPromptTriggerNodeType['data']['touched']> {
    return {
        inputs: node.data.inputs.reduce<
            Record<
                string,
                {
                    name?: boolean
                    instructions?: boolean
                }
            >
        >(
            (touched, input) => ({
                ...touched,
                [input.id]: {
                    name: true,
                    instructions: true,
                },
            }),
            {},
        ),
        conditions: node.data.conditions.reduce<Record<string, boolean>>(
            (touched, _condition, index) => ({
                ...touched,
                [index]: true,
            }),
            {},
        ),
    }
}

export function getReusableLLMPromptTriggerNodeErrors(
    node: ReusableLLMPromptTriggerNodeType,
    variables: WorkflowVariableList,
): ReusableLLMPromptTriggerNodeType['data']['errors'] {
    let errors: ReusableLLMPromptTriggerNodeType['data']['errors'] = null

    node.data.inputs.forEach((input) => {
        if (node.data.touched?.inputs?.[input.id]?.name && !input.name.trim()) {
            errors = mergeErrors(
                errors,
                `inputs.${input.id}.name`,
                'Name is required',
            )
        }

        if (
            node.data.touched?.inputs?.[input.id]?.instructions &&
            !input.instructions.trim()
        ) {
            errors = mergeErrors(
                errors,
                `inputs.${input.id}.instructions`,
                'Description is required',
            )
        }
    })

    if (node.data.conditionsType) {
        if (!node.data.conditions.length) {
            if (node.data.touched?.conditions) {
                errors = mergeErrors(
                    errors,
                    `conditions`,
                    'Add conditions or select "No conditions required"',
                )
            }
        } else {
            for (let index = 0; index < node.data.conditions.length; index++) {
                if (
                    typeof node.data.touched?.conditions !== 'object' ||
                    !node.data.touched?.conditions?.[index]
                ) {
                    continue
                }

                const condition = node.data.conditions[index]
                const key = Object.keys(condition)[0] as AllKeys<
                    typeof condition
                >
                const schema = condition[key]!

                const variableInUse = schema[0].var
                const variable = parseWorkflowVariable(variableInUse, variables)

                if (!variable) {
                    errors = mergeErrors(
                        errors,
                        `conditions.${index}`,
                        'Invalid variables',
                    )
                } else if (
                    variable.type === 'date' &&
                    (key === 'greaterThan' || key === 'lessThan') &&
                    !schema[1]
                ) {
                    errors = mergeErrors(
                        errors,
                        `conditions.${index}`,
                        'Choose a date',
                    )
                } else if (
                    key !== 'exists' &&
                    key !== 'doesNotExist' &&
                    typeof schema[1] === 'undefined'
                ) {
                    errors = mergeErrors(
                        errors,
                        `conditions.${index}`,
                        'Enter a value',
                    )
                } else if (
                    variable.type === 'string' &&
                    typeof schema[1] === 'string' &&
                    !schema[1].trim()
                ) {
                    errors = mergeErrors(
                        errors,
                        `conditions.${index}`,
                        'Enter a value',
                    )
                } else if (
                    variable.type === 'number' &&
                    typeof schema[1] !== 'number'
                ) {
                    errors = mergeErrors(
                        errors,
                        `conditions.${index}`,
                        'Enter a value',
                    )
                }
            }
        }
    }

    return errors
}

export function getMultipleChoicesNodeTouched(
    node: MultipleChoicesNodeType,
): NonNullable<MultipleChoicesNodeType['data']['touched']> {
    return {
        content: true,
        choices: node.data.choices.reduce<Record<string, { label?: boolean }>>(
            (touched, choice) => ({
                ...touched,
                [choice.event_id]: {
                    label: true,
                },
            }),
            {},
        ),
    }
}

export function getMultipleChoicesNodeErrors(
    node: MultipleChoicesNodeType,
    variables: WorkflowVariableList,
): MultipleChoicesNodeType['data']['errors'] {
    let errors: MultipleChoicesNodeType['data']['errors'] = null

    if (node.data.touched?.content) {
        if (!node.data.content.text.trim()) {
            errors = mergeErrors(errors, `content`, 'Question is required')
        } else if (hasInvalidVariables(node.data.content.text, variables)) {
            errors = mergeErrors(errors, `content`, 'Invalid variables')
        } else if (!isValidLiquidSyntax(node.data.content.text)) {
            errors = mergeErrors(errors, `content`, 'Invalid variables syntax')
        }
    }

    node.data.choices.forEach((choice) => {
        if (node.data.touched?.choices?.[choice.event_id]?.label) {
            if (!choice.label.trim()) {
                errors = mergeErrors(
                    errors,
                    `choices.${choice.event_id}.label`,
                    'Option label is required',
                )
            } else if (hasInvalidVariables(choice.label, variables)) {
                errors = mergeErrors(
                    errors,
                    `choices.${choice.event_id}.label`,
                    'Invalid variables',
                )
            } else if (!isValidLiquidSyntax(choice.label)) {
                errors = mergeErrors(
                    errors,
                    `choices.${choice.event_id}.label`,
                    'Invalid variables syntax',
                )
            }
        }
    })

    return errors
}

export function getAutomatedMessageNodeTouched(): NonNullable<
    AutomatedMessageNodeType['data']['touched']
> {
    return {
        content: true,
    }
}

export function getAutomatedMessageNodeErrors(
    node: AutomatedMessageNodeType,
    variables: WorkflowVariableList,
): AutomatedMessageNodeType['data']['errors'] {
    let errors: AutomatedMessageNodeType['data']['errors'] = null

    if (node.data.touched?.content) {
        if (!node.data.content.text.trim()) {
            errors = mergeErrors(errors, `content`, 'Message is required')
        } else if (hasInvalidVariables(node.data.content.text, variables)) {
            errors = mergeErrors(errors, `content`, 'Invalid variables')
        } else if (!isValidLiquidSyntax(node.data.content.text)) {
            errors = mergeErrors(errors, `content`, 'Invalid variables syntax')
        }
    }

    return errors
}

export function getTextReplyNodeTouched(): NonNullable<
    TextReplyNodeType['data']['touched']
> {
    return {
        content: true,
    }
}

export function getTextReplyNodeErrors(
    node: TextReplyNodeType,
    variables: WorkflowVariableList,
): TextReplyNodeType['data']['errors'] {
    let errors: TextReplyNodeType['data']['errors'] = null

    if (node.data.touched?.content) {
        if (!node.data.content.text.trim()) {
            errors = mergeErrors(errors, `content`, 'Message is required')
        } else if (hasInvalidVariables(node.data.content.text, variables)) {
            errors = mergeErrors(errors, `content`, 'Invalid variables')
        } else if (!isValidLiquidSyntax(node.data.content.text)) {
            errors = mergeErrors(errors, `content`, 'Invalid variables syntax')
        }
    }

    return errors
}

export function getFileUploadNodeTouched(): NonNullable<
    FileUploadNodeType['data']['touched']
> {
    return {
        content: true,
    }
}

export function getFileUploadNodeErrors(
    node: FileUploadNodeType,
    variables: WorkflowVariableList,
): FileUploadNodeType['data']['errors'] {
    let errors: FileUploadNodeType['data']['errors'] = null

    if (node.data.touched?.content) {
        if (!node.data.content.text.trim()) {
            errors = mergeErrors(errors, `content`, 'Message is required')
        } else if (hasInvalidVariables(node.data.content.text, variables)) {
            errors = mergeErrors(errors, `content`, 'Invalid variables')
        } else if (!isValidLiquidSyntax(node.data.content.text)) {
            errors = mergeErrors(errors, `content`, 'Invalid variables syntax')
        }
    }

    return errors
}

export function getOrderSelectionNodeTouched(): NonNullable<
    OrderSelectionNodeType['data']['touched']
> {
    return {
        content: true,
    }
}

export function getOrderSelectionNodeErrors(
    node: OrderSelectionNodeType,
    variables: WorkflowVariableList,
): OrderSelectionNodeType['data']['errors'] {
    let errors: OrderSelectionNodeType['data']['errors'] = null

    if (node.data.touched?.content) {
        if (!node.data.content.text.trim()) {
            errors = mergeErrors(errors, `content`, 'Message is required')
        } else if (hasInvalidVariables(node.data.content.text, variables)) {
            errors = mergeErrors(errors, `content`, 'Invalid variables')
        } else if (!isValidLiquidSyntax(node.data.content.text)) {
            errors = mergeErrors(errors, `content`, 'Invalid variables syntax')
        }
    }

    return errors
}

export function getOrderLineItemSelectionNodeTouched(): NonNullable<
    OrderLineItemSelectionNodeType['data']['touched']
> {
    return {
        content: true,
    }
}

export function getOrderLineItemSelectionNodeErrors(
    node: OrderLineItemSelectionNodeType,
    variables: WorkflowVariableList,
): OrderLineItemSelectionNodeType['data']['errors'] {
    let errors: OrderLineItemSelectionNodeType['data']['errors'] = null

    if (node.data.touched?.content) {
        if (!node.data.content.text.trim()) {
            errors = mergeErrors(errors, `content`, 'Message is required')
        } else if (hasInvalidVariables(node.data.content.text, variables)) {
            errors = mergeErrors(errors, `content`, 'Invalid variables')
        } else if (!isValidLiquidSyntax(node.data.content.text)) {
            errors = mergeErrors(errors, `content`, 'Invalid variables syntax')
        }
    }

    return errors
}

export function getSkipChargeNodeTouched(): NonNullable<
    SkipChargeNodeType['data']['touched']
> {
    return {
        subscriptionId: true,
        chargeId: true,
    }
}

export function getSkipChargeNodeErrors(
    node: SkipChargeNodeType,
    variables: WorkflowVariableList,
): SkipChargeNodeType['data']['errors'] {
    let errors: SkipChargeNodeType['data']['errors'] = null

    if (node.data.touched?.subscriptionId) {
        if (!node.data.subscriptionId.trim()) {
            errors = mergeErrors(
                errors,
                `subscriptionId`,
                'Subscription id is required',
            )
        } else if (hasInvalidVariables(node.data.subscriptionId, variables)) {
            errors = mergeErrors(errors, `subscriptionId`, 'Invalid variables')
        } else if (!isValidLiquidSyntax(node.data.subscriptionId)) {
            errors = mergeErrors(
                errors,
                `subscriptionId`,
                'Invalid variables syntax',
            )
        }
    }

    if (node.data.touched?.chargeId) {
        if (!node.data.chargeId.trim()) {
            errors = mergeErrors(errors, `chargeId`, 'Charge id is required')
        } else if (hasInvalidVariables(node.data.chargeId, variables)) {
            errors = mergeErrors(errors, `chargeId`, 'Invalid variables')
        } else if (!isValidLiquidSyntax(node.data.chargeId)) {
            errors = mergeErrors(errors, `chargeId`, 'Invalid variables syntax')
        }
    }

    return errors
}

export function getCancelSubscriptionNodeTouched(): NonNullable<
    CancelSubscriptionNodeType['data']['touched']
> {
    return {
        subscriptionId: true,
        reason: true,
    }
}

export function getCancelSubscriptionNodeErrors(
    node: CancelSubscriptionNodeType,
    variables: WorkflowVariableList,
): SkipChargeNodeType['data']['errors'] {
    let errors: CancelSubscriptionNodeType['data']['errors'] = null

    if (node.data.touched?.subscriptionId) {
        if (!node.data.subscriptionId.trim()) {
            errors = mergeErrors(
                errors,
                `subscriptionId`,
                'Subscription id is required',
            )
        } else if (hasInvalidVariables(node.data.subscriptionId, variables)) {
            errors = mergeErrors(errors, `subscriptionId`, 'Invalid variables')
        } else if (!isValidLiquidSyntax(node.data.subscriptionId)) {
            errors = mergeErrors(
                errors,
                `subscriptionId`,
                'Invalid variables syntax',
            )
        }
    }

    if (node.data.touched?.reason) {
        if (!node.data.reason.trim()) {
            errors = mergeErrors(errors, `reason`, 'Reason is required')
        } else if (hasInvalidVariables(node.data.reason, variables)) {
            errors = mergeErrors(errors, `reason`, 'Invalid variables')
        } else if (!isValidLiquidSyntax(node.data.reason)) {
            errors = mergeErrors(errors, `reason`, 'Invalid variables syntax')
        }
    }

    return errors
}

export function getReplaceItemNodeTouched(): NonNullable<
    ReplaceItemNodeType['data']['touched']
> {
    return {
        productVariantId: true,
        quantity: true,
        addedProductVariantId: true,
        addedQuantity: true,
    }
}

export function getReplaceItemNodeErrors(
    node: ReplaceItemNodeType,
    variables: WorkflowVariableList,
): ReplaceItemNodeType['data']['errors'] {
    let errors: ReplaceItemNodeType['data']['errors'] = null

    if (node.data.touched?.productVariantId) {
        if (!node.data.productVariantId.trim()) {
            errors = mergeErrors(
                errors,
                `productVariantId`,
                'Product variant id is required',
            )
        } else if (hasInvalidVariables(node.data.productVariantId, variables)) {
            errors = mergeErrors(
                errors,
                `productVariantId`,
                'Invalid variables',
            )
        } else if (!isValidLiquidSyntax(node.data.productVariantId)) {
            errors = mergeErrors(
                errors,
                `productVariantId`,
                'Invalid variables syntax',
            )
        }
    }

    if (node.data.touched?.quantity) {
        if (!node.data.quantity.trim()) {
            errors = mergeErrors(errors, `quantity`, 'Quantity is required')
        } else if (hasInvalidVariables(node.data.quantity, variables)) {
            errors = mergeErrors(errors, `quantity`, 'Invalid variables')
        } else if (!isValidLiquidSyntax(node.data.quantity)) {
            errors = mergeErrors(errors, `quantity`, 'Invalid variables syntax')
        }
    }

    if (node.data.touched?.addedProductVariantId) {
        if (!node.data.addedProductVariantId.trim()) {
            errors = mergeErrors(
                errors,
                `addedProductVariantId`,
                'Added product variant id is required',
            )
        } else if (
            hasInvalidVariables(node.data.addedProductVariantId, variables)
        ) {
            errors = mergeErrors(
                errors,
                `addedProductVariantId`,
                'Invalid variables',
            )
        } else if (!isValidLiquidSyntax(node.data.addedProductVariantId)) {
            errors = mergeErrors(
                errors,
                `addedProductVariantId`,
                'Invalid variables syntax',
            )
        }
    }

    if (node.data.touched?.addedQuantity) {
        if (!node.data.addedQuantity.trim()) {
            errors = mergeErrors(
                errors,
                `addedQuantity`,
                'Added quantity is required',
            )
        } else if (hasInvalidVariables(node.data.addedQuantity, variables)) {
            errors = mergeErrors(errors, `addedQuantity`, 'Invalid variables')
        } else if (!isValidLiquidSyntax(node.data.addedQuantity)) {
            errors = mergeErrors(
                errors,
                `addedQuantity`,
                'Invalid variables syntax',
            )
        }
    }

    return errors
}

export function getRemoveItemNodeTouched(): NonNullable<
    RemoveItemNodeType['data']['touched']
> {
    return {
        productVariantId: true,
        quantity: true,
    }
}

export function getRemoveItemNodeErrors(
    node: RemoveItemNodeType,
    variables: WorkflowVariableList,
): RemoveItemNodeType['data']['errors'] {
    let errors: RemoveItemNodeType['data']['errors'] = null

    if (node.data.touched?.productVariantId) {
        if (!node.data.productVariantId.trim()) {
            errors = mergeErrors(
                errors,
                `productVariantId`,
                'Product variant id is required',
            )
        } else if (hasInvalidVariables(node.data.productVariantId, variables)) {
            errors = mergeErrors(
                errors,
                `productVariantId`,
                'Invalid variables',
            )
        } else if (!isValidLiquidSyntax(node.data.productVariantId)) {
            errors = mergeErrors(
                errors,
                `productVariantId`,
                'Invalid variables syntax',
            )
        }
    }

    if (node.data.touched?.quantity) {
        if (!node.data.quantity.trim()) {
            errors = mergeErrors(errors, `quantity`, 'Quantity is required')
        } else if (hasInvalidVariables(node.data.quantity, variables)) {
            errors = mergeErrors(errors, `quantity`, 'Invalid variables')
        } else if (!isValidLiquidSyntax(node.data.quantity)) {
            errors = mergeErrors(errors, `quantity`, 'Invalid variables syntax')
        }
    }

    return errors
}

export function getUpdateShippingAddressNodeTouched(): NonNullable<
    UpdateShippingAddressNodeType['data']['touched']
> {
    return {
        name: true,
        address1: true,
        address2: true,
        city: true,
        zip: true,
        province: true,
        country: true,
        phone: true,
        lastName: true,
        firstName: true,
    }
}

export function getUpdateShippingAddressNodeErrors(
    node: UpdateShippingAddressNodeType,
    variables: WorkflowVariableList,
): UpdateShippingAddressNodeType['data']['errors'] {
    let errors: UpdateShippingAddressNodeType['data']['errors'] = null

    if (node.data.touched?.name) {
        if (!node.data.name.trim()) {
            errors = mergeErrors(errors, `name`, 'Name is required')
        } else if (hasInvalidVariables(node.data.name, variables)) {
            errors = mergeErrors(errors, `name`, 'Invalid variables')
        } else if (!isValidLiquidSyntax(node.data.name)) {
            errors = mergeErrors(errors, `name`, 'Invalid variables syntax')
        }
    }

    if (node.data.touched?.address1) {
        if (!node.data.address1.trim()) {
            errors = mergeErrors(
                errors,
                `address1`,
                'Address line 1 is required',
            )
        } else if (hasInvalidVariables(node.data.address1, variables)) {
            errors = mergeErrors(errors, `address1`, 'Invalid variables')
        } else if (!isValidLiquidSyntax(node.data.address1)) {
            errors = mergeErrors(errors, `address1`, 'Invalid variables syntax')
        }
    }

    if (node.data.touched?.address2) {
        if (!node.data.address2.trim()) {
            errors = mergeErrors(
                errors,
                `address2`,
                'Address line 2 is required',
            )
        } else if (hasInvalidVariables(node.data.address2, variables)) {
            errors = mergeErrors(errors, `address2`, 'Invalid variables')
        } else if (!isValidLiquidSyntax(node.data.address2)) {
            errors = mergeErrors(errors, `address2`, 'Invalid variables syntax')
        }
    }

    if (node.data.touched?.city) {
        if (!node.data.city.trim()) {
            errors = mergeErrors(errors, `city`, 'City is required')
        } else if (hasInvalidVariables(node.data.city, variables)) {
            errors = mergeErrors(errors, `city`, 'Invalid variables')
        } else if (!isValidLiquidSyntax(node.data.city)) {
            errors = mergeErrors(errors, `city`, 'Invalid variables syntax')
        }
    }

    if (node.data.touched?.zip) {
        if (!node.data.zip.trim()) {
            errors = mergeErrors(errors, `zip`, 'ZIP code is required')
        } else if (hasInvalidVariables(node.data.zip, variables)) {
            errors = mergeErrors(errors, `zip`, 'Invalid variables')
        } else if (!isValidLiquidSyntax(node.data.zip)) {
            errors = mergeErrors(errors, `zip`, 'Invalid variables syntax')
        }
    }

    if (node.data.touched?.province) {
        if (!node.data.province.trim()) {
            errors = mergeErrors(errors, `province`, 'State is required')
        } else if (hasInvalidVariables(node.data.province, variables)) {
            errors = mergeErrors(errors, `province`, 'Invalid variables')
        } else if (!isValidLiquidSyntax(node.data.province)) {
            errors = mergeErrors(errors, `province`, 'Invalid variables syntax')
        }
    }

    if (node.data.touched?.country) {
        if (!node.data.country.trim()) {
            errors = mergeErrors(errors, `country`, 'Country is required')
        } else if (hasInvalidVariables(node.data.country, variables)) {
            errors = mergeErrors(errors, `country`, 'Invalid variables')
        } else if (!isValidLiquidSyntax(node.data.country)) {
            errors = mergeErrors(errors, `country`, 'Invalid variables syntax')
        }
    }

    if (node.data.touched?.phone) {
        if (!node.data.phone.trim()) {
            errors = mergeErrors(errors, `phone`, 'Phone number is required')
        } else if (hasInvalidVariables(node.data.phone, variables)) {
            errors = mergeErrors(errors, `phone`, 'Invalid variables')
        } else if (!isValidLiquidSyntax(node.data.phone)) {
            errors = mergeErrors(errors, `phone`, 'Invalid variables syntax')
        }
    }

    if (node.data.touched?.lastName) {
        if (!node.data.lastName.trim()) {
            errors = mergeErrors(errors, `lastName`, 'Last name is required')
        } else if (hasInvalidVariables(node.data.lastName, variables)) {
            errors = mergeErrors(errors, `lastName`, 'Invalid variables')
        } else if (!isValidLiquidSyntax(node.data.lastName)) {
            errors = mergeErrors(errors, `lastName`, 'Invalid variables syntax')
        }
    }

    if (node.data.touched?.firstName) {
        if (!node.data.firstName.trim()) {
            errors = mergeErrors(errors, `firstName`, 'First name is required')
        } else if (hasInvalidVariables(node.data.firstName, variables)) {
            errors = mergeErrors(errors, `firstName`, 'Invalid variables')
        } else if (!isValidLiquidSyntax(node.data.firstName)) {
            errors = mergeErrors(
                errors,
                `firstName`,
                'Invalid variables syntax',
            )
        }
    }

    return errors
}

export const getReusableLLMPromptCallNodeHasInputs = (
    step: Pick<ActionTemplate, 'inputs'>,
): boolean => {
    return !!step.inputs?.length
}

export const getReusableLLMPromptCallNodeHasMissingValues = (
    hasInputs: boolean,
    step: Pick<ActionTemplate, 'inputs'>,
    values: ReusableLLMPromptCallNodeType['data']['values'],
): boolean => {
    return (
        hasInputs && (step.inputs?.length ?? 0) !== Object.keys(values).length
    )
}

export const getReusableLLMPromptCallNodeHasAllValues = (
    hasInputs: boolean,
    step: Pick<ActionTemplate, 'inputs'>,
    values: ReusableLLMPromptCallNodeType['data']['values'],
): boolean => {
    return (
        hasInputs && (step.inputs?.length ?? 0) === Object.keys(values).length
    )
}

export const getReusableLLMPromptCallNodeHasMissingCredentials = (
    graphApp: VisualBuilderGraphApp | undefined,
    actionsApp: Pick<ActionsApp, 'auth_type'> | undefined,
    isTemplate: boolean,
    trackstarConnection?: TrackstarConnection,
): boolean => {
    if (!graphApp || graphApp.type !== 'app' || !actionsApp || isTemplate) {
        return false
    }

    switch (actionsApp.auth_type) {
        case 'api-key':
            return !graphApp.api_key?.trim()
        case 'oauth2-token':
            return !graphApp.refresh_token?.trim()
        case 'trackstar':
            return !trackstarConnection
        default:
            return false
    }
}

export const getReusableLLMPromptCallNodeHasInvalidCredentials = (
    graphApp: VisualBuilderGraphApp | undefined,
    actionsApp: Pick<ActionsApp, 'auth_type'> | undefined,
    isTemplate: boolean,
    trackstarConnection?: TrackstarConnection,
): boolean => {
    if (!graphApp || graphApp.type !== 'app' || !actionsApp || isTemplate) {
        return false
    }

    switch (actionsApp.auth_type) {
        case 'trackstar':
            return !trackstarConnection ? false : trackstarConnection.error
        case 'api-key':
        case 'oauth2-token':
        default:
            return false
    }
}

export const getReusableLLMPromptCallNodeHasCredentials = (
    templateApp: Pick<ActionTemplateApp, 'type'>,
    isTemplate: boolean,
): boolean => {
    return templateApp.type === 'app' && !isTemplate
}

export const getReusableLLMPromptCallNodeIsClickable = (
    hasCredentials: boolean,
    hasInputs: boolean,
): boolean => {
    return hasCredentials || hasInputs
}

export const getReusableLLMPromptCallNodeStatuses = ({
    graphApp,
    actionsApp,
    step,
    values,
    templateApp,
    isTemplate,
    trackstarConnection,
}: {
    graphApp: VisualBuilderGraphApp | undefined
    actionsApp: Pick<ActionsApp, 'auth_type'> | undefined
    step: Pick<ActionTemplate, 'inputs'>
    values: ReusableLLMPromptCallNodeType['data']['values']
    templateApp: Pick<ActionTemplateApp, 'type'>
    isTemplate: boolean
    trackstarConnection?: TrackstarConnection
}) => {
    const hasInputs = getReusableLLMPromptCallNodeHasInputs(step)
    const hasMissingValues = getReusableLLMPromptCallNodeHasMissingValues(
        hasInputs,
        step,
        values,
    )
    const hasAllValues = getReusableLLMPromptCallNodeHasAllValues(
        hasInputs,
        step,
        values,
    )

    const hasMissingCredentials =
        getReusableLLMPromptCallNodeHasMissingCredentials(
            graphApp,
            actionsApp,
            isTemplate,
            trackstarConnection,
        )
    const hasCredentials = getReusableLLMPromptCallNodeHasCredentials(
        templateApp,
        isTemplate,
    )

    const isClickable = getReusableLLMPromptCallNodeIsClickable(
        hasCredentials,
        hasInputs,
    )

    const hasInvalidCredentials =
        getReusableLLMPromptCallNodeHasInvalidCredentials(
            graphApp,
            actionsApp,
            isTemplate,
            trackstarConnection,
        )

    return {
        hasInputs,
        hasMissingValues,
        hasAllValues,
        hasMissingCredentials,
        hasInvalidCredentials,
        hasCredentials,
        isClickable,
    }
}

export function getLiquidTemplateNodeTouched(): NonNullable<
    LiquidTemplateNodeType['data']['touched']
> {
    return {
        name: true,
        template: true,
        output: {
            data_type: true,
        },
    }
}

export function getLiquidTemplateNodeErrors(
    node: LiquidTemplateNodeType,
    variables: WorkflowVariableList,
): LiquidTemplateNodeType['data']['errors'] {
    let errors: LiquidTemplateNodeType['data']['errors'] = null

    if (node.data.touched?.name && !node.data.name.trim()) {
        errors = mergeErrors(errors, 'name', 'Name is required')
    }

    if (node.data.touched?.template) {
        if (!node.data.template.trim()) {
            errors = mergeErrors(errors, 'template', 'Template is required')
        } else if (hasInvalidVariables(node.data.template, variables, true)) {
            errors = mergeErrors(errors, 'template', 'Invalid variables')
        } else if (!isValidLiquidSyntax(node.data.template)) {
            errors = mergeErrors(errors, 'template', 'Invalid variables syntax')
        }
    }

    if (
        node.data.touched?.output?.data_type &&
        !node.data.output.data_type.trim()
    ) {
        errors = mergeErrors(
            errors,
            'output.data_type',
            'Data type is required',
        )
    }

    return errors
}
