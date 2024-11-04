import {Label} from '@gorgias/merchant-ui-kit'
import classNames from 'classnames'
import React, {memo} from 'react'
import {Handle, NodeProps, Position} from 'reactflow'

import VisualBuilderActionTag from 'pages/automate/workflows/components/VisualBuilderActionTag'
import useIsHttpRequestNodeErrored from 'pages/automate/workflows/hooks/useIsHttpRequestNodeErrored'
import {
    useVisualBuilderNodeProps,
    VisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import {HttpRequestNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import EdgeBlock from '../components/EdgeBlock'
import NodeDeleteIcon from '../components/NodeDeleteIcon'

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
    const {isErrored, shouldShowErrors} = useIsHttpRequestNodeErrored(node)
    const commonProps = useVisualBuilderNodeProps(node)

    return (
        <HttpRequestNode
            {...commonProps}
            shouldShowErrors={commonProps.shouldShowErrors || shouldShowErrors}
            name={name}
            isErrored={isErrored}
        />
    )
}
