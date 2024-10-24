import {useMemo} from 'react'

import {validateHttpHeaderName, validateWebhookURL} from 'utils'

import {
    getWorkflowVariableListForNode,
    isValidLiquidSyntaxInNode,
    validateJSONWithVariables,
} from '../models/variables.model'
import {HttpRequestNodeType} from '../models/visualBuilderGraph.types'
import {useVisualBuilderContext} from './useVisualBuilder'

export default function useIsHttpRequestNodeErrored(
    node: Pick<HttpRequestNodeType, 'id' | 'data'>,
    allowMissingVariables = false
) {
    const {
        name,
        url,
        headers,
        json,
        formUrlencoded,
        bodyContentType,
        variables,
    } = node.data
    const {checkInvalidVariablesForNode, visualBuilderGraph} =
        useVisualBuilderContext()
    const hasInvalidVariables = useMemo(
        () =>
            checkInvalidVariablesForNode({
                id: node.id,
                data: node.data,
                type: 'http_request',
            }),
        [node.id, node.data, checkInvalidVariablesForNode]
    )
    const workflowVariables = useMemo(
        () => getWorkflowVariableListForNode(visualBuilderGraph, node.id),
        [visualBuilderGraph, node.id]
    )
    const isErrored =
        !name ||
        !url ||
        hasInvalidVariables ||
        headers.some(
            (header) =>
                !validateHttpHeaderName(header.name) || !header.value.trim()
        ) ||
        formUrlencoded?.some(
            (item) => !item.key.trim() || !item.value.trim()
        ) ||
        (!allowMissingVariables &&
            variables.some(
                (variable) => !variable.name.trim() || !variable.jsonpath.trim()
            )) ||
        !isValidLiquidSyntaxInNode({data: node.data, type: 'http_request'}) ||
        !!validateWebhookURL(url) ||
        (bodyContentType === 'application/json' &&
            !validateJSONWithVariables(json ?? '', workflowVariables))

    return {
        isErrored,
        shouldShowErrors: hasInvalidVariables,
    }
}
