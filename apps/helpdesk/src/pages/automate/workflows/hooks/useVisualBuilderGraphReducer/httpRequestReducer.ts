import { produce } from 'immer'
import { ulid } from 'ulidx'

import { buildConditionSchemaByVariableType } from '../../editor/visualBuilder/editors/ConditionsNodeEditor/utils'
import type { ConditionSchema } from '../../models/conditions.types'
import {
    extractVariablesFromText,
    getWorkflowVariableListForNode,
    toLiquidSyntax,
} from '../../models/variables.model'
import {
    buildEdgeCommonProperties,
    cleanConditionsFromEmptyVariables,
    walkVisualBuilderGraph,
} from '../../models/visualBuilderGraph.model'
import type {
    HttpRequestNodeType,
    VisualBuilderEdge,
    VisualBuilderGraph,
} from '../../models/visualBuilderGraph.types'
import {
    buildEndNode,
    buildHttpRequestNode,
    computeNodesPositions,
    getFallibleNodeSuccessConditions,
} from './utils'

export type VisualBuilderHttpRequestAction =
    | {
          type: 'INSERT_HTTP_REQUEST_NODE'
          beforeNodeId: string
      }
    | {
          type: 'SET_HTTP_REQUEST_NAME'
          httpRequestNodeId: string
          name: string
      }
    | {
          type: 'SET_HTTP_REQUEST_URL'
          httpRequestNodeId: string
          url: string
      }
    | {
          type: 'SET_HTTP_REQUEST_METHOD'
          httpRequestNodeId: string
          method: HttpRequestNodeType['data']['method']
      }
    | {
          type: 'SET_HTTP_REQUEST_HEADER'
          httpRequestNodeId: string
          index: number
          header: HttpRequestNodeType['data']['headers'][number]
      }
    | {
          type: 'ADD_HTTP_REQUEST_HEADER'
          httpRequestNodeId: string
      }
    | {
          type: 'DELETE_HTTP_REQUEST_HEADER'
          httpRequestNodeId: string
          index: number
      }
    | {
          type: 'TOGGLE_OAUTH2_SETTINGS'
          httpRequestNodeId: string
      }
    | {
          type: 'TOGGLE_TRACKSTAR_AUTH_SETTINGS'
          httpRequestNodeId: string
      }
    | {
          type: 'SET_HTTP_REQUEST_BODY_CONTENT_TYPE'
          httpRequestNodeId: string
          bodyContentType: NonNullable<
              HttpRequestNodeType['data']['bodyContentType']
          >
      }
    | {
          type: 'SET_HTTP_REQUEST_JSON'
          httpRequestNodeId: string
          json: string
      }
    | {
          type: 'SET_HTTP_REQUEST_FORM_URLENCODED_ITEM'
          httpRequestNodeId: string
          index: number
          item: NonNullable<
              HttpRequestNodeType['data']['formUrlencoded']
          >[number]
      }
    | {
          type: 'ADD_HTTP_REQUEST_FORM_URLENCODED_ITEM'
          httpRequestNodeId: string
      }
    | {
          type: 'DELETE_HTTP_REQUEST_FORM_URLENCODED_ITEM'
          httpRequestNodeId: string
          index: number
      }
    | {
          type: 'SET_HTTP_REQUEST_VARIABLE'
          httpRequestNodeId: string
          index: number
          variable: HttpRequestNodeType['data']['variables'][number]
      }
    | {
          type: 'ADD_HTTP_REQUEST_VARIABLE'
          httpRequestNodeId: string
      }
    | {
          type: 'DELETE_HTTP_REQUEST_VARIABLE'
          httpRequestNodeId: string
          index: number
      }
    | {
          type: 'SET_HTTP_REQUEST_TEST_REQUEST_RESULT'
          httpRequestNodeId: string
          result: NonNullable<HttpRequestNodeType['data']['testRequestResult']>
      }
    | {
          type: 'RESET_HTTP_REQUEST_TEST_REQUEST_RESULT'
          httpRequestNodeId: string
      }
    | {
          type: 'SET_HTTP_REQUEST_TEST_REQUEST_INPUTS'
          httpRequestNodeId: string
          inputs: Record<string, string>
          refreshToken?: string
      }
    | {
          type: 'ADD_HTTP_REQUEST_OUTPUT'
          httpRequestNodeId: string
          variableId: string
      }
    | {
          type: 'SET_HTTP_REQUEST_OUTPUT'
          httpRequestNodeId: string
          index: number
          output: NonNullable<HttpRequestNodeType['data']['outputs']>[number]
      }
    | {
          type: 'DELETE_HTTP_REQUEST_OUTPUT'
          httpRequestNodeId: string
          index: number
      }
    | {
          type: 'TOGGLE_SERVICE_CONNECTION_SETTINGS'
          httpRequestNodeId: string
      }
    | {
          type: 'SET_HTTP_REQUEST_SERVICE_CONNECTION_PATH'
          httpRequestNodeId: string
          path: string
      }

// bridge between type system and runtime
// allow to keep a type safe list of all action types for this reducer
type ActionTypes = {
    [K in VisualBuilderHttpRequestAction['type']]: true
}
const visualBuilderHttpRequestActionTypes: ActionTypes = {
    INSERT_HTTP_REQUEST_NODE: true,
    SET_HTTP_REQUEST_NAME: true,
    SET_HTTP_REQUEST_URL: true,
    SET_HTTP_REQUEST_METHOD: true,
    SET_HTTP_REQUEST_HEADER: true,
    ADD_HTTP_REQUEST_HEADER: true,
    DELETE_HTTP_REQUEST_HEADER: true,
    SET_HTTP_REQUEST_BODY_CONTENT_TYPE: true,
    SET_HTTP_REQUEST_JSON: true,
    SET_HTTP_REQUEST_FORM_URLENCODED_ITEM: true,
    ADD_HTTP_REQUEST_FORM_URLENCODED_ITEM: true,
    DELETE_HTTP_REQUEST_FORM_URLENCODED_ITEM: true,
    SET_HTTP_REQUEST_VARIABLE: true,
    ADD_HTTP_REQUEST_VARIABLE: true,
    DELETE_HTTP_REQUEST_VARIABLE: true,
    SET_HTTP_REQUEST_TEST_REQUEST_RESULT: true,
    RESET_HTTP_REQUEST_TEST_REQUEST_RESULT: true,
    SET_HTTP_REQUEST_TEST_REQUEST_INPUTS: true,
    ADD_HTTP_REQUEST_OUTPUT: true,
    SET_HTTP_REQUEST_OUTPUT: true,
    DELETE_HTTP_REQUEST_OUTPUT: true,
    TOGGLE_OAUTH2_SETTINGS: true,
    TOGGLE_TRACKSTAR_AUTH_SETTINGS: true,
    TOGGLE_SERVICE_CONNECTION_SETTINGS: true,
    SET_HTTP_REQUEST_SERVICE_CONNECTION_PATH: true,
}

export function isVisualBuilderHttpRequestAction(action: {
    type: string
}): action is VisualBuilderHttpRequestAction {
    return Object.keys(visualBuilderHttpRequestActionTypes).includes(
        action.type,
    )
}

export function httpRequestReducer(
    graph: VisualBuilderGraph,
    action: VisualBuilderHttpRequestAction,
): VisualBuilderGraph {
    switch (action.type) {
        case 'INSERT_HTTP_REQUEST_NODE':
            return computeNodesPositions(
                insertHttpRequest(graph, action.beforeNodeId),
            )
        case 'SET_HTTP_REQUEST_NAME':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request',
                )
                if (node) {
                    node.data.name = action.name
                }
            })
        case 'SET_HTTP_REQUEST_URL':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request',
                )
                if (node) {
                    node.data.url = action.url
                }
            })
        case 'SET_HTTP_REQUEST_METHOD':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request',
                )
                if (node) {
                    node.data.method = action.method

                    if (action.method === 'GET') {
                        node.data.json = null
                        node.data.formUrlencoded = null
                        node.data.bodyContentType = null
                    } else {
                        if (!node.data.bodyContentType) {
                            node.data.bodyContentType = 'application/json'
                            node.data.json = '{}'
                        }
                    }
                }
            })
        case 'SET_HTTP_REQUEST_HEADER':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request',
                )
                if (node && node.data.headers[action.index]) {
                    node.data.headers[action.index] = action.header
                }
            })
        case 'ADD_HTTP_REQUEST_HEADER':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request',
                )
                if (node) {
                    node.data.headers.push({ name: '', value: '' })
                }
            })
        case 'DELETE_HTTP_REQUEST_HEADER':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request',
                )
                if (node && node.data.headers[action.index]) {
                    node.data.headers.splice(action.index, 1)
                }
            })
        case 'TOGGLE_OAUTH2_SETTINGS':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request',
                )
                if (node) {
                    if (
                        node.data.oauth2TokenSettings === null &&
                        graph.apps?.[0]?.type === 'app'
                    ) {
                        node.data.oauth2TokenSettings = {
                            account_oauth2_token_id: `{{apps.${graph.apps[0].app_id}.account_oauth2_token_id}}`,
                            refresh_token_url: `{{apps.${graph.apps[0].app_id}.refresh_token_url}}`,
                        }
                    } else {
                        node.data.oauth2TokenSettings = null
                    }
                }
            })
        case 'TOGGLE_TRACKSTAR_AUTH_SETTINGS':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request',
                )
                if (node) {
                    if (
                        node.data.trackstar_integration_name === null &&
                        graph.apps?.[0]?.type === 'app'
                    ) {
                        node.data.trackstar_integration_name = `{{apps.${graph.apps[0].app_id}.trackstar_integration_name}}`
                    } else {
                        node.data.trackstar_integration_name = null
                    }
                }
            })
        case 'SET_HTTP_REQUEST_BODY_CONTENT_TYPE':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request',
                )
                if (node) {
                    node.data.bodyContentType = action.bodyContentType

                    switch (action.bodyContentType) {
                        case 'application/json':
                            node.data.json = '{}'
                            node.data.formUrlencoded = null
                            break
                        case 'application/x-www-form-urlencoded':
                            node.data.formUrlencoded = []
                            node.data.json = null
                            break
                    }
                }
            })
        case 'SET_HTTP_REQUEST_JSON':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request',
                )
                if (node) {
                    node.data.json = action.json
                }
            })
        case 'SET_HTTP_REQUEST_FORM_URLENCODED_ITEM':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request',
                )
                if (node && node.data.formUrlencoded?.[action.index]) {
                    node.data.formUrlencoded[action.index] = action.item
                }
            })
        case 'ADD_HTTP_REQUEST_FORM_URLENCODED_ITEM':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request',
                )
                if (node) {
                    node.data.formUrlencoded ??= []
                    node.data.formUrlencoded.push({ key: '', value: '' })
                }
            })
        case 'DELETE_HTTP_REQUEST_FORM_URLENCODED_ITEM':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request',
                )
                if (node && node.data.formUrlencoded?.[action.index]) {
                    node.data.formUrlencoded.splice(action.index, 1)
                }
            })
        case 'SET_HTTP_REQUEST_VARIABLE':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request',
                )
                if (node && node.data.variables[action.index]) {
                    node.data.variables[action.index] = action.variable
                    rebuildGraphForVariableChange(
                        draft,
                        node.id,
                        action.variable,
                    )
                }
            })
        case 'ADD_HTTP_REQUEST_VARIABLE':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request',
                )
                if (node) {
                    node.data.variables.push({
                        id: ulid(),
                        name: '',
                        jsonpath: '',
                        data_type: 'string',
                    })
                }
            })
        case 'DELETE_HTTP_REQUEST_VARIABLE':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request',
                )
                if (node && node.data.variables[action.index]) {
                    const variable = node.data.variables[action.index]

                    node.data.variables.splice(action.index, 1)

                    draft.edges.forEach((edge) => {
                        if (edge.data?.conditions) {
                            edge.data.conditions =
                                cleanConditionsFromEmptyVariables(
                                    edge.data.conditions,
                                    getWorkflowVariableListForNode(
                                        draft,
                                        edge.target,
                                        [],
                                        [],
                                    ),
                                )
                        }
                    })

                    if (node.data.outputs) {
                        const index = node.data.outputs.findIndex(
                            (output) =>
                                output.path ===
                                `steps_state.${node.id}.content.${variable.id}`,
                        )

                        if (index !== -1) {
                            node.data.outputs.splice(index, 1)
                        }
                    }
                }
            })
        case 'SET_HTTP_REQUEST_TEST_REQUEST_RESULT':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request',
                )
                if (node) {
                    node.data.testRequestResult = action.result
                }
            })
        case 'SET_HTTP_REQUEST_TEST_REQUEST_INPUTS':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request',
                )
                if (node) {
                    node.data.testRequestInputs = action.inputs
                    if (action.refreshToken !== undefined) {
                        node.data.testRequestRefreshToken = action.refreshToken
                    }
                }
            })
        case 'RESET_HTTP_REQUEST_TEST_REQUEST_RESULT':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request',
                )
                if (node) {
                    delete node.data.testRequestResult
                    // Don't delete the inputs - we want to preserve them for retesting
                }
            })
        case 'ADD_HTTP_REQUEST_OUTPUT':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request',
                )

                if (node) {
                    node.data.outputs ??= []
                    node.data.outputs.push({
                        id: ulid(),
                        path: `steps_state.${node.id}.content.${action.variableId}`,
                        description: '',
                    })
                }
            })
        case 'SET_HTTP_REQUEST_OUTPUT':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request',
                )

                if (node && node.data.outputs?.[action.index]) {
                    node.data.outputs[action.index] = action.output
                }
            })
        case 'DELETE_HTTP_REQUEST_OUTPUT':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request',
                )

                if (node) {
                    node.data.outputs?.splice(action.index, 1)
                }
            })
        case 'TOGGLE_SERVICE_CONNECTION_SETTINGS':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request',
                )
                if (!node) return

                const appType = graph.apps?.[0]?.type

                if (node.data.serviceConnectionSettings) {
                    node.data.serviceConnectionSettings = null
                } else if (appType === 'shopify' || appType === 'recharge') {
                    const integrationId =
                        appType === 'shopify'
                            ? '{{store.helpdesk_integration_id}}'
                            : '{{apps.recharge.integration_id}}'

                    node.data.url = ''
                    node.data.serviceConnectionSettings = {
                        integration_id: integrationId,
                        path: '',
                    }
                }
            })
        case 'SET_HTTP_REQUEST_SERVICE_CONNECTION_PATH':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request',
                )

                if (node?.data.serviceConnectionSettings) {
                    node.data.serviceConnectionSettings.path = action.path
                }
            })
    }
}

function rebuildCondition(
    edge: VisualBuilderEdge,
    variable: HttpRequestNodeType['data']['variables'][number],
) {
    if (!edge.data?.conditions) return []

    const changeConditionBasedOnVariableType = (condition: ConditionSchema) => {
        const operator = Object.keys(condition)[0] as AllKeys<typeof condition>
        const schema = condition[operator]
        if (!schema) return condition

        if (schema[0].var && schema[0].var.includes(variable.id)) {
            const varSchema = schema[0]
            const conditionSchema = buildConditionSchemaByVariableType(
                variable.data_type,
                varSchema.var,
            )

            return conditionSchema
        }
        return condition
    }

    const conditions =
        edge.data?.conditions?.and ?? edge.data?.conditions?.or ?? []
    const nextConditions = conditions.map(changeConditionBasedOnVariableType)
    return nextConditions
}

function replaceVariablesInHttpRequestHeaders(
    currentNodeId: string,
    newLiquidSyntax: string,
    node: HttpRequestNodeType,
    variable: HttpRequestNodeType['data']['variables'][number],
) {
    node.data.headers.forEach((header) => {
        const variablesInHeader = extractVariablesFromText(header.value)
        const oldVariable = variablesInHeader.find(
            ({ value }) =>
                `steps_state.${currentNodeId}.content.${variable.id}` === value,
        )
        if (!oldVariable) return
        const oldLiquidSyntax = toLiquidSyntax({
            value: oldVariable.value,
            filter: oldVariable.filter,
        })
        header.value = header.value.replace(oldLiquidSyntax, newLiquidSyntax)
    })
}

function replaceVariablesInHttpRequestUrl(
    currentNodeId: string,
    newLiquidSyntax: string,
    node: HttpRequestNodeType,
    variable: HttpRequestNodeType['data']['variables'][number],
) {
    const variablesInUrlText = extractVariablesFromText(node.data.url)
    const oldVariable = variablesInUrlText.find(
        ({ value }) =>
            `steps_state.${currentNodeId}.content.${variable.id}` === value,
    )
    if (!oldVariable) return
    const oldLiquidSyntax = toLiquidSyntax({
        value: oldVariable.value,
        filter: oldVariable.filter,
    })
    node.data.url = node.data.url.replace(oldLiquidSyntax, newLiquidSyntax)
}

function requestVaraiblesInHttpRequestUrlEncoded(
    currentNodeId: string,
    newLiquidSyntax: string,
    node: HttpRequestNodeType,
    variable: HttpRequestNodeType['data']['variables'][number],
) {
    node.data.formUrlencoded?.forEach((item) => {
        const oldVariable = extractVariablesFromText(item.value).find(
            ({ value }) =>
                `steps_state.${currentNodeId}.content.${variable.id}` === value,
        )

        if (!oldVariable) return

        const oldLiquidSyntax = toLiquidSyntax({
            value: oldVariable.value,
            filter: oldVariable.filter,
        })
        item.value = item.value.replace(oldLiquidSyntax, newLiquidSyntax)
    })
}

function replaceVariablesInHttpRequestJson(
    currentNodeId: string,
    newLiquidSyntax: string,
    node: HttpRequestNodeType,
    variable: HttpRequestNodeType['data']['variables'][number],
) {
    if (!node.data.json) return
    const variablesInJson = extractVariablesFromText(node.data.json ?? '')
    const oldVariableInJson = variablesInJson.find(
        ({ value }) =>
            `steps_state.${currentNodeId}.content.${variable.id}` === value,
    )
    if (oldVariableInJson) {
        const oldLiquidSyntax = toLiquidSyntax({
            value: oldVariableInJson.value,
            filter: oldVariableInJson.filter,
        })
        node.data.json = node.data.json.replace(
            oldLiquidSyntax,
            newLiquidSyntax,
        )
    }
}

function replaceVariablesInHttpNode(
    currentNodeId: string,
    newLiquidSyntax: string,
    node: HttpRequestNodeType,
    variable: HttpRequestNodeType['data']['variables'][number],
) {
    replaceVariablesInHttpRequestHeaders(
        currentNodeId,
        newLiquidSyntax,
        node,
        variable,
    )
    replaceVariablesInHttpRequestUrl(
        currentNodeId,
        newLiquidSyntax,
        node,
        variable,
    )
    replaceVariablesInHttpRequestJson(
        currentNodeId,
        newLiquidSyntax,
        node,
        variable,
    )
    requestVaraiblesInHttpRequestUrlEncoded(
        currentNodeId,
        newLiquidSyntax,
        node,
        variable,
    )
}

function rebuildGraphForVariableChange(
    g: VisualBuilderGraph,
    currentNodeId: string,
    variable: HttpRequestNodeType['data']['variables'][number],
) {
    g.edges = g.edges.map((edge) => {
        const nextConditions = rebuildCondition(edge, variable)
        if (edge.data?.conditions?.and) {
            edge.data.conditions.and = nextConditions
        } else if (edge.data?.conditions?.or) {
            edge.data.conditions.or = nextConditions
        }
        return edge
    })

    walkVisualBuilderGraph(g, currentNodeId, (node) => {
        if (
            node.type === 'automated_message' ||
            node.type === 'multiple_choices' ||
            node.type === 'text_reply' ||
            node.type === 'file_upload' ||
            node.type === 'order_selection'
        ) {
            const liquidSyntax = toLiquidSyntax({
                filter:
                    variable.data_type === 'date'
                        ? 'format_datetime'
                        : undefined,
                value: `steps_state.${currentNodeId}.content.${variable.id}`,
            })

            const variables = extractVariablesFromText(node.data.content.text)
            const oldVariable = variables.find(
                ({ value }) =>
                    `steps_state.${currentNodeId}.content.${variable.id}` ===
                    value,
            )

            if (!oldVariable) return

            const oldLiquidSyntax = toLiquidSyntax({
                value: oldVariable.value,
                filter: oldVariable.filter,
            })

            node.data.content.html = node.data.content.html.replace(
                oldLiquidSyntax,
                liquidSyntax,
            )

            node.data.content.text = node.data.content.text.replace(
                oldLiquidSyntax,
                liquidSyntax,
            )
        } else if (node.type === 'http_request') {
            const newLiquidSyntax = toLiquidSyntax({
                value: `steps_state.${currentNodeId}.content.${variable.id}`,
                filter: variable.data_type === 'date' ? 'date' : undefined,
            })

            replaceVariablesInHttpNode(
                currentNodeId,
                newLiquidSyntax,
                node,
                variable,
            )
        }
    })
}

function insertHttpRequest(graph: VisualBuilderGraph, beforeNodeId: string) {
    const triggerNode = graph.nodes[0]

    return produce(graph, (draft) => {
        const edge = draft.edges.find((e) => e.target === beforeNodeId)
        if (!edge) return
        const httpRequestNode = buildHttpRequestNode()
        const endNode = buildEndNode(
            triggerNode.type === 'channel_trigger'
                ? 'ask-for-feedback'
                : 'end-failure',
        )

        const targetNode = draft.nodes.find((node) => node.id === beforeNodeId)

        if (
            targetNode?.type === 'end' &&
            targetNode.data.action === 'end-failure'
        ) {
            targetNode.data.action = 'end-success'
        }

        draft.nodes.push(httpRequestNode, endNode)
        edge.target = httpRequestNode.id
        draft.edges.push(
            {
                ...buildEdgeCommonProperties(),
                source: httpRequestNode.id,
                target: beforeNodeId,
                data: {
                    name: 'Success',
                    conditions: getFallibleNodeSuccessConditions(
                        httpRequestNode.id,
                    ),
                },
            },
            {
                ...buildEdgeCommonProperties(),
                source: httpRequestNode.id,
                target: endNode.id,
                data: {
                    name: 'Error',
                },
            },
        )
        draft.nodeEditingId = httpRequestNode.id
        draft.choiceEventIdEditing = null
        draft.branchIdsEditing = []
    })
}
