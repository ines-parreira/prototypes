import {useMemo} from 'react'

import {validateJSON, validateWebhookURL} from 'utils'

import {HttpRequestNodeType} from '../models/visualBuilderGraph.types'
import {isValidLiquidSyntaxInNode} from '../models/variables.model'
import {useWorkflowEditorContext} from './useWorkflowEditor'

export default function useIsHttpRequestNodeErrored(
    node: Pick<HttpRequestNodeType, 'id' | 'data'>
) {
    const {
        name,
        url,
        headers,
        json,
        formUrlencoded = [],
        bodyContentType,
        variables,
    } = node.data
    const {checkInvalidVariablesForNode} = useWorkflowEditorContext()
    const hasInvalidVariables = useMemo(
        () =>
            checkInvalidVariablesForNode({
                id: node.id,
                data: node.data,
                type: 'http_request',
            }),
        [node.id, node.data, checkInvalidVariablesForNode]
    )
    const isErrored =
        !name ||
        hasInvalidVariables ||
        headers.some((header) => !header.name.trim() || !header.value.trim()) ||
        formUrlencoded.some((item) => !item.key.trim() || !item.value.trim()) ||
        variables.some(
            (variable) => !variable.name.trim() || !variable.jsonpath.trim()
        ) ||
        !isValidLiquidSyntaxInNode({data: node.data, type: 'http_request'}) ||
        !!validateWebhookURL(url) ||
        (bodyContentType === 'application/json' && !validateJSON(json ?? ''))

    return {
        isErrored,
        shouldShowErrors: hasInvalidVariables,
    }
}
