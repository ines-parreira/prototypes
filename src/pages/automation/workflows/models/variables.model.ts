import {Liquid} from 'liquidjs'
import {
    FlowVariableList,
    FlowVariable,
    FlowVariableGroup,
} from './variables.types'
import {
    VisualBuilderEdge,
    VisualBuilderGraph,
    VisualBuilderNode,
} from './visualBuilderGraph.types'
import {LanguageCode, MessageContent} from './workflowConfiguration.types'

type GraphVariablesValidationResult = {
    error: string
    lang: LanguageCode
} | null

// DraftJS encodes double quotes in variables as HTML entities, we need to decode those back
const encodedQuotesInVariablesRegex = new RegExp(
    '({{[^{}]*)' + // match the opening {{ and everything except opening or ending curly bracket (we stay in the variable)
        '&quot;' + // a html encoded double quote, at this point it must be inside variable delimiters
        '([^{}]*}})', // everything remaining until the closing }}
    'g'
)

const templateEngine = new Liquid()

// any text starting with {{ and ending with }} will be interpreted as a variable by the API template engine
export const flowVariableRegex = /{{[^{}]*}}/g
export function extractVariablesFromText(text: string): string[] {
    const match = text.match(flowVariableRegex)
    if (match) {
        return match
    }
    return []
}

export function findVariable(
    variables: FlowVariableList,
    fn: (v: FlowVariable | FlowVariableGroup) => FlowVariable | undefined
): FlowVariable | undefined {
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
export function parseFlowVariable(
    value: string,
    availableVariables: FlowVariableList
): FlowVariable {
    const variable = findVariable(availableVariables, (v) => {
        if ('value' in v && v.value === value) {
            return v
        }
    })

    return variable ?? {isInvalid: true, value, name: 'variable unavailable'}
}

export const buildFlowVariableFromNode = (
    node: VisualBuilderNode
): FlowVariable | FlowVariableGroup | undefined => {
    const formatVariableName = (text: string) =>
        text.replace(flowVariableRegex, '{...}')

    if (node.type === 'text_reply') {
        const {
            data: {
                content: {text},
                wfConfigurationRef: {wfConfigurationTextInputStepId},
            },
        } = node
        return {
            name: formatVariableName(text.length > 0 ? text : 'Message'),
            value: `{{steps_state["${wfConfigurationTextInputStepId}"].content.text}}`,
            nodeType: 'text_reply',
        }
    } else if (node.type === 'multiple_choices') {
        const {
            data: {
                content: {text},
                wfConfigurationRef: {wfConfigurationChoicesStepId},
            },
        } = node
        return {
            name: formatVariableName(text.length > 0 ? text : 'Question'),
            value: `{{steps_state["${wfConfigurationChoicesStepId}"].selected_choice.label}}`,
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
                    name: 'Customer first name',
                    value: '{{customer.firstname}}',
                },
                {
                    name: 'Customer last name',
                    value: '{{customer.lastname}}',
                },
                {
                    name: 'Customer full name',
                    value: '{{customer.name}}',
                },
                {
                    name: 'Customer email',
                    value: '{{customer.email}}',
                },
                {
                    name: 'Customer phone number',
                    value: '{{customer.phone_number}}',
                },
                {
                    name: 'Order number',
                    value: '{{order.name}}',
                },
                {
                    name: 'Order total amount',
                    value: '{{order.total_amount | format_currency: order.currency.code, order.currency.decimals}}',
                },
                {
                    name: 'Order date',
                    value: '{{order.created_datetime | format_datetime}}',
                },
            ],
        }
    }
}

export function getAvailableFlowVariableListForNode(
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

    const availableFlowVariableList: FlowVariableList = []

    for (const ancestor of ancestors.reverse()) {
        const availableNode = buildFlowVariableFromNode(ancestor)
        if (availableNode) {
            availableFlowVariableList.push(availableNode)
        }
    }
    return availableFlowVariableList
}

export function hasNodesWithInvalidVariables(g: VisualBuilderGraph) {
    return g.nodes.some((node) => {
        const availableVariablesForNode = getAvailableFlowVariableListForNode(
            g,
            node.id
        )
        if ('content' in node.data) {
            const variables = extractVariablesFromText(node.data.content.text)
            if (variables.length === 0) return false
            const invalidVariables = variables.some(
                (variable) =>
                    parseFlowVariable(variable, availableVariablesForNode)
                        .isInvalid
            )
            return invalidVariables
        }
        return false
    })
}

export function hasNodesWithInvalidLiquidSyntax(g: VisualBuilderGraph) {
    return g.nodes.some((node) =>
        'content' in node.data
            ? isValidLiquidSyntaxInNode(node.data.content) === false
            : false
    )
}

export function checkGraphVariablesValidity(
    g: VisualBuilderGraph,
    translateGraph: (
        g: VisualBuilderGraph,
        lang: LanguageCode
    ) => VisualBuilderGraph
): GraphVariablesValidationResult {
    if (!g.available_languages?.length) return null

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

export function isValidLiquidSyntaxInNode(content: MessageContent) {
    try {
        templateEngine.parse(content.text)
        templateEngine.parse(content.html)
        return true
    } catch (e) {
        return false
    }
}

export function decodeVariablesQuotes(text: string): string {
    // recall capture groups as $1 and $2
    const cleanText = text.replace(encodedQuotesInVariablesRegex, '$1"$2')
    return cleanText !== text ? decodeVariablesQuotes(cleanText) : cleanText
}
