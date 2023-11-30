import classNames from 'classnames'
import React, {memo} from 'react'
import {Handle, NodeProps, Position} from 'reactflow'

import Label from 'pages/common/forms/Label/Label'
import VisualBuilderActionTag from 'pages/automate/workflows/components/VisualBuilderActionTag'
import {
    useVisualBuilderNodeProps,
    VisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'

import {HttpRequestNodeType} from '../../../models/visualBuilderGraph.types'
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
    const {name} = node.data
    const isErrored = name.length === 0
    const commonProps = useVisualBuilderNodeProps(node)

    return (
        <HttpRequestNode {...commonProps} name={name} isErrored={isErrored} />
    )
}
