import {produce} from 'immer'

import {ulid} from 'ulidx'
import {
    HttpRequestNodeType,
    VisualBuilderGraph,
} from '../../models/visualBuilderGraph.types'

export type VisualBuilderHttpRequestAction =
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

// bridge between type system and runtime
// allow to keep a type safe list of all action types for this reducer
type ActionTypes = {
    [K in VisualBuilderHttpRequestAction['type']]: true
}
const visualBuilderHttpRequestActionTypes: ActionTypes = {
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
}

export function isVisualBuilderHttpRequestAction(action: {
    type: string
}): action is VisualBuilderHttpRequestAction {
    return Object.keys(visualBuilderHttpRequestActionTypes).includes(
        action.type
    )
}

export function httpRequestReducer(
    graph: VisualBuilderGraph,
    action: VisualBuilderHttpRequestAction
): VisualBuilderGraph {
    switch (action.type) {
        case 'SET_HTTP_REQUEST_NAME':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request'
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
                        n.type === 'http_request'
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
                        n.type === 'http_request'
                )
                if (node) {
                    node.data.method = action.method

                    if (action.method === 'GET') {
                        delete node.data.json
                        delete node.data.formUrlencoded
                        delete node.data.bodyContentType
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
                        n.type === 'http_request'
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
                        n.type === 'http_request'
                )
                if (node) {
                    node.data.headers.push({name: '', value: ''})
                }
            })
        case 'DELETE_HTTP_REQUEST_HEADER':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request'
                )
                if (node && node.data.headers[action.index]) {
                    node.data.headers.splice(action.index, 1)
                }
            })
        case 'SET_HTTP_REQUEST_BODY_CONTENT_TYPE':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request'
                )
                if (node) {
                    node.data.bodyContentType = action.bodyContentType

                    switch (action.bodyContentType) {
                        case 'application/json':
                            node.data.json = '{}'
                            break
                        case 'application/x-www-form-urlencoded':
                            node.data.formUrlencoded = [{key: '', value: ''}]
                            break
                    }
                }
            })
        case 'SET_HTTP_REQUEST_JSON':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request'
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
                        n.type === 'http_request'
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
                        n.type === 'http_request'
                )
                if (node) {
                    node.data.formUrlencoded ??= []
                    node.data.formUrlencoded.push({key: '', value: ''})
                }
            })
        case 'DELETE_HTTP_REQUEST_FORM_URLENCODED_ITEM':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request'
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
                        n.type === 'http_request'
                )
                if (node && node.data.variables[action.index]) {
                    node.data.variables[action.index] = action.variable
                }
            })
        case 'ADD_HTTP_REQUEST_VARIABLE':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request'
                )
                if (node) {
                    node.data.variables.push({
                        id: ulid(),
                        name: '',
                        jsonpath: '',
                    })
                }
            })
        case 'DELETE_HTTP_REQUEST_VARIABLE':
            return produce(graph, (draft) => {
                const node = draft.nodes.find(
                    (n): n is HttpRequestNodeType =>
                        n.id === action.httpRequestNodeId &&
                        n.type === 'http_request'
                )
                if (node && node.data.variables[action.index]) {
                    node.data.variables.splice(action.index, 1)
                }
            })
    }
}
