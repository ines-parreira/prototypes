import type { ReactNode } from 'react'
import React from 'react'

import { Liquid, Output } from 'liquidjs'
import type { IdentifierToken, PropertyAccessToken } from 'liquidjs/dist/tokens'
import _flatten from 'lodash/flatten'
import _get from 'lodash/get'
import _keyBy from 'lodash/keyBy'
import _set from 'lodash/set'

import AppIcon from 'pages/automate/actionsPlatform/components/AppIcon'
import type { App } from 'pages/automate/actionsPlatform/types'
import { validateJSON } from 'utils'

import type {
    AVAILABLE_3PL_INTEGRATIONS,
    AvailableIntegrations,
    WorkflowVariable,
    WorkflowVariableGroup,
    WorkflowVariableList,
} from './variables.types'
import { SHIPMONK_APPLICATION_ID } from './variables.types'
import type {
    VisualBuilderEdge,
    VisualBuilderGraph,
    VisualBuilderNode,
} from './visualBuilderGraph.types'
import { isVisualBuilderGraphAppApp } from './visualBuilderGraph.types'
import type { WorkflowConfiguration } from './workflowConfiguration.types'

const templateEngine = new Liquid({
    timezoneOffset: 0,
    dateFormat: '%Y-%m-%dT%H:%M:%S.%LZ',
})

templateEngine.registerFilter('json_escape', (value: unknown) => {
    if (typeof value === 'string') {
        return JSON.stringify(value).slice(1, -1)
    }

    return value
})

// any text starting with {{ and ending with }} will be interpreted as a variable by the API template engine
export const workflowVariableRegex = /{{[^{}]*}}/g
export const liquidTemplateVariableRegex = /\[\[[^\[\]]*\]\]/g
export function extractVariablesFromText(
    text: string,
    isLiquidTemplate: boolean = false,
): {
    value: string
    filter?: string
}[] {
    const match = isLiquidTemplate
        ? text.match(/\[\[[^\[\]]*\]\]/g)
        : text.match(/{{[^{}]*}}/g)

    if (match) {
        return match.map((variable) => {
            const [value, ...filters] = variable.slice(2, -2).split('|')

            return {
                value: value.trim(),
                filter: filters.length ? filters.join('|').trim() : undefined,
            }
        })
    }
    return []
}

export function findVariable(
    variables: WorkflowVariableList,
    fn: (
        v: WorkflowVariable | WorkflowVariableGroup,
    ) => WorkflowVariable | undefined,
): WorkflowVariable | undefined {
    for (const variable of variables) {
        const result = fn(variable)
        if (result) {
            return result
        }
        if ('variables' in variable) {
            const recursiveResult = findVariable(variable.variables, fn)
            if (recursiveResult) {
                return recursiveResult
            }
        }
    }
}

export function findManyVariables(
    variables: WorkflowVariableList,
    fn: (
        v: WorkflowVariable | WorkflowVariableGroup,
    ) => WorkflowVariable | undefined,
): WorkflowVariable[] {
    const result: WorkflowVariable[] = []
    for (const variable of variables) {
        const found = fn(variable)
        if (found) {
            result.push(found)
        }
        if ('variables' in variable) {
            result.push(...findManyVariables(variable.variables, fn))
        }
    }
    return result
}

export function filterManyVariables(
    variables: WorkflowVariableList,
    fn: (v: WorkflowVariable) => boolean,
): WorkflowVariableList {
    return variables.reduce<WorkflowVariableList>((acc, variable) => {
        if ('value' in variable) {
            if (fn(variable)) {
                return [...acc, variable]
            }

            return acc
        }

        const variables = filterManyVariables(variable.variables, fn)

        if (!variables.length) {
            return acc
        }

        return [...acc, { ...variable, variables }]
    }, [])
}

export function parseWorkflowVariable(
    value: string,
    availableVariables: WorkflowVariableList,
): WorkflowVariable | null {
    const variable = findVariable(availableVariables, (v) => {
        if ('value' in v && v.value === value) {
            return v
        }
    })

    if (!variable) return null

    return variable
}

export function hasInvalidVariables(
    value: string,
    variables: WorkflowVariableList,
    isLiquidTemplate: boolean = false,
): boolean {
    const variablesInUse = extractVariablesFromText(
        value,
        isLiquidTemplate,
    ).map((variable) => variable.value)

    return variablesInUse
        .map((variable) => parseWorkflowVariable(variable, variables))
        .some((v) => !v)
}

export const buildWorkflowVariableFromApp = (
    graph: VisualBuilderGraph,
    apps: App[],
):
    | WorkflowVariable
    | WorkflowVariableGroup
    | WorkflowVariableList
    | undefined => {
    const appsById = _keyBy(apps, 'id')

    return graph.apps?.filter(isVisualBuilderGraphAppApp).map((actionApp) => {
        const appId = actionApp.app_id

        return {
            name: `${appsById[appId]?.name ?? appId} API key`,
            value: `apps.${appId}.api_key`,
            nodeType: 'app',
            type: 'string',
        }
    })
}

const INTEGRATION_VARIABLE_MAP: Record<
    (typeof AVAILABLE_3PL_INTEGRATIONS)[number],
    (icon: ReactNode) => WorkflowVariable | WorkflowVariableGroup
> = {
    [SHIPMONK_APPLICATION_ID]: (icon: ReactNode) => ({
        name: 'ShipMonk order',
        nodeType: 'order_shipmonk',
        icon,
        variables: [
            {
                name: 'Delivered date',
                value: 'objects.order_shipmonk.order_tracking_data_output.0.delivered_at',
                nodeType: 'order_shipmonk',
                type: 'date',
                icon,
            },
            {
                name: 'Fulfillment status',
                value: 'objects.order_shipmonk.status',
                nodeType: 'order_shipmonk',
                type: 'string',
                icon,
                options: [
                    { value: 'invalid', label: 'invalid' },
                    { value: 'cancelled', label: 'cancelled' },
                    { value: 'processing', label: 'processing' },
                    { value: 'submitted', label: 'submitted' },
                    { value: 'complete', label: 'complete' },
                    { value: 'onHold', label: 'on hold' },
                    { value: 'pick_in_progress', label: 'pick in progress' },
                    { value: 'pending_batching', label: 'pending batching' },
                    {
                        value: 'fulfilled_by_3rd',
                        label: 'fulfilled by 3rd party',
                    },
                    {
                        value: 'awaiting_package_forwarding',
                        label: 'awaiting package forwarding',
                    },
                ],
            },
            {
                name: 'Order number',
                value: 'objects.order_shipmonk.order_number',
                nodeType: 'order_shipmonk',
                type: 'string',
                icon,
            },
            {
                name: 'Packages count',
                value: 'objects.order_shipmonk.packages_count',
                nodeType: 'order_shipmonk',
                type: 'number',
                icon,
            },
            {
                name: 'Shipping method',
                value: 'objects.order_shipmonk.shipping_method',
                nodeType: 'order_shipmonk',
                type: 'string',
                icon,
            },
            {
                name: 'Store name',
                value: 'objects.order_shipmonk.store_name',
                nodeType: 'order_shipmonk',
                type: 'string',
                icon,
            },
            {
                name: 'Submitted date',
                value: 'objects.order_shipmonk.date_submitted',
                nodeType: 'order_shipmonk',
                type: 'date',
                icon,
            },
            {
                name: 'Tracking link',
                value: 'objects.order_shipmonk.order_tracking_data_output.0.tracking_link',
                nodeType: 'order_shipmonk',
                type: 'string',
                icon,
            },
            {
                name: 'Tracking number',
                value: 'objects.order_shipmonk.order_tracking_data_output.0.tracking_number',
                nodeType: 'order_shipmonk',
                type: 'string',
                icon,
            },
        ],
    }),
}

export const buildWorkflowVariableFromIntegration = (
    availableIntegrations: AvailableIntegrations,
    apps: App[],
): WorkflowVariableList => {
    return (
        availableIntegrations?.map(({ application_id }) => {
            const app = apps.find((app) => app.id === application_id)
            const icon = <AppIcon icon={app?.icon} name={app?.name} />
            return INTEGRATION_VARIABLE_MAP[application_id](icon)
        }) || []
    )
}

export const buildWorkflowVariableFromTrigger = (
    graph: VisualBuilderGraph,
):
    | WorkflowVariable
    | WorkflowVariableGroup
    | WorkflowVariableList
    | undefined => {
    const triggerNode = graph.nodes[0]

    if (
        triggerNode.type === 'llm_prompt_trigger' ||
        triggerNode.type === 'reusable_llm_prompt_trigger'
    ) {
        const {
            data: { inputs },
        } = triggerNode

        const customInputs: WorkflowVariableGroup = {
            name: 'Inputs',
            nodeType: 'custom_input',
            variables: inputs
                .filter((input) => !!input.name)
                .map((input) =>
                    'data_type' in input
                        ? {
                              name: input.name,
                              value: `custom_inputs.${input.id}`,
                              nodeType: 'custom_input',
                              type: input.data_type,
                          }
                        : {
                              name: input.name,
                              nodeType: 'custom_input',
                              variables: [
                                  {
                                      name: 'Product id',
                                      value: `objects.products.${input.id}.external_id`,
                                      nodeType: 'custom_input',
                                      type: 'string',
                                  },
                                  {
                                      name: 'Product name',
                                      value: `objects.products.${input.id}.name`,
                                      nodeType: 'custom_input',
                                      type: 'string',
                                  },
                                  {
                                      name: 'Product type',
                                      value: `objects.products.${input.id}.external_type`,
                                      nodeType: 'custom_input',
                                      type: 'string',
                                  },
                                  {
                                      name: 'Product variant id',
                                      value: `objects.products.${input.id}.selected_variant.external_id`,
                                      nodeType: 'custom_input',
                                      type: 'string',
                                  },
                                  {
                                      name: 'Product variant global id',
                                      value: `objects.products.${input.id}.selected_variant.external_gid`,
                                      nodeType: 'custom_input',
                                      type: 'string',
                                  },
                                  {
                                      name: 'Product variant quantity in stock',
                                      value: `objects.products.${input.id}.selected_variant.quantity`,
                                      nodeType: 'custom_input',
                                      type: 'number',
                                  },
                                  {
                                      name: 'Product variant name',
                                      value: `objects.products.${input.id}.selected_variant.name`,
                                      nodeType: 'custom_input',
                                      type: 'string',
                                  },
                              ],
                          },
                ),
        }

        const merchantInputs: WorkflowVariableGroup = {
            name: 'Merchant inputs',
            nodeType: 'merchant_input',
            variables:
                graph.inputs
                    ?.filter((input) => !!input.name)
                    .map((input) => ({
                        name: input.name,
                        value: `values.${input.id}`,
                        nodeType: 'merchant_input',
                        type: input.data_type,
                    })) || [],
        }

        return [
            ...(customInputs.variables.length ? [customInputs] : []),
            ...(merchantInputs.variables.length ? [merchantInputs] : []),
            {
                name: 'Existing customer',
                nodeType: 'shopper_authentication',
                variables: [
                    {
                        name: 'Customer id',
                        value: 'objects.customer.id',
                        nodeType: 'shopper_authentication',
                        type: 'number',
                    },
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
                ],
            },
            {
                name: 'Order',
                nodeType: 'order_selection',
                variables: [
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
                        format: 'currency',
                        type: 'number',
                    },
                    {
                        name: 'Subtotal price',
                        value: 'objects.order.subtotal_amount',
                        nodeType: 'order_selection',
                        format: 'currency',
                        type: 'number',
                    },
                    {
                        name: 'Shipping price',
                        value: 'objects.order.shipping_amount',
                        nodeType: 'order_selection',
                        format: 'currency',
                        type: 'number',
                    },
                    {
                        name: 'Total tax',
                        value: 'objects.order.tax_amount',
                        nodeType: 'order_selection',
                        format: 'currency',
                        type: 'number',
                    },
                    {
                        name: 'Fulfillment status',
                        value: 'objects.order.external_fulfillment_status',
                        nodeType: 'order_selection',
                        type: 'string',
                        options: [
                            { value: null, label: 'unfulfilled' },
                            { value: 'partial', label: 'partially fulfilled' },
                            { value: 'fulfilled', label: 'fulfilled' },
                            { value: 'restocked', label: 'restocked' },
                        ],
                    },
                    {
                        name: 'Fulfillment last updated date',
                        value: 'objects.order.fulfillments.0.updated_datetime',
                        nodeType: 'order_selection',
                        type: 'date',
                    },
                    {
                        name: 'Payment status',
                        value: 'objects.order.external_payment_status',
                        nodeType: 'order_selection',
                        type: 'string',
                        options: [
                            { value: 'pending', label: 'pending' },
                            { value: 'authorized', label: 'authorized' },
                            { value: 'paid', label: 'paid' },
                            { value: 'refunded', label: 'refunded' },
                            {
                                value: 'partially_refunded',
                                label: 'partially refunded',
                            },
                            { value: 'voided', label: 'voided' },
                            {
                                value: 'partially_paid',
                                label: 'partially paid',
                            },
                            { value: 'unpaid', label: 'unpaid' },
                        ],
                    },
                    {
                        name: 'Order status',
                        value: 'objects.order.external_status',
                        nodeType: 'order_selection',
                        type: 'string',
                        options: [
                            { value: 'open', label: 'open' },
                            { value: 'archived', label: 'archived' },
                            { value: 'cancelled', label: 'cancelled' },
                        ],
                    },
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
                    {
                        name: 'Shipment status',
                        value: 'objects.order.fulfillments.0.external_shipment_status',
                        nodeType: 'order_selection',
                        type: 'string',
                        options: [
                            { value: 'label_printed', label: 'label printed' },
                            {
                                value: 'label_purchased',
                                label: 'label purchased',
                            },
                            { value: 'confirmed', label: 'confirmed' },
                            { value: 'in_transit', label: 'in transit' },
                            {
                                value: 'attempted_delivery',
                                label: 'attempted delivery',
                            },
                            {
                                value: 'ready_for_pickup',
                                label: 'ready for pickup',
                            },
                            { value: 'delivered', label: 'delivered' },
                            { value: 'failure', label: 'failure' },
                        ],
                    },
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
                        name: 'Order name',
                        value: 'objects.order.name',
                        nodeType: 'order_selection',
                        type: 'string',
                    },
                    {
                        name: 'Order number',
                        value: 'objects.order.number',
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
                    {
                        name: 'Order note',
                        value: 'objects.order.note',
                        nodeType: 'order_selection',
                        type: 'string',
                    },
                    {
                        name: 'Order tags',
                        value: 'objects.order.tags_stringified',
                        nodeType: 'order_selection',
                        type: 'string',
                    },
                ],
            },
        ]
    }
}

export const buildWorkflowVariableFromNode = (
    graph: VisualBuilderGraph,
    node: VisualBuilderNode,
    steps: WorkflowConfiguration[],
    apps: App[],
):
    | WorkflowVariable
    | WorkflowVariableGroup
    | WorkflowVariableList
    | undefined => {
    const formatVariableName = (text: string) =>
        text.replace(workflowVariableRegex, '{...}')

    const hasShopifyApp = graph.apps?.some((app) => app.type === 'shopify')

    if (node.type === 'text_reply') {
        const {
            data: {
                content: { text },
            },
        } = node
        return {
            name: formatVariableName(text.length > 0 ? text : 'Text reply'),
            value: `steps_state.${node.id}.content.text`,
            nodeType: 'text_reply',
            type: 'string',
        }
    } else if (node.type === 'multiple_choices') {
        const {
            data: {
                content: { text },
            },
        } = node
        return {
            name: formatVariableName(text.length > 0 ? text : 'Question'),
            value: `steps_state.${node.id}.selected_choice.label`,
            nodeType: 'multiple_choices',
            type: 'string',
        }
    } else if (node.type === 'order_selection') {
        const {
            data: {
                content: { text },
            },
        } = node
        return {
            nodeType: 'order_selection',
            name: formatVariableName(
                text.length > 0 ? text : 'Order selection',
            ),
            variables: [
                {
                    name: 'Order id',
                    value: `steps_state.${node.id}.order.external_id`,
                    nodeType: 'order_selection',
                    type: 'string',
                },
                {
                    name: 'Ecommerce customer id',
                    value: `steps_state.${node.id}.order.shopper_external_id`,
                    nodeType: 'order_selection',
                    type: 'string',
                },
                {
                    name: 'Currency',
                    value: `steps_state.${node.id}.order.currency.code`,
                    nodeType: 'order_selection',
                    type: 'string',
                },
                {
                    name: 'Total discounts',
                    value: `steps_state.${node.id}.order.discount_amount`,
                    filter: `format_currency: steps_state.${node.id}.order.currency.code, steps_state.${node.id}.order.currency.decimals`,
                    nodeType: 'order_selection',
                    format: 'currency',
                    type: 'number',
                },
                {
                    name: 'Subtotal price',
                    value: `steps_state.${node.id}.order.subtotal_amount`,
                    filter: `format_currency: steps_state.${node.id}.order.currency.code, steps_state.${node.id}.order.currency.decimals`,
                    nodeType: 'order_selection',
                    format: 'currency',
                    type: 'number',
                },
                {
                    name: 'Shipping price',
                    value: `steps_state.${node.id}.order.shipping_amount`,
                    filter: `format_currency: steps_state.${node.id}.order.currency.code, steps_state.${node.id}.order.currency.decimals`,
                    nodeType: 'order_selection',
                    format: 'currency',
                    type: 'number',
                },
                {
                    name: 'Total tax',
                    value: `steps_state.${node.id}.order.tax_amount`,
                    filter: `format_currency: steps_state.${node.id}.order.currency.code, steps_state.${node.id}.order.currency.decimals`,
                    nodeType: 'order_selection',
                    format: 'currency',
                    type: 'number',
                },
                {
                    name: 'Fulfillment status',
                    value: `steps_state.${node.id}.order.external_fulfillment_status`,
                    nodeType: 'order_selection',
                    type: 'string',
                    options: hasShopifyApp
                        ? [
                              { value: null, label: 'unfulfilled' },
                              {
                                  value: 'partial',
                                  label: 'partially fulfilled',
                              },
                              { value: 'fulfilled', label: 'fulfilled' },
                              { value: 'restocked', label: 'restocked' },
                          ]
                        : undefined,
                },
                {
                    name: 'Fulfillment last updated date',
                    value: `steps_state.${node.id}.order.fulfillments.0.updated_datetime`,
                    filter: 'format_datetime',
                    nodeType: 'order_selection',
                    type: 'date',
                },
                {
                    name: 'Payment status',
                    value: `steps_state.${node.id}.order.external_payment_status`,
                    nodeType: 'order_selection',
                    type: 'string',
                    options: hasShopifyApp
                        ? [
                              { value: 'pending', label: 'pending' },
                              { value: 'authorized', label: 'authorized' },
                              { value: 'paid', label: 'paid' },
                              { value: 'refunded', label: 'refunded' },
                              {
                                  value: 'partially_refunded',
                                  label: 'partially refunded',
                              },
                              { value: 'voided', label: 'voided' },
                              {
                                  value: 'partially_paid',
                                  label: 'partially paid',
                              },
                              { value: 'unpaid', label: 'unpaid' },
                          ]
                        : undefined,
                },
                {
                    name: 'Order status',
                    value: `steps_state.${node.id}.order.external_status`,
                    nodeType: 'order_selection',
                    type: 'string',
                    options: hasShopifyApp
                        ? [
                              { value: 'open', label: 'open' },
                              { value: 'archived', label: 'archived' },
                              { value: 'cancelled', label: 'cancelled' },
                          ]
                        : undefined,
                },
                {
                    name: 'Cancellation date',
                    value: `steps_state.${node.id}.order.cancelled_datetime`,
                    filter: 'format_datetime',
                    nodeType: 'order_selection',
                    type: 'date',
                },
                {
                    name: 'Billing address line 1',
                    value: `steps_state.${node.id}.order.billing_address.line_1`,
                    nodeType: 'order_selection',
                    type: 'string',
                },
                {
                    name: 'Billing address line 2',
                    value: `steps_state.${node.id}.order.billing_address.line_2`,
                    nodeType: 'order_selection',
                    type: 'string',
                },
                {
                    name: 'Billing address city',
                    value: `steps_state.${node.id}.order.billing_address.city`,
                    nodeType: 'order_selection',
                    type: 'string',
                },
                {
                    name: 'Billing address state',
                    value: `steps_state.${node.id}.order.billing_address.state`,
                    nodeType: 'order_selection',
                    type: 'string',
                },
                {
                    name: 'Billing address country',
                    value: `steps_state.${node.id}.order.billing_address.country`,
                    nodeType: 'order_selection',
                    type: 'string',
                },
                {
                    name: 'Billing address zip code',
                    value: `steps_state.${node.id}.order.billing_address.zip_code`,
                    nodeType: 'order_selection',
                    type: 'string',
                },
                {
                    name: 'Billing address first name',
                    value: `steps_state.${node.id}.order.billing_address.first_name`,
                    nodeType: 'order_selection',
                    type: 'string',
                },
                {
                    name: 'Billing address last name',
                    value: `steps_state.${node.id}.order.billing_address.last_name`,
                    nodeType: 'order_selection',
                    type: 'string',
                },
                {
                    name: 'Billing address phone number',
                    value: `steps_state.${node.id}.order.billing_address.phone_number`,
                    nodeType: 'order_selection',
                    type: 'string',
                },
                {
                    name: 'Shipping address line 1',
                    value: `steps_state.${node.id}.order.shipping_address.line_1`,
                    nodeType: 'order_selection',
                    type: 'string',
                },
                {
                    name: 'Shipping address line 2',
                    value: `steps_state.${node.id}.order.shipping_address.line_2`,
                    nodeType: 'order_selection',
                    type: 'string',
                },
                {
                    name: 'Shipping address city',
                    value: `steps_state.${node.id}.order.shipping_address.city`,
                    nodeType: 'order_selection',
                    type: 'string',
                },
                {
                    name: 'Shipping address state',
                    value: `steps_state.${node.id}.order.shipping_address.state`,
                    nodeType: 'order_selection',
                    type: 'string',
                },
                {
                    name: 'Shipping address country',
                    value: `steps_state.${node.id}.order.shipping_address.country`,
                    nodeType: 'order_selection',
                    type: 'string',
                },
                {
                    name: 'Shipping address zip code',
                    value: `steps_state.${node.id}.order.shipping_address.zip_code`,
                    nodeType: 'order_selection',
                    type: 'string',
                },
                {
                    name: 'Shipping address first name',
                    value: `steps_state.${node.id}.order.shipping_address.first_name`,
                    nodeType: 'order_selection',
                    type: 'string',
                },
                {
                    name: 'Shipping address last name',
                    value: `steps_state.${node.id}.order.shipping_address.last_name`,
                    nodeType: 'order_selection',
                    type: 'string',
                },
                {
                    name: 'Shipping address phone number',
                    value: `steps_state.${node.id}.order.shipping_address.phone_number`,
                    nodeType: 'order_selection',
                    type: 'string',
                },
                {
                    name: 'Shipment status',
                    value: `steps_state.${node.id}.order.fulfillments.0.external_shipment_status`,
                    nodeType: 'order_selection',
                    type: 'string',
                    options: hasShopifyApp
                        ? [
                              {
                                  value: 'label_printed',
                                  label: 'label printed',
                              },
                              {
                                  value: 'label_purchased',
                                  label: 'label purchased',
                              },
                              { value: 'confirmed', label: 'confirmed' },
                              { value: 'in_transit', label: 'in transit' },
                              {
                                  value: 'attempted_delivery',
                                  label: 'attempted delivery',
                              },
                              {
                                  value: 'ready_for_pickup',
                                  label: 'ready for pickup',
                              },
                              { value: 'delivered', label: 'delivered' },
                              { value: 'failure', label: 'failure' },
                          ]
                        : undefined,
                },
                {
                    name: 'Tracking url',
                    value: `steps_state.${node.id}.order.tracking_url`,
                    nodeType: 'order_selection',
                    type: 'string',
                },
                {
                    name: 'Tracking number',
                    value: `steps_state.${node.id}.order.tracking_number`,
                    nodeType: 'order_selection',
                    type: 'string',
                },
                {
                    name: 'Shipping date',
                    value: `steps_state.${node.id}.order.shipping_datetime`,
                    filter: 'format_datetime',
                    nodeType: 'order_selection',
                    type: 'date',
                },
                {
                    name: 'Shipping method id',
                    value: `steps_state.${node.id}.order.shipping_lines.0.external_method_id`,
                    nodeType: 'order_selection',
                    type: 'string',
                },
                {
                    name: 'Shipping method name',
                    value: `steps_state.${node.id}.order.shipping_lines.0.method_name`,
                    nodeType: 'order_selection',
                    type: 'string',
                },
                {
                    name: 'Order name',
                    value: `steps_state.${node.id}.order.name`,
                    nodeType: 'order_selection',
                    type: 'string',
                },
                {
                    name: 'Order number',
                    value: `steps_state.${node.id}.order.number`,
                    nodeType: 'order_selection',
                    type: 'string',
                },
                {
                    name: 'Order total amount',
                    value: `steps_state.${node.id}.order.total_amount`,
                    filter: `format_currency: steps_state.${node.id}.order.currency.code, steps_state.${node.id}.order.currency.decimals`,
                    nodeType: 'order_selection',
                    type: 'number',
                    format: 'currency',
                },
                {
                    name: 'Order date',
                    value: `steps_state.${node.id}.order.created_datetime`,
                    filter: 'format_datetime',
                    nodeType: 'order_selection',
                    type: 'date',
                },
                {
                    name: 'Order note',
                    value: `steps_state.${node.id}.order.note`,
                    nodeType: 'order_selection',
                    type: 'string',
                },
                {
                    name: 'Order tags',
                    value: `steps_state.${node.id}.order.tags_stringified`,
                    nodeType: 'order_selection',
                    type: 'string',
                },
            ],
        }
    } else if (node.type === 'shopper_authentication') {
        return {
            nodeType: 'shopper_authentication',
            name: 'Customer login',
            variables: [
                {
                    name: 'Customer first name',
                    value: `steps_state.${node.id}.customer.firstname`,
                    nodeType: 'shopper_authentication',
                    type: 'string',
                },
                {
                    name: 'Customer last name',
                    value: `steps_state.${node.id}.customer.lastname`,
                    nodeType: 'shopper_authentication',
                    type: 'string',
                },
                {
                    name: 'Customer full name',
                    value: `steps_state.${node.id}.customer.name`,
                    nodeType: 'shopper_authentication',
                    type: 'string',
                },
                {
                    name: 'Customer email',
                    value: `steps_state.${node.id}.customer.email`,
                    nodeType: 'shopper_authentication',
                    type: 'string',
                },
                {
                    name: 'Customer phone number',
                    value: `steps_state.${node.id}.customer.phone_number`,
                    nodeType: 'shopper_authentication',
                    type: 'string',
                },
                {
                    name: 'Customer tags',
                    value: `steps_state.${node.id}.customer.tags_stringified`,
                    nodeType: 'shopper_authentication',
                    type: 'string',
                },
            ],
        }
    } else if (node.type === 'http_request') {
        const {
            data: { name, variables },
        } = node

        return {
            nodeType: 'http_request',
            name: name || 'Request name',
            variables: variables
                .map((variable) => ({
                    name: variable.name || 'Name',
                    value: `steps_state.${node.id}.content.${variable.id}`,
                    nodeType: 'http_request' as const,
                    type: variable.data_type,
                    filter:
                        variable.data_type === 'date'
                            ? 'format_datetime'
                            : undefined,
                }))
                .concat([
                    {
                        name: 'HTTP request success',
                        nodeType: 'http_request',
                        value: `steps_state.${node.id}.success`,
                        type: 'boolean',
                        filter: undefined,
                    },
                    {
                        name: 'HTTP status code',
                        nodeType: 'http_request',
                        value: `steps_state.${node.id}.status_code`,
                        type: 'number',
                        filter: undefined,
                    },
                ]),
        }
    } else if (node.type === 'file_upload') {
        const {
            data: {
                content: { text },
            },
        } = node
        return {
            name: formatVariableName(text.length > 0 ? text : 'File upload'),
            value: `steps_state.${node.id}.attachments`,
            type: 'array',
            nodeType: 'file_upload',
        }
    } else if (node.type === 'cancel_order') {
        return {
            name: 'Cancel order success',
            nodeType: 'cancel_order',
            value: `steps_state.${node.id}.success`,
            type: 'boolean',
        }
    } else if (node.type === 'refund_order') {
        return {
            name: 'Refund order success',
            nodeType: 'refund_order',
            value: `steps_state.${node.id}.success`,
            type: 'boolean',
        }
    } else if (node.type === 'update_shipping_address') {
        return {
            name: 'Edit order shipping address success',
            nodeType: 'update_shipping_address',
            value: `steps_state.${node.id}.success`,
            type: 'boolean',
        }
    } else if (node.type === 'remove_item') {
        return {
            name: 'Remove item success',
            nodeType: 'remove_item',
            value: `steps_state.${node.id}.success`,
            type: 'boolean',
        }
    } else if (node.type === 'replace_item') {
        return {
            name: 'Replace item success',
            nodeType: 'replace_item',
            value: `steps_state.${node.id}.success`,
            type: 'boolean',
        }
    } else if (node.type === 'create_discount_code') {
        return {
            name: 'Create discount code success',
            nodeType: 'create_discount_code',
            value: `steps_state.${node.id}.success`,
            type: 'boolean',
        }
    } else if (node.type === 'reship_for_free') {
        return {
            name: 'Reship for free success',
            nodeType: 'reship_for_free',
            value: `steps_state.${node.id}.success`,
            type: 'boolean',
        }
    } else if (node.type === 'refund_shipping_costs') {
        return {
            name: 'Refund shipping costs success',
            nodeType: 'refund_shipping_costs',
            value: `steps_state.${node.id}.success`,
            type: 'boolean',
        }
    } else if (node.type === 'cancel_subscription') {
        return {
            name: 'Cancel subscription success',
            nodeType: 'cancel_subscription',
            value: `steps_state.${node.id}.success`,
            type: 'boolean',
        }
    } else if (node.type === 'skip_charge') {
        return {
            name: 'Skip next subscription shipment success',
            nodeType: 'skip_charge',
            value: `steps_state.${node.id}.success`,
            type: 'boolean',
        }
    } else if (node.type === 'edit_order_note') {
        return {
            name: 'Edit order note success',
            nodeType: 'edit_order_note',
            value: `steps_state.${node.id}.success`,
            type: 'boolean',
        }
    } else if (node.type === 'reusable_llm_prompt_call') {
        const configuration = steps.find(
            (step) =>
                step.internal_id === node.data.configuration_internal_id &&
                step.id === node.data.configuration_id,
        )

        if (!configuration) {
            return
        }

        const templateApp = configuration.apps?.[0]

        const app = apps.find((app) => {
            switch (templateApp?.type) {
                case 'shopify':
                case 'recharge':
                    return app.type === templateApp.type
                case 'app':
                    return (
                        app.type === templateApp.type &&
                        app.id === templateApp.app_id
                    )
                default:
                    return false
            }
        })

        const icon = <AppIcon icon={app?.icon} name={app?.name} />

        const outputs =
            configuration.triggers?.find(
                (
                    trigger,
                ): trigger is Extract<
                    NonNullable<WorkflowConfiguration['triggers']>[number],
                    { kind: 'reusable-llm-prompt' }
                > => trigger.kind === 'reusable-llm-prompt',
            )?.settings?.outputs ?? []

        if (outputs.length) {
            return {
                name: `${configuration.name} in ${app?.name}`,
                nodeType: 'reusable_llm_prompt_call',
                variables: [
                    {
                        name: `${configuration.name} in ${app?.name} success`,
                        nodeType: 'reusable_llm_prompt_call',
                        value: `steps_state.${node.id}.success`,
                        type: 'boolean',
                        icon,
                    },
                    ...outputs.map((output) => ({
                        name: output.name,
                        nodeType: 'reusable_llm_prompt_call' as const,
                        value: `steps_state.${node.id}.outputs.${output.id}`,
                        type: output.data_type || ('json' as const),
                        icon,
                    })),
                ],
                icon,
            }
        }

        return {
            name: `${configuration.name} in ${app?.name} success`,
            nodeType: 'reusable_llm_prompt_call',
            value: `steps_state.${node.id}.success`,
            type: 'boolean',
            icon,
        }
    } else if (node.type === 'liquid_template') {
        const {
            data: { name, output },
        } = node

        return {
            name: name || 'Liquid template',
            value: `steps_state.${node.id}.output.value`,
            nodeType: 'liquid_template',
            type: output.data_type,
            filter: output.data_type === 'date' ? 'format_datetime' : undefined,
        }
    }
}

export function getWorkflowVariableListForNode(
    g: VisualBuilderGraph,
    nodeId: string,
    steps: WorkflowConfiguration[],
    apps: App[],
    availableIntegrations: AvailableIntegrations = [],
) {
    const { nodes, edges } = g
    const ancestors: VisualBuilderNode[] = []
    let ptrNodeId = nodeId
    let incomingEdges: VisualBuilderEdge[] = []
    do {
        incomingEdges = edges.filter((e) => e.target === ptrNodeId)
        if (incomingEdges.length > 0) {
            // we assume only one incoming edge per node
            ptrNodeId = incomingEdges[0].source
            const node = nodes.find(({ id }) => id === ptrNodeId)
            if (!node) continue
            ancestors.push(node)
            incomingEdges = edges.filter((e) => e.target === ptrNodeId)
        }
    } while (incomingEdges.length > 0)

    const workflowVariableList: WorkflowVariableList = []

    const triggerVariable = buildWorkflowVariableFromTrigger(g)
    const appVariable = buildWorkflowVariableFromApp(g, apps)
    const integrationVariable = buildWorkflowVariableFromIntegration(
        availableIntegrations,
        apps,
    )

    if (triggerVariable) {
        if (Array.isArray(triggerVariable)) {
            workflowVariableList.push(...triggerVariable)
        } else {
            workflowVariableList.push(triggerVariable)
        }
    }

    if (appVariable) {
        if (Array.isArray(appVariable)) {
            workflowVariableList.push(...appVariable)
        } else {
            workflowVariableList.push(appVariable)
        }
    }

    if (integrationVariable) {
        workflowVariableList.push(...integrationVariable)
    }

    for (const ancestor of ancestors.reverse()) {
        const variable = buildWorkflowVariableFromNode(g, ancestor, steps, apps)
        if (variable) {
            if (Array.isArray(variable)) {
                workflowVariableList.push(...variable)
            } else {
                workflowVariableList.push(variable)
            }
        }
    }
    return workflowVariableList
}

export function extractVariablesFromNode(
    node: UnionPick<VisualBuilderNode, 'type' | 'data'> & { id?: string },
    edges?: VisualBuilderEdge[],
) {
    let variables: string[] = []

    switch (node.type) {
        case 'multiple_choices':
            variables = [
                ...extractVariablesFromText(node.data.content.text).map(
                    (variable) => variable.value,
                ),
                ..._flatten(
                    node.data.choices.map((choice) =>
                        extractVariablesFromText(choice.label).map(
                            (variable) => variable.value,
                        ),
                    ),
                ),
            ]
            break
        case 'automated_message':
        case 'text_reply':
        case 'file_upload':
        case 'order_selection':
            variables = extractVariablesFromText(node.data.content.text).map(
                (variable) => variable.value,
            )
            break
        case 'http_request':
            variables = [
                ...extractVariablesFromText(node.data.url).map(
                    (variable) => variable.value,
                ),
                ..._flatten(
                    node.data.headers.map((header) =>
                        extractVariablesFromText(header.value).map(
                            (variable) => variable.value,
                        ),
                    ),
                ),
                ...extractVariablesFromText(node.data.json ?? '').map(
                    (variable) => variable.value,
                ),
                ..._flatten(
                    node.data.formUrlencoded?.map((item) =>
                        extractVariablesFromText(item.value).map(
                            (variable) => variable.value,
                        ),
                    ),
                ),
            ]
            break
        case 'conditions': {
            variables =
                edges
                    ?.filter((e) => e.source === node.id)
                    .reduce<string[]>((acc, edge) => {
                        const conditions = edge.data?.conditions?.and
                            ? edge.data.conditions.and
                            : (edge.data?.conditions?.or ?? [])

                        for (const condition of conditions) {
                            const key = Object.keys(condition)[0] as AllKeys<
                                typeof condition
                            >
                            const schema = condition[key]

                            if (schema) {
                                acc.push(schema[0].var)
                            }
                        }
                        return acc
                    }, []) ?? []
            break
        }
        case 'llm_prompt_trigger':
            for (const condition of node.data.conditions) {
                const key = Object.keys(condition)[0] as AllKeys<
                    typeof condition
                >
                const schema = condition[key]

                if (schema) {
                    variables.push(schema[0].var)
                }
            }
            break
        case 'reusable_llm_prompt_call':
            variables = [
                ..._flatten(
                    Object.values(node.data.custom_inputs ?? {}).map((value) =>
                        extractVariablesFromText(value).map(
                            (variable) => variable.value,
                        ),
                    ),
                ),
            ]
            break
        case 'cancel_order':
        case 'refund_order':
        case 'refund_shipping_costs':
        case 'reship_for_free':
            variables = [
                ...extractVariablesFromText(node.data.customerId).map(
                    (variable) => variable.value,
                ),
                ...extractVariablesFromText(node.data.orderExternalId).map(
                    (variable) => variable.value,
                ),
            ]
            break
        case 'update_shipping_address':
            variables = [
                ...extractVariablesFromText(node.data.customerId).map(
                    (variable) => variable.value,
                ),
                ...extractVariablesFromText(node.data.orderExternalId).map(
                    (variable) => variable.value,
                ),
                ...extractVariablesFromText(node.data.name).map(
                    (variable) => variable.value,
                ),
                ...extractVariablesFromText(node.data.address1).map(
                    (variable) => variable.value,
                ),
                ...extractVariablesFromText(node.data.address2).map(
                    (variable) => variable.value,
                ),
                ...extractVariablesFromText(node.data.city).map(
                    (variable) => variable.value,
                ),
                ...extractVariablesFromText(node.data.zip).map(
                    (variable) => variable.value,
                ),
                ...extractVariablesFromText(node.data.province).map(
                    (variable) => variable.value,
                ),
                ...extractVariablesFromText(node.data.country).map(
                    (variable) => variable.value,
                ),
                ...extractVariablesFromText(node.data.phone).map(
                    (variable) => variable.value,
                ),
                ...extractVariablesFromText(node.data.lastName).map(
                    (variable) => variable.value,
                ),
                ...extractVariablesFromText(node.data.firstName).map(
                    (variable) => variable.value,
                ),
            ]
            break
        case 'cancel_subscription':
            variables = [
                ...extractVariablesFromText(node.data.customerId).map(
                    (variable) => variable.value,
                ),
                ...extractVariablesFromText(node.data.subscriptionId).map(
                    (variable) => variable.value,
                ),
                ...extractVariablesFromText(node.data.reason).map(
                    (variable) => variable.value,
                ),
            ]
            break
        case 'skip_charge':
            variables = [
                ...extractVariablesFromText(node.data.customerId).map(
                    (variable) => variable.value,
                ),
                ...extractVariablesFromText(node.data.subscriptionId).map(
                    (variable) => variable.value,
                ),
                ...extractVariablesFromText(node.data.chargeId).map(
                    (variable) => variable.value,
                ),
            ]
            break
        case 'remove_item':
            variables = [
                ...extractVariablesFromText(node.data.customerId).map(
                    (variable) => variable.value,
                ),
                ...extractVariablesFromText(node.data.orderExternalId).map(
                    (variable) => variable.value,
                ),
                ...extractVariablesFromText(node.data.productVariantId).map(
                    (variable) => variable.value,
                ),
                ...extractVariablesFromText(node.data.quantity).map(
                    (variable) => variable.value,
                ),
            ]
            break
        case 'replace_item':
            variables = [
                ...extractVariablesFromText(node.data.customerId).map(
                    (variable) => variable.value,
                ),
                ...extractVariablesFromText(node.data.orderExternalId).map(
                    (variable) => variable.value,
                ),
                ...extractVariablesFromText(node.data.productVariantId).map(
                    (variable) => variable.value,
                ),
                ...extractVariablesFromText(node.data.quantity).map(
                    (variable) => variable.value,
                ),
                ...extractVariablesFromText(
                    node.data.addedProductVariantId,
                ).map((variable) => variable.value),
                ...extractVariablesFromText(node.data.addedQuantity).map(
                    (variable) => variable.value,
                ),
            ]
            break
        case 'create_discount_code':
            variables = [
                ...extractVariablesFromText(node.data.amount).map(
                    (variable) => variable.value,
                ),
                ...extractVariablesFromText(node.data.discountType).map(
                    (variable) => variable.value,
                ),
                ...extractVariablesFromText(node.data.validFor).map(
                    (variable) => variable.value,
                ),
            ]
            break
        case 'edit_order_note':
            variables = [
                ...extractVariablesFromText(node.data.customerId).map(
                    (variable) => variable.value,
                ),
                ...extractVariablesFromText(node.data.orderExternalId).map(
                    (variable) => variable.value,
                ),
                ...extractVariablesFromText(node.data.integrationId).map(
                    (variable) => variable.value,
                ),
                ...extractVariablesFromText(node.data.note).map(
                    (variable) => variable.value,
                ),
            ]
            break
        case 'liquid_template':
            variables = extractVariablesFromText(node.data.template, true).map(
                (variable) => variable.value,
            )
            break
    }

    return variables
}

export function toLiquidSyntax(
    variable: { value: string; filter?: string },
    isLiquidTemplate: boolean = false,
) {
    if (isLiquidTemplate) {
        if (variable.filter) {
            return `[[${variable.value} | ${variable.filter}]]`
        }
        return `[[${variable.value}]]`
    }

    if (variable.filter) {
        return `{{${variable.value} | ${variable.filter}}}`
    }
    return `{{${variable.value}}}`
}

export function isValidLiquidSyntax(string: string) {
    try {
        templateEngine.parse(string)
        return true
    } catch {
        return false
    }
}

const urlEncodedVariableRegex = new RegExp('%7B%7B(.+?)(?=%7D%7D)%7D%7D', 'g')

export function unescapeUrlEncodedVariables(text: string) {
    return text.replace(urlEncodedVariableRegex, '{{$1}}')
}

export function validateJSONWithVariables(
    string: string,
    availableVariables: WorkflowVariableList,
) {
    return validateJSON(prerenderVariables(string, availableVariables))
}

export function prerenderVariables(
    string: string,
    availableVariables: WorkflowVariableList,
) {
    const context: Record<string, unknown> = {}

    try {
        const tpls = templateEngine.parse(string)

        for (const tpl of tpls) {
            if (tpl instanceof Output) {
                const propertyAccessToken: PropertyAccessToken = _get(tpl, [
                    'value',
                    'initial',
                    'postfix',
                    '0',
                ])
                const identifierTokens =
                    propertyAccessToken.props as IdentifierToken[]
                const props = identifierTokens.map((token) => token.content)

                const value = props.join('.')
                const variable = parseWorkflowVariable(
                    value,
                    availableVariables,
                )

                if (!variable) {
                    continue
                }

                switch (variable.type) {
                    case 'string':
                        _set(context, props, '')
                        break
                    case 'number':
                        _set(context, props, 0)
                        break
                    case 'date':
                        _set(context, props, new Date())
                        break
                    case 'boolean':
                        _set(context, props, true)
                        break
                    case 'array':
                        _set(context, props, [{ test: 'test' }])
                        break
                    case 'json':
                        _set(context, props, {})
                        break
                }
            }
        }

        return templateEngine.renderSync(tpls, context) as string
    } catch {
        return string
    }
}
