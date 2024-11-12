import _cloneDeep from 'lodash/cloneDeep'
import _groupBy from 'lodash/groupBy'
import _isEqual from 'lodash/isEqual'
import _keyBy from 'lodash/keyBy'
import _omit from 'lodash/omit'
import _omitBy from 'lodash/omitBy'
import {Edge, Node} from 'reactflow'
import {ulid} from 'ulidx'

import {ConditionSchema, ConditionsSchema, VarSchema} from './conditions.types'
import {
    extractVariablesFromNode,
    getWorkflowVariableListForNode,
    parseWorkflowVariable,
    unescapeUrlEncodedVariables,
} from './variables.model'
import {WorkflowVariableList} from './variables.types'
import {
    VisualBuilderEdge,
    VisualBuilderGraph,
    VisualBuilderNode,
    isMultipleChoicesNodeType,
    isConditionsNodeType,
    isHttpRequestNodeType,
    LLMPromptTriggerNodeType,
    ReusableLLMPromptTriggerNodeType,
} from './visualBuilderGraph.types'
import {
    WorkflowConfiguration,
    WorkflowStepAttachmentsInput,
    WorkflowStepCancelOrder,
    WorkflowStepCancelSubscription,
    WorkflowStepChoices,
    WorkflowStepConditions,
    WorkflowStepCreateDiscountCode,
    WorkflowStepEnd,
    WorkflowStepHandover,
    WorkflowStepHelpfulPrompt,
    WorkflowStepHttpRequest,
    WorkflowStepMessage,
    WorkflowStepOrderLineItemSelection,
    WorkflowStepOrderSelection,
    WorkflowStepRefundOrder,
    WorkflowStepRefundShippingCosts,
    WorkflowStepRemoveItem,
    WorkflowStepReplaceItem,
    WorkflowStepReshipForFree,
    WorkflowStepShopperAuthentication,
    WorkflowStepSkipCharge,
    WorkflowStepTextInput,
    WorkflowStepUpdateShippingAddress,
} from './workflowConfiguration.types'

export const buildEdgeCommonProperties: () => Pick<
    Edge,
    'id' | 'type' | 'style' | 'interactionWidth' | 'data'
> & {id: string} = () => ({
    id: ulid(),
    type: 'custom',
    style: {stroke: '#D2D7DE'},
    interactionWidth: 0,
    data: {},
})

export const buildNodeCommonProperties: () => Pick<
    Node,
    'id' | 'position'
> = () => ({
    id: ulid(),
    position: {x: 0, y: 0},
})

export function areGraphsEqual(
    g1: VisualBuilderGraph,
    g2: VisualBuilderGraph
): boolean {
    const essentialGraph = (g: VisualBuilderGraph) =>
        _omit(
            {
                ...g,
                nodes: g.nodes
                    .map((node) => {
                        let data = _omitBy(
                            _omit(node.data, ['isGreyedOut']),
                            (value) => value === undefined
                        )

                        if (node.type === 'http_request') {
                            data = _omit(data, ['testRequestResult'])

                            return {
                                id: node.id,
                                type: node.type,
                                data: {
                                    ...data,
                                    headers: node.data.headers.map(
                                        (header) => ({
                                            ...header,
                                            name: header.name.toLowerCase(),
                                        })
                                    ),
                                },
                            }
                        }

                        return {id: node.id, type: node.type, data}
                    })
                    .sort((a, b) => a.id.localeCompare(b.id)),
                edges: g.edges
                    .map(({source, target, data}) => ({
                        source,
                        target,
                        data,
                    }))
                    .sort((a, b) =>
                        `${a.source}-${a.target}`.localeCompare(
                            `${b.source}-${b.target}`
                        )
                    ),
            },
            [
                'wfConfigurationOriginal',
                'nodeEditingId',
                'choiceEventIdEditing',
                'branchIdsEditing',
            ]
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
        }
    ) => void,
    direction: 'upwards' | 'downwards' = 'downwards',
    indexes?: {
        nodeById: Record<string, VisualBuilderNode>
        edgesBySource: Record<string, VisualBuilderEdge[]>
        edgesByTarget: Record<string, VisualBuilderEdge[]>
    }
) {
    const {nodes, edges} = g
    // Build indexes on first iteration
    const {nodeById, edgesBySource, edgesByTarget} = indexes ?? {
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
        (e) => nodeById[direction === 'downwards' ? e.target : e.source]
    )

    f(node, {previousNode, nextNodes, incomingEdge, outgoingEdges: nextEdges})

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
            }
        )
    }
}

export function cleanConditionsFromEmptyVariables(
    conditions: ConditionsSchema,
    availableVariables: WorkflowVariableList
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

function setLLMPromptObjectInputs(
    g: VisualBuilderGraph,
    node: VisualBuilderNode,
    trigger: Extract<
        NonNullable<WorkflowConfiguration['triggers']>[number],
        {kind: 'llm-prompt'}
    >
) {
    const variables = extractVariablesFromNode(node)
    const availableVariables = getWorkflowVariableListForNode(g, node.id)

    variables
        .map((variable) => parseWorkflowVariable(variable, availableVariables))
        .forEach((variable) => {
            switch (variable?.nodeType) {
                case 'shopper_authentication':
                    {
                        if (
                            trigger.settings.object_inputs.every(
                                (input) => input.kind !== 'customer'
                            )
                        ) {
                            const index =
                                trigger.settings.object_inputs.findIndex(
                                    (input) => input.kind === 'order'
                                )

                            if (index !== -1) {
                                trigger.settings.object_inputs.splice(
                                    index,
                                    0,
                                    {
                                        kind: 'customer',
                                        integration_id:
                                            '{{store.helpdesk_integration_id}}',
                                    }
                                )
                            } else {
                                trigger.settings.object_inputs.push({
                                    kind: 'customer',
                                    integration_id:
                                        '{{store.helpdesk_integration_id}}',
                                })
                            }
                        }
                    }
                    break
                case 'order_selection':
                    {
                        if (
                            trigger.settings.object_inputs.every(
                                (input) => input.kind !== 'customer'
                            )
                        ) {
                            const index =
                                trigger.settings.object_inputs.findIndex(
                                    (input) => input.kind === 'order'
                                )

                            if (index !== -1) {
                                trigger.settings.object_inputs.splice(
                                    index,
                                    0,
                                    {
                                        kind: 'customer',
                                        integration_id:
                                            '{{store.helpdesk_integration_id}}',
                                    }
                                )
                            } else {
                                trigger.settings.object_inputs.push({
                                    kind: 'customer',
                                    integration_id:
                                        '{{store.helpdesk_integration_id}}',
                                })
                            }
                        }

                        if (
                            trigger.settings.object_inputs.every(
                                (input) => input.kind !== 'order'
                            )
                        ) {
                            trigger.settings.object_inputs.push({
                                kind: 'order',
                                integration_id:
                                    '{{store.helpdesk_integration_id}}',
                            })
                        }
                    }
                    break
            }
        })
}

function setReusableLLMPromptObjectInputs(
    g: VisualBuilderGraph,
    node: VisualBuilderNode,
    trigger: Extract<
        NonNullable<WorkflowConfiguration['triggers']>[number],
        {kind: 'reusable-llm-prompt'}
    >
) {
    const variables = extractVariablesFromNode(node)
    const availableVariables = getWorkflowVariableListForNode(g, node.id)

    variables
        .map((variable) => parseWorkflowVariable(variable, availableVariables))
        .forEach((variable) => {
            switch (variable?.nodeType) {
                case 'shopper_authentication':
                    {
                        if (
                            trigger.settings.object_inputs.every(
                                (input) => input.kind !== 'customer'
                            )
                        ) {
                            const index =
                                trigger.settings.object_inputs.findIndex(
                                    (input) => input.kind === 'order'
                                )

                            if (index !== -1) {
                                trigger.settings.object_inputs.splice(
                                    index,
                                    0,
                                    {kind: 'customer'}
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
                            trigger.settings.object_inputs.every(
                                (input) => input.kind !== 'customer'
                            )
                        ) {
                            const index =
                                trigger.settings.object_inputs.findIndex(
                                    (input) => input.kind === 'order'
                                )

                            if (index !== -1) {
                                trigger.settings.object_inputs.splice(
                                    index,
                                    0,
                                    {kind: 'customer'}
                                )
                            } else {
                                trigger.settings.object_inputs.push({
                                    kind: 'customer',
                                })
                            }
                        }

                        if (
                            trigger.settings.object_inputs.every(
                                (input) => input.kind !== 'order'
                            )
                        ) {
                            trigger.settings.object_inputs.push({kind: 'order'})
                        }
                    }
                    break
            }
        })
}

function setStaticInputs(
    c: WorkflowConfiguration,
    inputs: Exclude<VisualBuilderGraph['inputs'], undefined | null>,
    values: Exclude<VisualBuilderGraph['values'], undefined | null>
) {
    c.values = c.values || {}
    inputs.forEach(({id}) => {
        c.values![id] = values[id]
    })

    c.inputs = (c.inputs || [])
        .filter(({id}) => !inputs.some((input) => input.id === id))
        .concat(inputs)
}

export function transformVisualBuilderGraphIntoWfConfiguration(
    g: VisualBuilderGraph,
    isDraft = true
) {
    const c: WorkflowConfiguration = _cloneDeep<WorkflowConfiguration>(
        g.wfConfigurationOriginal
    )
    c.name = g.name
    c.available_languages = g.available_languages
    c.steps = []
    c.transitions = []
    c.is_draft = isDraft
    c.apps = g.apps
    c.inputs = g.inputs
    c.values = g.values
    const stepIdByNodeId: Record<string, string> = {}
    walkVisualBuilderGraph(
        g,
        g.nodes[0].id,
        (node, {previousNode, incomingEdge}) => {
            if (node.type === 'channel_trigger') {
                c.entrypoint = {
                    label: node.data.label,
                    label_tkey: node.data.label_tkey,
                }
                return
            } else if (node.type === 'llm_prompt_trigger') {
                c.triggers = [
                    {
                        kind: 'llm-prompt',
                        settings: {
                            custom_inputs: node.data.inputs.filter(
                                (
                                    input
                                ): input is Extract<
                                    NonNullable<
                                        WorkflowConfiguration['triggers']
                                    >[number],
                                    {kind: 'llm-prompt'}
                                >['settings']['custom_inputs'][number] =>
                                    'data_type' in input
                            ),
                            object_inputs: node.data.inputs
                                .filter(
                                    (
                                        input
                                    ): input is Extract<
                                        LLMPromptTriggerNodeType['data']['inputs'][number],
                                        {kind: 'product'}
                                    > =>
                                        'kind' in input &&
                                        input.kind === 'product'
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
                    },
                ]
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
                                    input
                                ): input is Extract<
                                    NonNullable<
                                        WorkflowConfiguration['triggers']
                                    >[number],
                                    {kind: 'reusable-llm-prompt'}
                                >['settings']['custom_inputs'][number] =>
                                    'data_type' in input
                            ),
                            object_inputs: node.data.inputs.filter(
                                (
                                    input
                                ): input is Extract<
                                    ReusableLLMPromptTriggerNodeType['data']['inputs'][number],
                                    {kind: 'product'}
                                > => 'kind' in input && input.kind === 'product'
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
                            (entry) => [entry.key, entry.value]
                        )

                        body = unescapeUrlEncodedVariables(
                            new URLSearchParams(entries).toString()
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
                        `steps_state.${step.id}.content.${variable.id}`
                )

                if (trigger?.kind === 'llm-prompt' && node.data.outputs) {
                    trigger.settings.outputs.push(
                        ...node.data.outputs.filter(
                            (output) => output.path in variablesByOutputPath
                        )
                    )

                    setLLMPromptObjectInputs(g, node, trigger)
                }

                if (
                    trigger?.kind === 'reusable-llm-prompt' &&
                    node.data.outputs
                ) {
                    trigger.settings.outputs.push(
                        ...node.data.outputs
                            .filter(
                                (output) => output.path in variablesByOutputPath
                            )
                            .map((output) => ({
                                ...output,
                                name: variablesByOutputPath[output.path].name,
                                data_type:
                                    variablesByOutputPath[output.path]
                                        .data_type,
                            }))
                    )

                    setReusableLLMPromptObjectInputs(g, node, trigger)
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

                    setLLMPromptObjectInputs(g, node, trigger)
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

                    setLLMPromptObjectInputs(g, node, trigger)
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

                    setLLMPromptObjectInputs(g, node, trigger)
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

                    setLLMPromptObjectInputs(g, node, trigger)
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

                    setLLMPromptObjectInputs(g, node, trigger)
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
                                {label: 'Percentange (%)', value: 'percent'},
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
                    }
                )

                const step: WorkflowStepCreateDiscountCode = {
                    id: node.id,
                    kind: 'create-discount-code',
                    settings: {
                        customer_id: node.data.customerId,
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

                    setLLMPromptObjectInputs(g, node, trigger)
                }

                if (trigger?.kind === 'reusable-llm-prompt') {
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

                    setLLMPromptObjectInputs(g, node, trigger)
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

                    setLLMPromptObjectInputs(g, node, trigger)
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

                    setLLMPromptObjectInputs(g, node, trigger)
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

                    setLLMPromptObjectInputs(g, node, trigger)
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
                              getWorkflowVariableListForNode(g, node.id)
                          )
                        : undefined,
                })
            } else {
                c.initial_step_id = stepIdByNodeId[node.id]
            }
        }
    )
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
) {
    const incomingEdge = visualBuilderGraph.edges.find(
        ({target}) => target === currentNodeId
    )

    if (!incomingEdge) {
        return
    }

    const previousNodeId = incomingEdge.source
    const previousNode = previousNodeId
        ? visualBuilderGraph.nodes.find(({id}) => id === previousNodeId)
        : undefined

    switch (type) {
        case 'choice': {
            const choiceEventId = incomingEdge.data?.event?.id
            const choiceIndex =
                previousNode?.type === 'multiple_choices' &&
                choiceEventId != null
                    ? previousNode.data.choices.findIndex(
                          ({event_id}) => event_id === choiceEventId
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
        case 'skip_charge': {
            const branchName = incomingEdge.data?.name

            if (previousNode && previousNode.type === type) {
                return {
                    label: branchName,
                    nodeId: previousNode.id,
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
    nodeId: string
) {
    const {nodes} = graph
    const childrenIds: Set<string> = new Set()
    walkVisualBuilderGraph(
        graph,
        nodeId,
        (node) => {
            childrenIds.add(node.id)
        },
        'upwards'
    )
    walkVisualBuilderGraph(
        graph,
        nodeId,
        (node) => {
            childrenIds.add(node.id)
        },
        'downwards'
    )

    return !Boolean(
        nodes.find((node) => childrenIds.has(node.id) && node.type === type)
    )
}

export function hasParentNodeInPath(
    type: VisualBuilderNode['type'],
    graph: VisualBuilderGraph,
    nodeId: string
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
        'upwards'
    )

    return hasParentNode
}
