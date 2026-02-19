import _isNil from 'lodash/isNil'
import _omit from 'lodash/omit'
import { ulid } from 'ulidx'

import { getFallibleNodeSuccessConditions } from '../hooks/useVisualBuilderGraphReducer/utils'
import {
    buildEdgeCommonProperties,
    buildNodeCommonProperties,
} from './visualBuilderGraph.model'
import type {
    AutomatedMessageNodeType,
    CancelOrderNodeType,
    CancelSubscriptionNodeType,
    ChannelTriggerNodeType,
    ConditionsNodeType,
    CreateDiscountCodeNodeType,
    EditOrderNoteNodeType,
    EndNodeType,
    FileUploadNodeType,
    HttpRequestNodeType,
    LiquidTemplateNodeType,
    LLMPromptTriggerNodeType,
    MultipleChoicesNodeType,
    OrderLineItemSelectionNodeType,
    OrderSelectionNodeType,
    RefundOrderNodeType,
    RefundShippingCostsNodeType,
    RemoveItemNodeType,
    ReplaceItemNodeType,
    ReshipForFreeNodeType,
    ReusableLLMPromptCallNodeType,
    ReusableLLMPromptTriggerNodeType,
    ShopperAuthenticationNodeType,
    SkipChargeNodeType,
    TextReplyNodeType,
    UpdateShippingAddressNodeType,
    VisualBuilderEdge,
    VisualBuilderGraph,
    VisualBuilderNode,
    VisualBuilderTriggerNode,
} from './visualBuilderGraph.types'
import type {
    MessageContent,
    WorkflowConfiguration,
    WorkflowStep,
    WorkflowStepAttachmentsInput,
    WorkflowStepChoices,
    WorkflowStepEnd,
    WorkflowStepHandover,
    WorkflowStepHelpfulPrompt,
    WorkflowStepHttpRequest,
    WorkflowStepMessage,
    WorkflowStepOrderSelection,
    WorkflowStepReusableLLMPromptCall,
    WorkflowStepShopperAuthentication,
    WorkflowStepTextInput,
    WorkflowTransition,
} from './workflowConfiguration.types'

export function walkWorkflowConfigurationGraph(
    c: WorkflowConfiguration,
    currentStepId: string,
    f: (
        step: WorkflowStep,
        context: {
            previousStep: WorkflowStep | undefined
            nextSteps: WorkflowStep[]
            incomingTransition: WorkflowTransition | undefined
            outgoingTransitions: WorkflowTransition[]
        },
    ) => void,
) {
    const step = c.steps.find((s) => s.id === currentStepId)
    if (!step) return
    const incomingTransition = c.transitions.find(
        (t) => t.to_step_id === currentStepId,
    )
    const previousStep = incomingTransition
        ? c.steps.find((s) => s.id === incomingTransition.from_step_id)
        : undefined
    const outgoingTransitions = c.transitions.filter(
        (t) => t.from_step_id === currentStepId,
    )
    const nextSteps = outgoingTransitions.reduce(
        (acc, t) => [...acc, ...c.steps.filter((s) => s.id === t.to_step_id)],
        [] as WorkflowStep[],
    )
    f(step, {
        previousStep,
        incomingTransition,
        outgoingTransitions,
        nextSteps,
    })
    if (outgoingTransitions.length === 0) return
    for (const outgoingTransition of outgoingTransitions) {
        walkWorkflowConfigurationGraph(c, outgoingTransition.to_step_id, f)
    }
}

function injectTkeysInContentIfNotExist(content: MessageContent) {
    const { html_tkey, text_tkey, ...rest } = content
    return {
        html_tkey: html_tkey || ulid(),
        text_tkey: text_tkey || ulid(),
        ...rest,
    }
}

function injectTkeysInChoicesIfNotExist(
    choices: MultipleChoicesNodeType['data']['choices'],
) {
    return choices.map((c) => {
        const { label_tkey, ...rest } = c
        return {
            label_tkey: label_tkey || ulid(),
            ...rest,
        }
    })
}

export function getTriggerNode(
    c: WorkflowConfiguration,
):
    | ChannelTriggerNodeType
    | LLMPromptTriggerNodeType
    | ReusableLLMPromptTriggerNodeType {
    const trigger = c.triggers?.[0]
    const entrypoint = c.entrypoints?.[0]

    if (
        trigger?.kind === 'llm-prompt' &&
        entrypoint?.kind === 'llm-conversation'
    ) {
        let conditionsType: LLMPromptTriggerNodeType['data']['conditionsType'] =
            null
        let conditions: LLMPromptTriggerNodeType['data']['conditions'] = []

        if (trigger.settings.conditions) {
            if (trigger.settings.conditions['or']) {
                conditionsType = 'or'
                conditions = trigger.settings.conditions['or']
            } else if (trigger.settings.conditions['and']) {
                conditionsType = 'and'
                conditions = trigger.settings.conditions['and']
            }
        }

        return {
            ...buildNodeCommonProperties(),
            id: 'trigger_button',
            type: 'llm_prompt_trigger',
            data: {
                instructions: entrypoint.settings.instructions,
                requires_confirmation:
                    entrypoint.settings.requires_confirmation,
                deactivated_datetime: entrypoint.deactivated_datetime,
                inputs: [
                    ...trigger.settings.custom_inputs,
                    ...trigger.settings.object_inputs
                        .filter(
                            (
                                input,
                            ): input is Extract<
                                Extract<
                                    NonNullable<
                                        WorkflowConfiguration['triggers']
                                    >[number],
                                    { kind: 'llm-prompt' }
                                >['settings']['object_inputs'][number],
                                { kind: 'product' }
                            > => input.kind === 'product',
                        )
                        .map((input) => _omit(input, ['integration_id'])),
                ],
                conditionsType,
                conditions,
            },
        }
    }

    if (
        trigger?.kind === 'reusable-llm-prompt' &&
        entrypoint?.kind === 'reusable-llm-prompt-call-step'
    ) {
        let conditionsType: ReusableLLMPromptTriggerNodeType['data']['conditionsType'] =
            null
        let conditions: LLMPromptTriggerNodeType['data']['conditions'] = []

        if (entrypoint.settings.conditions) {
            if (entrypoint.settings.conditions['or']) {
                conditionsType = 'or'
                conditions = entrypoint.settings.conditions['or']
            } else if (entrypoint.settings.conditions['and']) {
                conditionsType = 'and'
                conditions = entrypoint.settings.conditions['and']
            }
        }

        return {
            ...buildNodeCommonProperties(),
            id: 'trigger_button',
            type: 'reusable_llm_prompt_trigger',
            data: {
                requires_confirmation:
                    entrypoint.settings.requires_confirmation,
                inputs: [
                    ...trigger.settings.custom_inputs,
                    ...trigger.settings.object_inputs.filter(
                        (
                            input,
                        ): input is Extract<
                            Extract<
                                NonNullable<
                                    WorkflowConfiguration['triggers']
                                >[number],
                                { kind: 'reusable-llm-prompt' }
                            >['settings']['object_inputs'][number],
                            { kind: 'product' }
                        > => input.kind === 'product',
                    ),
                ],
                conditionsType,
                conditions,
            },
        }
    }

    return {
        ...buildNodeCommonProperties(),
        id: 'trigger_button',
        type: 'channel_trigger',
        data: {
            label: c.entrypoint?.label ?? '',
            label_tkey: c.entrypoint?.label_tkey ?? ulid(),
        },
    }
}

export function transformWorkflowConfigurationIntoVisualBuilderGraph<
    T extends VisualBuilderTriggerNode = VisualBuilderTriggerNode,
>(c: WorkflowConfiguration, isTemplate = false): VisualBuilderGraph<T> {
    const triggerNode = getTriggerNode(c) as T
    const nodes: [T, ...VisualBuilderNode[]] = [triggerNode]
    const edges: VisualBuilderEdge[] = []
    const nodeIdByStepId: Record<string, string> = {}

    if (!c.initial_step_id) {
        return {
            id: c.id,
            internal_id: c.internal_id,
            is_draft: c.is_draft,
            advanced_datetime: c.advanced_datetime
                ? new Date(c.advanced_datetime)
                : null,
            name: c.name,
            available_languages: c.available_languages,
            template_internal_id: c.template_internal_id,
            category: c.category,
            nodes,
            edges,
            apps: c.apps,
            inputs: c.inputs,
            values: c.values,
            nodeEditingId: null,
            choiceEventIdEditing: null,
            branchIdsEditing: [],
            isTemplate,
        }
    }

    walkWorkflowConfigurationGraph(c, c.initial_step_id, (step, context) => {
        const { previousStep, incomingTransition } = context

        if (step.kind === 'message') {
            const n: AutomatedMessageNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'automated_message',
                data: {
                    content: injectTkeysInContentIfNotExist(
                        step.settings.message.content,
                    ),
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'choices') {
            const n: MultipleChoicesNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'multiple_choices',
                data: {
                    content: injectTkeysInContentIfNotExist(
                        step.settings.message.content,
                    ),
                    choices: injectTkeysInChoicesIfNotExist(
                        step.settings.choices,
                    ),
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'text-input') {
            const n: TextReplyNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'text_reply',
                data: {
                    content: injectTkeysInContentIfNotExist(
                        step.settings.message.content,
                    ),
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'attachments-input') {
            const n: FileUploadNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'file_upload',
                data: {
                    content: injectTkeysInContentIfNotExist(
                        step.settings.message.content,
                    ),
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'order-selection') {
            const n: OrderSelectionNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'order_selection',
                data: {
                    content: injectTkeysInContentIfNotExist(
                        step.settings.message.content,
                    ),
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'conditions') {
            const n: ConditionsNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'conditions',
                data: {
                    name: step.settings.name,
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'helpful-prompt') {
            const n: EndNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'end',
                data: {
                    action: 'ask-for-feedback',
                    ticketTags: step.settings?.ticket_tags,
                    ticketAssigneeUserId:
                        step.settings?.ticket_assignee_user_id,
                    ticketAssigneeTeamId:
                        step.settings?.ticket_assignee_team_id,
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'handover') {
            const n: EndNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'end',
                data: {
                    action: 'create-ticket',
                    ticketTags: step.settings.ticket_tags,
                    ticketAssigneeUserId: step.settings.ticket_assignee_user_id,
                    ticketAssigneeTeamId: step.settings.ticket_assignee_team_id,
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'end' && step?.settings?.success) {
            const n: EndNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'end',
                data: {
                    action: 'end-success',
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'end' && step?.settings?.success === false) {
            const n: EndNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'end',
                data: {
                    action: 'end-failure',
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'end') {
            const n: EndNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'end',
                data: {
                    action: 'end',
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'http-request') {
            const bodyContentType = step.settings.headers?.[
                'content-type'
            ] as HttpRequestNodeType['data']['bodyContentType']

            const trigger = c.triggers?.[0]
            const variablesOutputPaths = new Set(
                step.settings.variables.map(
                    (variable) =>
                        `steps_state.${step.id}.content.${variable.id}`,
                ),
            )

            const n: HttpRequestNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'http_request',
                data: {
                    name: step.settings.name,
                    url: step.settings.url,
                    method: step.settings.method,
                    oauth2TokenSettings: step.settings.oauth2_token_settings,
                    trackstar_integration_name:
                        step.settings.trackstar_integration_name,
                    serviceConnectionSettings:
                        step.settings.service_connection_settings,
                    headers: Object.entries(
                        _omit(step.settings.headers ?? {}, 'content-type'),
                    ).map(([name, value]) => ({ name, value })),
                    json:
                        bodyContentType === 'application/json'
                            ? (step.settings.body ?? null)
                            : null,
                    formUrlencoded:
                        bodyContentType === 'application/x-www-form-urlencoded'
                            ? Array.from(
                                  new URLSearchParams(
                                      step.settings.body ?? undefined,
                                  ).entries(),
                              ).map(([key, value]) => ({ key, value }))
                            : null,
                    bodyContentType: bodyContentType ?? null,
                    variables: step.settings.variables.map((variable) => ({
                        ...variable,
                        data_type: variable.data_type ?? 'json',
                    })),
                    ...(trigger?.kind === 'llm-prompt'
                        ? {
                              outputs: trigger.settings.outputs.filter(
                                  (output) =>
                                      variablesOutputPaths.has(output.path),
                              ),
                          }
                        : {}),
                    ...(trigger?.kind === 'reusable-llm-prompt'
                        ? {
                              outputs: trigger.settings.outputs
                                  .filter((output) =>
                                      variablesOutputPaths.has(output.path),
                                  )
                                  .map((output) => ({
                                      id: output.id,
                                      path: output.path,
                                      description: output.description,
                                  })),
                          }
                        : {}),
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'liquid-template') {
            const n: LiquidTemplateNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'liquid_template',
                data: {
                    name: step.settings.name,
                    template: step.settings.template,
                    output: {
                        data_type: step.settings.output.data_type,
                    },
                },
            }
            nodeIdByStepId[step.id] = n.id
            nodes.push(n)
        } else if (step.kind === 'shopper-authentication') {
            const node: ShopperAuthenticationNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'shopper_authentication',
                data: {
                    integrationId: step.settings.integration_id,
                },
            }

            nodeIdByStepId[step.id] = node.id
            nodes.push(node)
        } else if (step.kind === 'order-line-item-selection') {
            const node: OrderLineItemSelectionNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'order_line_item_selection',
                data: {
                    content: step.settings.message.content,
                },
            }

            nodeIdByStepId[step.id] = node.id
            nodes.push(node)
        } else if (step.kind === 'cancel-order') {
            const node: CancelOrderNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'cancel_order',
                data: {
                    customerId: step.settings.customer_id,
                    orderExternalId: step.settings.order_external_id,
                    integrationId: step.settings.integration_id,
                    restock: step.settings.restock,
                },
            }

            nodeIdByStepId[step.id] = node.id
            nodes.push(node)
        } else if (step.kind === 'refund-order') {
            const node: RefundOrderNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'refund_order',
                data: {
                    customerId: step.settings.customer_id,
                    orderExternalId: step.settings.order_external_id,
                    integrationId: step.settings.integration_id,
                },
            }

            nodeIdByStepId[step.id] = node.id
            nodes.push(node)
        } else if (step.kind === 'update-shipping-address') {
            const node: UpdateShippingAddressNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'update_shipping_address',
                data: {
                    customerId: step.settings.customer_id,
                    orderExternalId: step.settings.order_external_id,
                    integrationId: step.settings.integration_id,
                    name: step.settings.name,
                    address1: step.settings.address1,
                    address2: step.settings.address2,
                    city: step.settings.city,
                    zip: step.settings.zip,
                    province: step.settings.province,
                    country: step.settings.country,
                    phone: step.settings.phone,
                    lastName: step.settings.last_name,
                    firstName: step.settings.first_name,
                },
            }

            nodeIdByStepId[step.id] = node.id
            nodes.push(node)
        } else if (step.kind === 'remove-item') {
            const node: RemoveItemNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'remove_item',
                data: {
                    customerId: step.settings.customer_id,
                    orderExternalId: step.settings.order_external_id,
                    integrationId: step.settings.integration_id,
                    productVariantId: step.settings.product_variant_id,
                    quantity: step.settings.quantity,
                },
            }

            nodeIdByStepId[step.id] = node.id
            nodes.push(node)
        } else if (step.kind === 'replace-item') {
            const node: ReplaceItemNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'replace_item',
                data: {
                    customerId: step.settings.customer_id,
                    orderExternalId: step.settings.order_external_id,
                    integrationId: step.settings.integration_id,
                    productVariantId: step.settings.product_variant_id,
                    quantity: step.settings.quantity,
                    addedProductVariantId:
                        step.settings.added_product_variant_id,
                    addedQuantity: step.settings.added_quantity,
                },
            }

            nodeIdByStepId[step.id] = node.id
            nodes.push(node)
        } else if (step.kind === 'create-discount-code') {
            const node: CreateDiscountCodeNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'create_discount_code',
                data: {
                    integrationId: step.settings.integration_id,
                    discountType: step.settings.type,
                    amount: step.settings.amount,
                    validFor: step.settings.valid_for,
                },
            }

            nodeIdByStepId[step.id] = node.id
            nodes.push(node)
        } else if (step.kind === 'edit-order-note') {
            const node: EditOrderNoteNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'edit_order_note',
                data: {
                    customerId: step.settings.customer_id,
                    orderExternalId: step.settings.order_external_id,
                    integrationId: step.settings.integration_id,
                    note: step.settings.note,
                },
            }

            nodeIdByStepId[step.id] = node.id
            nodes.push(node)
        } else if (step.kind === 'reship-for-free') {
            const node: ReshipForFreeNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'reship_for_free',
                data: {
                    customerId: step.settings.customer_id,
                    integrationId: step.settings.integration_id,
                    orderExternalId: step.settings.order_external_id,
                },
            }

            nodeIdByStepId[step.id] = node.id
            nodes.push(node)
        } else if (step.kind === 'refund-shipping-costs') {
            const node: RefundShippingCostsNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'refund_shipping_costs',
                data: {
                    customerId: step.settings.customer_id,
                    integrationId: step.settings.integration_id,
                    orderExternalId: step.settings.order_external_id,
                },
            }

            nodeIdByStepId[step.id] = node.id
            nodes.push(node)
        } else if (step.kind === 'cancel-subscription') {
            const node: CancelSubscriptionNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'cancel_subscription',
                data: {
                    customerId: step.settings.customer_id,
                    integrationId: step.settings.integration_id,
                    subscriptionId: step.settings.subscription_id,
                    reason: step.settings.reason,
                },
            }

            nodeIdByStepId[step.id] = node.id
            nodes.push(node)
        } else if (step.kind === 'skip-charge') {
            const node: SkipChargeNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'skip_charge',
                data: {
                    customerId: step.settings.customer_id,
                    integrationId: step.settings.integration_id,
                    subscriptionId: step.settings.subscription_id,
                    chargeId: step.settings.charge_id,
                },
            }

            nodeIdByStepId[step.id] = node.id
            nodes.push(node)
        } else if (step.kind === 'reusable-llm-prompt-call') {
            const node: ReusableLLMPromptCallNodeType = {
                ...buildNodeCommonProperties(),
                id: step.id,
                type: 'reusable_llm_prompt_call',
                data: {
                    objects: step.settings.objects,
                    configuration_internal_id:
                        step.settings.configuration_internal_id,
                    custom_inputs: step.settings.custom_inputs,
                    values: step.settings.values,
                    configuration_id: step.settings.configuration_id,
                },
            }

            nodeIdByStepId[step.id] = node.id
            nodes.push(node)
        } else {
            return
        }
        // linking from previous node to the one just added
        const n = nodes[nodes.length - 1]
        if (previousStep) {
            edges.push({
                ...buildEdgeCommonProperties(),
                id: `${nodeIdByStepId[previousStep.id]}-${n.id}`,
                source: nodeIdByStepId[previousStep.id],
                target: n.id,
                data: {
                    ...(!_isNil(incomingTransition?.event)
                        ? { event: incomingTransition.event }
                        : undefined),
                    ...(!_isNil(incomingTransition?.name)
                        ? { name: incomingTransition.name }
                        : undefined),
                    ...(!_isNil(incomingTransition?.conditions)
                        ? { conditions: incomingTransition.conditions }
                        : undefined),
                },
            })
        } else {
            edges.push({
                ...buildEdgeCommonProperties(),
                id: `${triggerNode.id}-${n.id}`,
                source: triggerNode.id,
                target: n.id,
            })
        }
    })

    return {
        id: c.id,
        internal_id: c.internal_id,
        is_draft: c.is_draft,
        advanced_datetime: c.advanced_datetime
            ? new Date(c.advanced_datetime)
            : null,
        name: c.name,
        available_languages: c.available_languages,
        template_internal_id: c.template_internal_id,
        category: c.category,
        nodes,
        edges,
        apps: c.apps,
        inputs: c.inputs,
        values: c.values,
        nodeEditingId: null,
        choiceEventIdEditing: null,
        branchIdsEditing: [],
        isTemplate,
    }
}

type ChoiceEventId = string

export class WorkflowConfigurationBuilder {
    private readonly data: WorkflowConfiguration
    private _selection: WorkflowStep
    constructor({
        name,
        initialStep,
        ...configuration
    }: {
        initialStep: WorkflowStep
    } & Pick<
        WorkflowConfiguration,
        'name' | 'entrypoint' | 'id' | 'triggers' | 'entrypoints' | 'apps'
    > &
        Partial<
            Pick<
                WorkflowConfiguration,
                | 'is_draft'
                | 'available_languages'
                | 'advanced_datetime'
                | 'category'
            >
        >) {
        this.data = {
            internal_id: ulid(),
            name,
            initial_step_id: initialStep.id,
            is_draft: false,
            steps: [initialStep],
            transitions: [],
            available_languages: ['en-US'],
            ...configuration,
        }
        this._selection = initialStep
    }

    insertChoicesStepAndSelect(
        message: WorkflowStepChoices['settings']['message'],
    ) {
        const step: WorkflowStepChoices = {
            id: ulid(),
            kind: 'choices',
            settings: {
                choices: [],
                message,
            },
        }
        this.data.steps.push(step)
        this.data.transitions.push({
            id: ulid(),
            from_step_id: this._selection.id,
            to_step_id: step.id,
        })
        this._selection = step
    }

    insertReusableLLMPromptCallAndSelect(
        settings: WorkflowStepReusableLLMPromptCall['settings'],
    ) {
        const step: WorkflowStepReusableLLMPromptCall = {
            id: ulid(),
            kind: 'reusable-llm-prompt-call',
            settings,
        }
        this.data.steps.push(step)
        this.data.transitions.push({
            id: ulid(),
            from_step_id: this._selection.id,
            to_step_id: step.id,
        })
        this._selection = step
    }

    private insertChoiceAndStepTargetAndSelect(
        choiceLabel: string,
        step: WorkflowStep,
    ): ChoiceEventId {
        if (this._selection?.kind !== 'choices')
            throw new Error(
                `${step.kind} step can only be inserted after choices step`,
            )
        const choiceEventId = ulid()
        this._selection.settings.choices.push({
            event_id: choiceEventId,
            label: choiceLabel,
            label_tkey: ulid(),
        })
        this.data.steps.push(step)
        const transition: WorkflowTransition = {
            id: ulid(),
            from_step_id: this._selection.id,
            to_step_id: step.id,
            event: { id: choiceEventId, kind: 'choices' },
        }
        this.data.transitions.push(transition)
        this._selection = step
        return choiceEventId
    }

    insertChoiceAndChoicesStepAndSelect(
        choiceLabel: string,
        message: WorkflowStepChoices['settings']['message'],
    ): ChoiceEventId {
        const step: WorkflowStepChoices = {
            id: ulid(),
            kind: 'choices',
            settings: {
                choices: [],
                message,
            },
        }
        return this.insertChoiceAndStepTargetAndSelect(choiceLabel, step)
    }

    insertChoiceAndMessageStepAndSelect(
        choiceLabel: string,
        message: WorkflowStepMessage['settings']['message'],
    ): ChoiceEventId {
        const step: WorkflowStepMessage = {
            id: ulid(),
            kind: 'message',
            settings: {
                message,
            },
        }
        return this.insertChoiceAndStepTargetAndSelect(choiceLabel, step)
    }

    insertChoiceAndTextInputStepAndSelect(
        choiceLabel: string,
        settings: WorkflowStepTextInput['settings'],
    ): ChoiceEventId {
        const step: WorkflowStepTextInput = {
            id: ulid(),
            kind: 'text-input',
            settings,
        }
        return this.insertChoiceAndStepTargetAndSelect(choiceLabel, step)
    }

    private insertConditionsAndStepTargetAndSelect(
        step: WorkflowStep,
        conditionName: string,
        conditions?: WorkflowTransition['conditions'],
    ) {
        if (
            this._selection?.kind !== 'conditions' &&
            this._selection?.kind !== 'http-request' &&
            this._selection?.kind !== 'reusable-llm-prompt-call'
        )
            throw new Error(
                `${step.kind} step can only be inserted after conditions, http-request or reusable-llm-prompt-call step`,
            )
        this.data.steps.push(step)
        const transition: WorkflowTransition = {
            id: ulid(),
            name: conditionName,
            conditions,
            from_step_id: this._selection.id,
            to_step_id: step.id,
        }
        this.data.transitions.push(transition)
        this._selection = step
    }

    insertHttpRequestConditionAndHandOverStepAndSelect(
        type: 'error' | 'success',
        settings: WorkflowStepHandover['settings'] = {},
    ) {
        const step: WorkflowStepHandover = {
            id: ulid(),
            kind: 'handover',
            settings,
        }
        const label = type === 'error' ? 'Error' : 'Success'
        this.insertConditionsAndStepTargetAndSelect(
            step,
            label,
            type === 'success'
                ? getFallibleNodeSuccessConditions(this._selection.id)
                : undefined,
        )
    }

    insertHttpRequestConditionAndHttpRequestStepAndSelect(
        type: 'error' | 'success',
        settings: WorkflowStepHttpRequest['settings'],
    ) {
        const step: WorkflowStepHttpRequest = {
            id: ulid(),
            kind: 'http-request',
            settings,
        }
        const label = type === 'error' ? 'Error' : 'Success'
        this.insertConditionsAndStepTargetAndSelect(
            step,
            label,
            type === 'success'
                ? getFallibleNodeSuccessConditions(this._selection.id)
                : undefined,
        )
    }

    insertHttpRequestConditionAndMultipleChoiceStepAndSelect(
        type: 'error' | 'success',
        message: WorkflowStepChoices['settings']['message'],
    ) {
        const step: WorkflowStepChoices = {
            id: ulid(),
            kind: 'choices',
            settings: {
                choices: [],
                message,
            },
        }
        const label = type === 'error' ? 'Error' : 'Success'
        this.insertConditionsAndStepTargetAndSelect(
            step,
            label,
            type === 'success'
                ? getFallibleNodeSuccessConditions(this._selection.id)
                : undefined,
        )
    }

    insertHttpRequestConditionAndMessageStepAndSelect(
        type: 'error' | 'success',
        message: WorkflowStepMessage['settings']['message'],
    ) {
        const step: WorkflowStepMessage = {
            id: ulid(),
            kind: 'message',
            settings: {
                message,
            },
        }
        const label = type === 'error' ? 'Error' : 'Success'
        this.insertConditionsAndStepTargetAndSelect(
            step,
            label,
            type === 'success'
                ? getFallibleNodeSuccessConditions(this._selection.id)
                : undefined,
        )
    }

    insertHttpRequestConditionAndEndStepAndSelect(
        type: 'error' | 'success',
        settings?: WorkflowStepEnd['settings'],
    ) {
        const step: WorkflowStepEnd = {
            id: ulid(),
            kind: 'end',
            settings,
        }
        const label = type === 'error' ? 'Error' : 'Success'
        this.insertConditionsAndStepTargetAndSelect(
            step,
            label,
            type === 'success'
                ? getFallibleNodeSuccessConditions(this._selection.id)
                : undefined,
        )
    }

    insertReusableLLMPromptCallConditionAndEndStepAndSelect(
        type: 'error' | 'success',
        settings?: WorkflowStepEnd['settings'],
    ) {
        const step: WorkflowStepEnd = {
            id: ulid(),
            kind: 'end',
            settings,
        }
        const label = type === 'error' ? 'Error' : 'Success'
        this.insertConditionsAndStepTargetAndSelect(
            step,
            label,
            type === 'success'
                ? getFallibleNodeSuccessConditions(this._selection.id)
                : undefined,
        )
    }

    insertChoiceAndAttachmentsInputStepAndSelect(
        choiceLabel: string,
        settings: WorkflowStepAttachmentsInput['settings'],
    ): ChoiceEventId {
        const step: WorkflowStepAttachmentsInput = {
            id: ulid(),
            kind: 'attachments-input',
            settings,
        }
        return this.insertChoiceAndStepTargetAndSelect(choiceLabel, step)
    }

    insertChoiceAndHandoverStepAndSelect(
        choiceLabel: string,
        handoverSettings: WorkflowStepHandover['settings'] = {},
    ): ChoiceEventId {
        const step: WorkflowStepHandover = {
            id: ulid(),
            kind: 'handover',
            settings: handoverSettings,
        }
        return this.insertChoiceAndStepTargetAndSelect(choiceLabel, step)
    }

    insertChoiceAndShopperAuthenticationStepAndSelect(
        choiceLabel: string,
        shopperAuthenticationSettings: WorkflowStepShopperAuthentication['settings'],
    ): ChoiceEventId {
        const step: WorkflowStepShopperAuthentication = {
            id: ulid(),
            kind: 'shopper-authentication',
            settings: shopperAuthenticationSettings,
        }
        return this.insertChoiceAndStepTargetAndSelect(choiceLabel, step)
    }

    insertShopperAuthenticationStepAndSelect(
        settings: WorkflowStepShopperAuthentication['settings'],
    ) {
        const step: WorkflowStepShopperAuthentication = {
            id: ulid(),
            kind: 'shopper-authentication',
            settings,
        }
        this.data.steps.push(step)
        this.data.transitions.push({
            id: ulid(),
            from_step_id: this._selection.id,
            to_step_id: step.id,
        })
        this._selection = step
    }

    insertTextInputStepAndSelect(settings: WorkflowStepTextInput['settings']) {
        const step: WorkflowStepTextInput = {
            id: ulid(),
            kind: 'text-input',
            settings,
        }
        this.data.steps.push(step)
        this.data.transitions.push({
            id: ulid(),
            from_step_id: this._selection.id,
            to_step_id: step.id,
        })
        this._selection = step
    }

    insertEndStepAndSelect() {
        const step: WorkflowStepEnd = {
            id: ulid(),
            kind: 'end',
        }
        this.data.steps.push(step)
        this.data.transitions.push({
            id: ulid(),
            from_step_id: this._selection.id,
            to_step_id: step.id,
        })
        this._selection = step
    }

    insertAttachmentsInputStepAndSelect(
        settings: WorkflowStepAttachmentsInput['settings'],
    ) {
        const step: WorkflowStepAttachmentsInput = {
            id: ulid(),
            kind: 'attachments-input',
            settings,
        }
        this.data.steps.push(step)
        this.data.transitions.push({
            id: ulid(),
            from_step_id: this._selection.id,
            to_step_id: step.id,
        })
        this._selection = step
    }

    insertMessageStepAndSelect(
        message: WorkflowStepMessage['settings']['message'],
        conditions?: WorkflowTransition['conditions'],
    ) {
        const step: WorkflowStepMessage = {
            id: ulid(),
            kind: 'message',
            settings: {
                message,
            },
        }
        this.data.steps.push(step)
        this.data.transitions.push({
            id: ulid(),
            from_step_id: this._selection.id,
            to_step_id: step.id,
            conditions,
        })
        this._selection = step
    }

    insertOrderSelectionStepAndSelect(
        settings: WorkflowStepOrderSelection['settings'],
    ) {
        const step: WorkflowStepOrderSelection = {
            id: ulid(),
            kind: 'order-selection',
            settings,
        }
        this.data.steps.push(step)
        this.data.transitions.push({
            id: ulid(),
            from_step_id: this._selection.id,
            to_step_id: step.id,
        })
        this._selection = step
    }

    insertHttpRequestStepAndSelect(
        settings: WorkflowStepHttpRequest['settings'],
    ) {
        const step: WorkflowStepHttpRequest = {
            id: ulid(),
            kind: 'http-request',
            settings,
        }
        this.data.steps.push(step)
        this.data.transitions.push({
            id: ulid(),
            from_step_id: this._selection.id,
            to_step_id: step.id,
        })
        this._selection = step
    }

    insertHandoverStepAndSelect(
        settings: WorkflowStepHandover['settings'] = {},
    ) {
        const step: WorkflowStepHandover = {
            id: ulid(),
            kind: 'handover',
            settings,
        }
        this.data.steps.push(step)
        this.data.transitions.push({
            id: ulid(),
            from_step_id: this._selection.id,
            to_step_id: step.id,
        })
        this._selection = step
    }

    insertHelpfulPromptStepAndSelect() {
        const step: WorkflowStepHelpfulPrompt = {
            id: ulid(),
            kind: 'helpful-prompt',
        }
        this.data.steps.push(step)
        this.data.transitions.push({
            id: ulid(),
            from_step_id: this._selection.id,
            to_step_id: step.id,
        })
        this._selection = step
    }

    selectParentStep() {
        const parentStepId = this.data.transitions.find(
            (t) => t.to_step_id === this._selection.id,
        )?.from_step_id
        if (!parentStepId) throw new Error('no parent step found')
        const parentStep = this.data.steps.find((s) => s.id === parentStepId)
        if (!parentStep)
            throw new Error('no parent step found (orphan transition)')
        this._selection = parentStep
    }

    selectStepById(stepId: string) {
        const step = this.data.steps.find((s) => s.id === stepId)
        if (!step) throw new Error('step not found')
        this._selection = step
    }

    selectInitialStep() {
        const step = this.data.steps.find(
            (s) => s.id === this.data.initial_step_id,
        )
        if (!step) throw new Error('initial step missing')
        this._selection = step
    }

    build<T extends WorkflowConfiguration>(): T {
        return this.data as T
    }

    // getter for the current selection
    public get selection(): WorkflowStep {
        return this._selection
    }
}
