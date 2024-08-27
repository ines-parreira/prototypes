import _ from 'lodash'
import {ulid} from 'ulidx'
import {
    WorkflowVariableGroup,
    WorkflowVariable,
} from 'pages/automate/workflows/models/variables.types'
import {
    ConditionSchema,
    VarSchema,
} from 'pages/automate/workflows/models/conditions.types'
import {extractVariablesFromText} from 'pages/automate/workflows/models/variables.model'
import {
    StoreWorkflowsConfiguration,
    CustomActionConfigurationFormInput,
    TemplateConfigurationFormInput,
    CustomActionFormInputValues,
    TemplateActionFormInputValues,
    TemplateConfiguration,
    LlmPromptTrigger,
    CustomInput,
    StepHttpRequest,
    ActionAppsConfiguration,
} from './types'

export const shipmentStatus: WorkflowVariable = {
    name: 'Shipment status',
    value: 'objects.order.fulfillments.0.external_shipment_status',
    nodeType: 'order_selection',
    type: 'string',
}

export const fulfillmentStatus: WorkflowVariable = {
    name: 'Fulfillment status',
    value: 'objects.order.external_fulfillment_status',
    nodeType: 'order_selection',
    type: 'string',
}

export const orderStatus: WorkflowVariable = {
    name: 'Order status',
    value: 'objects.order.external_status',
    nodeType: 'order_selection',
    type: 'string',
}

export const paymentStatus: WorkflowVariable = {
    name: 'Payment status',
    value: 'objects.order.external_payment_status',
    nodeType: 'order_selection',
    type: 'string',
}

export const orderVariables: WorkflowVariable[] = [
    {
        name: 'Order id',
        value: 'objects.order.external_id',
        nodeType: 'order_selection',
        type: 'string',
    },
    {
        name: 'Ecommerce customer id',
        value: 'objects.order.shopper_external_id',
        nodeType: 'order_selection',
        type: 'string',
    },
    {
        name: 'Currency',
        value: 'objects.order.currency.code',
        nodeType: 'order_selection',
        type: 'string',
    },
    {
        name: 'Total discounts',
        value: 'objects.order.discount_amount',
        nodeType: 'order_selection',
        type: 'number',
    },
    {
        name: 'Subtotal price',
        value: 'objects.order.subtotal_amount',
        nodeType: 'order_selection',
        type: 'number',
    },
    {
        name: 'Shipping price',
        value: 'objects.order.shipping_amount',
        nodeType: 'order_selection',
        type: 'number',
    },
    {
        name: 'Total tax',
        value: 'objects.order.tax_amount',
        nodeType: 'order_selection',
        format: 'currency',
        type: 'number',
    },
    fulfillmentStatus,
    {
        name: 'Fulfillment last updated date',
        value: 'objects.order.fulfillments.0.updated_datetime',
        nodeType: 'order_selection',
        type: 'date',
    },
    paymentStatus,
    orderStatus,
    {
        name: 'Cancellation date',
        value: 'objects.order.cancelled_datetime',
        nodeType: 'order_selection',
        type: 'date',
    },
    {
        name: 'Billing address line 1',
        value: 'objects.order.billing_address.line_1',
        nodeType: 'order_selection',
        type: 'string',
    },
    {
        name: 'Billing address line 2',
        value: 'objects.order.billing_address.line_2',
        nodeType: 'order_selection',
        type: 'string',
    },
    {
        name: 'Billing address city',
        value: 'objects.order.billing_address.city',
        nodeType: 'order_selection',
        type: 'string',
    },
    {
        name: 'Billing address state',
        value: 'objects.order.billing_address.state',
        nodeType: 'order_selection',
        type: 'string',
    },
    {
        name: 'Billing address country',
        value: 'objects.order.billing_address.country',
        nodeType: 'order_selection',
        type: 'string',
    },
    {
        name: 'Billing address zip code',
        value: 'objects.order.billing_address.zip_code',
        nodeType: 'order_selection',
        type: 'string',
    },
    {
        name: 'Billing address first name',
        value: 'objects.order.billing_address.first_name',
        nodeType: 'order_selection',
        type: 'string',
    },
    {
        name: 'Billing address last name',
        value: 'objects.order.billing_address.last_name',
        nodeType: 'order_selection',
        type: 'string',
    },
    {
        name: 'Billing address phone number',
        value: 'objects.order.billing_address.phone_number',
        nodeType: 'order_selection',
        type: 'string',
    },
    {
        name: 'Shipping address line 1',
        value: 'objects.order.shipping_address.line_1',
        nodeType: 'order_selection',
        type: 'string',
    },
    {
        name: 'Shipping address line 2',
        value: 'objects.order.shipping_address.line_2',
        nodeType: 'order_selection',
        type: 'string',
    },
    {
        name: 'Shipping address city',
        value: 'objects.order.shipping_address.city',
        nodeType: 'order_selection',
        type: 'string',
    },
    {
        name: 'Shipping address state',
        value: 'objects.order.shipping_address.state',
        nodeType: 'order_selection',
        type: 'string',
    },
    {
        name: 'Shipping address country',
        value: 'objects.order.shipping_address.country',
        nodeType: 'order_selection',
        type: 'string',
    },
    {
        name: 'Shipping address zip code',
        value: 'objects.order.shipping_address.zip_code',
        nodeType: 'order_selection',
        type: 'string',
    },
    {
        name: 'Shipping address first name',
        value: 'objects.order.shipping_address.first_name',
        nodeType: 'order_selection',
        type: 'string',
    },
    {
        name: 'Shipping address last name',
        value: 'objects.order.shipping_address.last_name',
        nodeType: 'order_selection',
        type: 'string',
    },
    {
        name: 'Shipping address phone number',
        value: 'objects.order.shipping_address.phone_number',
        nodeType: 'order_selection',
        type: 'string',
    },
    shipmentStatus,
    {
        name: 'Tracking url',
        value: 'objects.order.tracking_url',
        nodeType: 'order_selection',
        type: 'string',
    },
    {
        name: 'Tracking number',
        value: 'objects.order.tracking_number',
        nodeType: 'order_selection',
        type: 'string',
    },
    {
        name: 'Shipping date',
        value: 'objects.order.shipping_datetime',
        nodeType: 'order_selection',
        type: 'date',
    },
    {
        name: 'Shipping method id',
        value: 'objects.order.shipping_lines.0.external_method_id',
        nodeType: 'order_selection',
        type: 'string',
    },
    {
        name: 'Shipping method name',
        value: 'objects.order.shipping_lines.0.method_name',
        nodeType: 'order_selection',
        type: 'string',
    },
    {
        name: 'Order number',
        value: 'objects.order.name',
        nodeType: 'order_selection',
        type: 'string',
    },
    {
        name: 'Order total amount',
        value: 'objects.order.total_amount',
        nodeType: 'order_selection',
        type: 'number',
        format: 'currency',
    },
    {
        name: 'Order date',
        value: 'objects.order.created_datetime',
        nodeType: 'order_selection',
        type: 'date',
    },
]

export const customerVariables: WorkflowVariable[] = [
    {
        name: 'Customer first name',
        value: 'objects.customer.firstname',
        nodeType: 'shopper_authentication',
        type: 'string',
    },
    {
        name: 'Customer last name',
        value: 'objects.customer.lastname',
        nodeType: 'shopper_authentication',
        type: 'string',
    },
    {
        name: 'Customer full name',
        value: 'objects.customer.name',
        nodeType: 'shopper_authentication',
        type: 'string',
    },
    {
        name: 'Customer email',
        value: 'objects.customer.email',
        nodeType: 'shopper_authentication',
        type: 'string',
    },
    {
        name: 'Customer phone number',
        value: 'objects.customer.phone_number',
        nodeType: 'shopper_authentication',
        type: 'string',
    },
    {
        name: 'Customer tags',
        value: 'objects.customer.tags_stringified',
        nodeType: 'shopper_authentication',
        type: 'string',
    },
]

export function getStepByKind<
    T extends StoreWorkflowsConfiguration['steps'][number]['kind']
>(steps: StoreWorkflowsConfiguration['steps'], kind: T) {
    return steps.find(
        (step): step is Extract<typeof step, {kind: T}> => step.kind === kind
    )
}

export function getEntrypointByKind<
    T extends StoreWorkflowsConfiguration['entrypoints'][number]['kind']
>(entrypoints: StoreWorkflowsConfiguration['entrypoints'], kind: T) {
    return entrypoints.find(
        (entrypoint): entrypoint is Extract<typeof entrypoint, {kind: T}> =>
            entrypoint.kind === kind
    )
}

export function getTriggerstByKind<
    T extends StoreWorkflowsConfiguration['triggers'][number]['kind']
>(triggers: StoreWorkflowsConfiguration['triggers'], kind: T) {
    return triggers.find(
        (trigger): trigger is Extract<typeof trigger, {kind: T}> =>
            trigger.kind === kind
    )
}
function getConditionsType(trigger: LlmPromptTrigger) {
    if (!trigger.settings.conditions) {
        return null
    }
    if ('and' in trigger.settings.conditions) {
        return 'and'
    }
    if ('or' in trigger.settings.conditions) {
        return 'or'
    }
    return null
}

export function transformCustomInputToWorkflowVariable(
    customInputs: CustomInput[]
) {
    return customInputs
        .filter((input) => input && input.name.length > 0 && input.dataType)
        .map(
            (input) =>
                ({
                    name: input.name,
                    value: `custom_inputs.${input.id}`,
                    nodeType: 'custom_input',
                    type: input.dataType,
                } as WorkflowVariable)
        )
}

export function getInputVariables(customInputs: CustomInput[]) {
    const customInputsWorkflowVariables =
        transformCustomInputToWorkflowVariable(customInputs)

    const customVariableGroup: WorkflowVariableGroup = {
        name: 'Inputs',
        nodeType: 'custom_input',
        variables: customInputsWorkflowVariables,
    }

    const customerVariableGroup: WorkflowVariableGroup = {
        name: 'Existing customer',
        nodeType: 'shopper_authentication',
        variables: customerVariables,
    }

    const orderVariableGroup: WorkflowVariableGroup = {
        name: 'Order',
        nodeType: 'order_selection',
        variables: orderVariables,
    }

    const variableGroups = [
        customVariableGroup,
        customerVariableGroup,
        orderVariableGroup,
    ]

    return variableGroups.filter((group) => group.variables.length > 0)
}

export function wfConfgurationToTemplateFormValue(
    configuration: TemplateConfigurationFormInput,
    template: TemplateConfiguration
): TemplateActionFormInputValues {
    const llmPromptTrigger = getTriggerstByKind(
        configuration.triggers,
        'llm-prompt'
    )

    if (!template.triggers)
        throw new Error('Template configuration does not have triggers')

    const templateLlmPromptTrigger = getTriggerstByKind(
        template.triggers,
        'llm-prompt'
    )

    const llmConversationEntryPoint = getEntrypointByKind(
        configuration.entrypoints,
        'llm-conversation'
    )

    const conditionsType = llmPromptTrigger
        ? getConditionsType(llmPromptTrigger)
        : null

    const conditions =
        conditionsType &&
        conditionsType in (llmPromptTrigger?.settings.conditions ?? {})
            ? (
                  llmPromptTrigger?.settings.conditions as Record<
                      string,
                      ConditionSchema[]
                  >
              )[conditionsType]
            : []

    const customInputConfiguration =
        llmPromptTrigger?.settings.custom_inputs.map((input) => ({
            id: input.id,
            name: input.name,
            instructions: input.instructions,
            dataType: input.data_type,
        })) ?? []

    const templateCustomInput =
        templateLlmPromptTrigger?.settings.custom_inputs.map((input) => ({
            id: input.id,
            name: input.name,
            instructions: input.instructions,
            dataType: input.data_type,
            isTemplateCustomInputs: true,
        })) ?? []

    const customInput = [...templateCustomInput, ...customInputConfiguration]

    const appApiKey =
        configuration.apps?.[0].type === 'app' && configuration.apps[0].api_key
            ? configuration.apps[0].api_key
            : null

    return {
        appApiKey,
        aiAgentInstructions:
            llmConversationEntryPoint?.settings.instructions ?? '',
        name: configuration.name,
        isAvailableForAiAgent:
            llmConversationEntryPoint?.deactivated_datetime === null ||
            llmConversationEntryPoint?.deactivated_datetime === undefined,
        conditionsType,
        conditions,
        customInput,
    }
}
export function storeWorkflowsConfgurationToFormValue(
    configuration: CustomActionConfigurationFormInput
): CustomActionFormInputValues {
    const httpStep = getStepByKind(configuration.steps, 'http-request')
    const llmPromptTrigger = getTriggerstByKind(
        configuration.triggers,
        'llm-prompt'
    )
    const llmConversationEntryPoint = getEntrypointByKind(
        configuration.entrypoints,
        'llm-conversation'
    )

    const conditionsType = llmPromptTrigger
        ? getConditionsType(llmPromptTrigger)
        : null

    const conditions =
        conditionsType &&
        conditionsType in (llmPromptTrigger?.settings.conditions ?? {})
            ? (
                  llmPromptTrigger?.settings.conditions as Record<
                      string,
                      ConditionSchema[]
                  >
              )[conditionsType]
            : []

    const httpContentType =
        Object.entries(httpStep?.settings.headers ?? {})
            .map(([name, value]) => ({name, value}))
            .find(({name}) => name.toLocaleLowerCase() === 'content-type')
            ?.value ?? null

    const httpHeaders = Object.entries(httpStep?.settings.headers ?? {}).map(
        ([name, value]) => ({name, value})
    )

    const customInput =
        llmPromptTrigger?.settings.custom_inputs.map((input) => ({
            id: input.id,
            name: input.name,
            instructions: input.instructions,
            dataType: input.data_type,
        })) ?? []

    return {
        aiAgentInstructions:
            llmConversationEntryPoint?.settings.instructions ?? '',
        outputsDescription:
            llmPromptTrigger?.settings.outputs[0].description ?? '',
        name: configuration.name,
        requiresConfirmation:
            llmConversationEntryPoint?.settings.requires_confirmation ?? false,
        isAvailableForAiAgent:
            llmConversationEntryPoint?.deactivated_datetime === null ||
            llmConversationEntryPoint?.deactivated_datetime === undefined,
        httpMethod: httpStep?.settings.method ?? 'GET',
        httpHeaders,
        httpUrl: httpStep?.settings.url ?? '',
        httpBody: httpStep?.settings.body,
        httpContentType,
        conditionsType,
        conditions,
        customInput,
    }
}

export function generatObjectInputs(
    variables: string[],
    storeIntegrationId: number
) {
    const objectInputs: LlmPromptTrigger['settings']['object_inputs'] = []
    if (variables.some((variable) => variable.includes('objects.order'))) {
        objectInputs.push({
            kind: 'order' as const,
            integration_id: storeIntegrationId,
        })
    }
    if (variables.some((variable) => variable.includes('objects.customer'))) {
        objectInputs.push({
            kind: 'customer' as const,
            integration_id: storeIntegrationId,
        })
    }
    return objectInputs
}

export function getHttpStepUsedVariables(stepHttpRequest: StepHttpRequest) {
    return [
        ...extractVariablesFromText(stepHttpRequest.settings.url ?? '').map(
            (variable) => variable.value
        ),
        ..._.flatten(
            Object.values(stepHttpRequest.settings.headers ?? {}).map(
                (header) =>
                    extractVariablesFromText(header).map(
                        (variable) => variable.value
                    )
            )
        ),
        ...extractVariablesFromText(stepHttpRequest.settings.body ?? '').map(
            (variable) => variable.value
        ),
    ]
}

export function getConditionsUsedVariables(conditions: ConditionSchema[]) {
    return _.flatten(
        conditions.map((condition) =>
            Object.values(condition).map(
                (value: [VarSchema, string | null]) => value[0].var
            )
        )
    )
}

export function generateNewCustomActionConfigurationFormInput(): CustomActionConfigurationFormInput {
    const httpStepId = ulid()
    const httpStepVariableId = ulid()
    return {
        name: '',
        id: ulid(),
        initial_step_id: httpStepId,
        is_draft: false,
        entrypoints: [
            {
                kind: 'llm-conversation',
                trigger: 'llm-prompt',
                settings: {
                    instructions: '',
                    requires_confirmation: false,
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
                    outputs: [
                        {
                            description: '',
                            id: ulid(),
                            path: `steps_state.${httpStepId}.content.${httpStepVariableId}`,
                        },
                    ],
                },
            },
        ],
        steps: [
            {
                id: httpStepId,
                kind: 'http-request',
                settings: {
                    url: '',
                    method: 'GET',
                    headers: {},
                    name: '',
                    variables: [
                        {
                            id: httpStepVariableId,
                            name: 'Request result',
                            jsonpath: '$',
                            data_type: null as any,
                        },
                    ],
                },
            },
        ],
        transitions: [],
        available_languages: [],
        updated_datetime: new Date().toISOString(),
    }
}

export function getActionsAppByType<
    T extends ActionAppsConfiguration[number]['type']
>(type: T, apps?: ActionAppsConfiguration | null) {
    return apps?.find(
        (app): app is Extract<typeof app, {type: T}> => app.type === type
    )
}
