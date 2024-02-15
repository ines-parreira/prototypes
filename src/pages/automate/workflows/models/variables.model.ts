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

const templateEngine = new Liquid()

// any text starting with {{ and ending with }} will be interpreted as a variable by the API template engine
export const workflowVariableRegex = /{{[^{}]*}}/g
function extractVariablesFromText(text: string): string[] {
    const match = text.match(workflowVariableRegex)
    if (match) {
        return match
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
export function parseWorkflowVariable(
    value: string,
    availableVariables: WorkflowVariableList
): WorkflowVariable {
    const variable = findVariable(availableVariables, (v) => {
        if ('value' in v && v.value === value) {
            return v
        }
    })

    return variable ?? {isInvalid: true, value, name: 'variable unavailable'}
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
            name: formatVariableName(text.length > 0 ? text : 'Message'),
            value: `{{steps_state.${node.id}.content.text}}`,
            nodeType: 'text_reply',
        }
    } else if (node.type === 'multiple_choices') {
        const {
            data: {
                content: {text},
            },
        } = node
        return {
            name: formatVariableName(text.length > 0 ? text : 'Question'),
            value: `{{steps_state.${node.id}.selected_choice.label}}`,
            nodeType: 'multiple_choices',
        }
    } else if (node.type === 'order_selection') {
        const {
            data: {
                content: {text},
            },
        } = node
        return {
            nodeType: 'order_selection',
            name: formatVariableName(text.length > 0 ? text : 'Message'),
            variables: [
                {
                    name: 'Order number',
                    value: '{{order.name}}',
                    nodeType: 'order_selection',
                },
                {
                    name: 'Order total amount',
                    value: '{{order.total_amount | format_currency: order.currency.code, order.currency.decimals}}',
                    nodeType: 'order_selection',
                },
                {
                    name: 'Order date',
                    value: '{{order.created_datetime | format_datetime}}',
                    nodeType: 'order_selection',
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
                    value: '{{customer.firstname}}',
                    nodeType: 'shopper_authentication',
                },
                {
                    name: 'Customer last name',
                    value: '{{customer.lastname}}',
                    nodeType: 'shopper_authentication',
                },
                {
                    name: 'Customer full name',
                    value: '{{customer.name}}',
                    nodeType: 'shopper_authentication',
                },
                {
                    name: 'Customer email',
                    value: '{{customer.email}}',
                    nodeType: 'shopper_authentication',
                },
                {
                    name: 'Customer phone number',
                    value: '{{customer.phone_number}}',
                    nodeType: 'shopper_authentication',
                },
            ],
        }
    } else if (node.type === 'http_request' && node.data.variables.length) {
        const {
            data: {name, variables},
        } = node
        return {
            nodeType: 'http_request',
            name: formatVariableName(name.length > 0 ? name : 'Request name'),
            variables: variables.map((variable) => ({
                name: variable.name,
                value: `{{steps_state.${node.id}.content.${variable.id}}}`,
                nodeType: 'http_request',
            })),
        }
    } else if (node.type === 'file_upload') {
        const {
            data: {
                content: {text},
            },
        } = node
        return {
            name: formatVariableName(text.length > 0 ? text : 'Message'),
            value: `{{steps_state.${node.id}.attachments | json}}`,
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
    node: UnionPick<VisualBuilderNode, 'type' | 'data'>
) {
    let variables: string[] = []

    switch (node.type) {
        case 'automated_message':
        case 'multiple_choices':
        case 'text_reply':
        case 'file_upload':
        case 'order_selection':
            variables = extractVariablesFromText(node.data.content.text)
            break
        case 'http_request':
            variables = [
                ...extractVariablesFromText(node.data.url),
                ..._flatten(
                    node.data.headers.map((header) =>
                        extractVariablesFromText(header.value)
                    )
                ),
                ...extractVariablesFromText(node.data.json ?? ''),
                ..._flatten(
                    node.data.formUrlencoded?.map((item) =>
                        extractVariablesFromText(item.value)
                    )
                ),
            ]
    }

    return variables
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
                parseWorkflowVariable(variable, availableVariablesForNode)
                    .isInvalid
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

export function validateJSONWithVariables(string: string) {
    return validateJSON(prerenderVariables(string))
}

function prerenderVariables(string: string) {
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

                if (
                    props.length === 3 &&
                    props[props.length - 1] === 'attachments'
                ) {
                    _set(context, props, [])
                } else {
                    _set(context, props, '')
                }
            }
        }

        return templateEngine.renderSync(tpls, context) as string
    } catch {
        return string
    }
}
