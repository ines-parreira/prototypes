import classNames from 'classnames'
import React, {memo, useMemo} from 'react'
import {Handle, NodeProps, Position} from 'reactflow'

import Label from 'pages/common/forms/Label/Label'
import VisualBuilderActionTag from 'pages/automate/workflows/components/VisualBuilderActionTag'
import {
    useVisualBuilderNodeProps,
    VisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import {HttpRequestNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import {useWorkflowEditorContext} from 'pages/automate/workflows/hooks/useWorkflowEditor'
import {isValidLiquidSyntaxInNode} from 'pages/automate/workflows/models/variables.model'
import {validateJSON, validateWebhookURL} from 'utils'

import NodeDeleteIcon from '../components/NodeDeleteIcon'
import EdgeBlock from '../components/EdgeBlock'

import css from './Node.less'

type Props = VisualBuilderNodeProps & {
    name: string
    isErrored: boolean
}

const HttpRequestNode = memo(function HttpRequestNode({
    name,
    isErrored,
    isSelected,
    isGreyedOut,
    shouldShowErrors,
    edgeProps,
    deleteProps,
}: Props) {
    return (
        <div>
            <EdgeBlock {...edgeProps} />
            <div
                className={classNames(css.node, {
                    [css.nodeErrored]: shouldShowErrors && isErrored,
                    [css.nodeGreyedOut]: isGreyedOut,
                    [css.nodeSelected]: isSelected,
                })}
            >
                <Handle
                    type="target"
                    position={Position.Top}
                    className={css.sourceHandle}
                />
                <div className={css.nodeContainer}>
                    <VisualBuilderActionTag nodeType="http_request" />
                    <Label className={css.nodeTitle}>
                        {name.length > 0 ? (
                            name
                        ) : (
                            <span className={css.clickToAdd}>Request name</span>
                        )}
                    </Label>
                    <NodeDeleteIcon {...deleteProps} />
                </div>
                <Handle
                    type="source"
                    position={Position.Bottom}
                    className={classNames(css.targetHandle)}
                />
            </div>
        </div>
    )
})

export default function HttpRequestNodeWrapper(
    node: NodeProps<HttpRequestNodeType['data']>
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
    const commonProps = useVisualBuilderNodeProps(node)

    return (
        <HttpRequestNode
            {...commonProps}
            shouldShowErrors={
                commonProps.shouldShowErrors || hasInvalidVariables
            }
            name={name}
            isErrored={isErrored}
        />
    )
}
