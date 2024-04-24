import {Liquid, Output} from 'liquidjs'
import _flatten from 'lodash/flatten'
import _set from 'lodash/set'
import _get from 'lodash/get'

import {PropertyAccessToken, IdentifierToken} from 'liquidjs/dist/src/tokens'
import {validateJSON} from '../../../../utils'
import {
    WorkflowVariableList,
    WorkflowVariable,
    WorkflowVariableGroup,
} from './variables.types'
import {
    VisualBuilderEdge,
    VisualBuilderGraph,
    VisualBuilderNode,
} from './visualBuilderGraph.types'
import {LanguageCode} from './workflowConfiguration.types'

type GraphVariablesValidationResult = {
    error: string
    lang: LanguageCode
} | null

const templateEngine = new Liquid({
    timezoneOffset: 0,
    dateFormat: '%Y-%m-%dT%H:%M:%S.%LZ',
})

// any text starting with {{ and ending with }} will be interpreted as a variable by the API template engine
export const workflowVariableRegex = /{{[^{}]*}}/g
export function extractVariablesFromText(text: string): {
    value: string
    filter?: string
}[] {
    const match = text.match(workflowVariableRegex)
    if (match) {
        return match.map((variable) => {
            const [value, filter] = variable
                .slice(2, -2)
                .trim()
                .split(/\s*\|\s*/)

            return {
                value,
                filter,
            }
        })
    }
    return []
}

export function findVariable(
    variables: WorkflowVariableList,
    fn: (
        v: WorkflowVariable | WorkflowVariableGroup
    ) => WorkflowVariable | undefined
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
        v: WorkflowVariable | WorkflowVariableGroup
    ) => WorkflowVariable | undefined
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

export function parseWorkflowVariable(
    value: string,
    availableVariables: WorkflowVariableList
): WorkflowVariable | null {
    const variable = findVariable(availableVariables, (v) => {
        if ('value' in v && v.value === value) {
            return v
        }
    })

    if (!variable) return null

    return variable
}

export const buildWorkflowVariableFromNode = (
    node: VisualBuilderNode
): WorkflowVariable | WorkflowVariableGroup | undefined => {
    const formatVariableName = (text: string) =>
        text.replace(workflowVariableRegex, '{...}')

    if (node.type === 'text_reply') {
        const {
            data: {
                content: {text},
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
                content: {text},
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
                content: {text},
            },
        } = node
        return {
            nodeType: 'order_selection',
            name: formatVariableName(
                text.length > 0 ? text : 'Order selection'
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
                },
                {
                    name: 'Payment status',
                    value: `steps_state.${node.id}.order.external_payment_status`,
                    nodeType: 'order_selection',
                    type: 'string',
                },
                {
                    name: 'Order status',
                    value: `steps_state.${node.id}.order.external_status`,
                    nodeType: 'order_selection',
                    type: 'string',
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
                    name: 'Order number',
                    value: `steps_state.${node.id}.order.name`,
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
            ],
        }
    } else if (node.type === 'http_request') {
        const {
            data: {name, variables},
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
                content: {text},
            },
        } = node
        return {
            name: formatVariableName(text.length > 0 ? text : 'File upload'),
            value: `steps_state.${node.id}.attachments`,
            type: 'array',
            nodeType: 'file_upload',
        }
    }
}

export function getWorkflowVariableListForNode(
    g: VisualBuilderGraph,
    nodeId: string
) {
    const {nodes, edges} = g
    const ancestors: VisualBuilderNode[] = []
    let ptrNodeId = nodeId
    let incomingEdges: VisualBuilderEdge[] = []
    do {
        incomingEdges = edges.filter((e) => e.target === ptrNodeId)
        if (incomingEdges.length > 0) {
            // we assume only one incoming edge per node
            ptrNodeId = incomingEdges[0].source
            ancestors.push(nodes.find(({id}) => id === ptrNodeId)!)
            incomingEdges = edges.filter((e) => e.target === ptrNodeId)
        }
    } while (incomingEdges.length > 0)

    const workflowVariableList: WorkflowVariableList = []

    for (const ancestor of ancestors.reverse()) {
        const variable = buildWorkflowVariableFromNode(ancestor)
        if (variable) {
            workflowVariableList.push(variable)
        }
    }
    return workflowVariableList
}

export function extractVariablesFromNode(
    node: UnionPick<VisualBuilderNode, 'type' | 'data'> & {id?: string},
    edges?: VisualBuilderEdge[]
) {
    let variables: string[] = []

    switch (node.type) {
        case 'automated_message':
        case 'multiple_choices':
        case 'text_reply':
        case 'file_upload':
        case 'order_selection':
            variables = extractVariablesFromText(node.data.content.text).map(
                (variable) => variable.value
            )
            break
        case 'http_request':
            variables = [
                ...extractVariablesFromText(node.data.url).map(
                    (variable) => variable.value
                ),
                ..._flatten(
                    node.data.headers.map((header) =>
                        extractVariablesFromText(header.value).map(
                            (variable) => variable.value
                        )
                    )
                ),
                ...extractVariablesFromText(node.data.json ?? '').map(
                    (variable) => variable.value
                ),
                ..._flatten(
                    node.data.formUrlencoded?.map((item) =>
                        extractVariablesFromText(item.value).map(
                            (variable) => variable.value
                        )
                    )
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
                            : edge.data?.conditions?.or ?? []

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
    }

    return variables
}

export function toLiquidSyntax(variable: {value: string; filter?: string}) {
    if (variable.filter) {
        return `{{${variable.value} | ${variable.filter}}}`
    }
    return `{{${variable.value}}}`
}

export function hasNodesWithInvalidVariables(g: VisualBuilderGraph) {
    return g.nodes.some((node) => {
        const availableVariablesForNode = getWorkflowVariableListForNode(
            g,
            node.id
        )
        const variables = extractVariablesFromNode(node)
        return variables.some(
            (variable) =>
                parseWorkflowVariable(variable, availableVariablesForNode) ===
                null
        )
    })
}

export function hasNodesWithInvalidLiquidSyntax(g: VisualBuilderGraph) {
    return g.nodes.some((node) => !isValidLiquidSyntaxInNode(node))
}

export function checkGraphVariablesValidity(
    g: VisualBuilderGraph,
    translateGraph: (
        g: VisualBuilderGraph,
        lang: LanguageCode
    ) => VisualBuilderGraph
): GraphVariablesValidationResult {
    if (!g.available_languages.length) return null

    let validationResult: GraphVariablesValidationResult = null

    for (const lang of g.available_languages) {
        const translatedGraph = translateGraph(g, lang)

        if (hasNodesWithInvalidVariables(translatedGraph)) {
            validationResult = {
                error: 'Remove unavailable variables in order to save',
                lang,
            }
            break
        } else if (hasNodesWithInvalidLiquidSyntax(translatedGraph)) {
            validationResult = {
                error: 'Remove variable errors in order to save.',
                lang,
            }
            break
        }
    }
    return validationResult
}

function isValidLiquidSyntax(string: string) {
    try {
        templateEngine.parse(string)
        return true
    } catch {
        return false
    }
}

export function isValidLiquidSyntaxInNode(
    node: UnionPick<VisualBuilderNode, 'type' | 'data'>
) {
    switch (node.type) {
        case 'automated_message':
        case 'multiple_choices':
        case 'text_reply':
        case 'file_upload':
        case 'order_selection':
            return (
                isValidLiquidSyntax(node.data.content.text) &&
                isValidLiquidSyntax(node.data.content.html)
            )
        case 'http_request':
            return (
                isValidLiquidSyntax(node.data.url) &&
                node.data.headers.every((header) =>
                    isValidLiquidSyntax(header.value)
                ) &&
                isValidLiquidSyntax(node.data.json ?? '') &&
                (node.data.formUrlencoded ?? []).every((item) =>
                    isValidLiquidSyntax(item.value)
                )
            )
        default:
            return true
    }
}

const urlEncodedVariableRegex = new RegExp('%7B%7B(.+?)(?=%7D%7D)%7D%7D', 'g')

export function unescapeUrlEncodedVariables(text: string) {
    return text.replace(urlEncodedVariableRegex, '{{$1}}')
}

export function validateJSONWithVariables(
    string: string,
    availableVariables: WorkflowVariableList
) {
    return validateJSON(prerenderVariables(string, availableVariables))
}

function prerenderVariables(
    string: string,
    availableVariables: WorkflowVariableList
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
                    availableVariables
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
                        _set(context, props, [{test: 'test'}])
                        break
                }
            }
        }

        return templateEngine.renderSync(tpls, context) as string
    } catch {
        return string
    }
}
