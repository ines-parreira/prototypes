import {Label} from '@gorgias/merchant-ui-kit'
import classNames from 'classnames'
import React, {memo, useMemo} from 'react'
import {Handle, NodeProps, Position} from 'reactflow'

import VisualBuilderActionTag from 'pages/automate/workflows/components/VisualBuilderActionTag'
import {useVisualBuilderContext} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {
    VisualBuilderNodeProps,
    useVisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'

import {ConditionsNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import EdgeBlock from '../components/EdgeBlock'
import NodeDeleteIcon from '../components/NodeDeleteIcon'

import css from './Node.less'

type Props = VisualBuilderNodeProps & {
    isErrored: boolean
    name: string
}

const ConditionsNode = memo(function ConditionsNode({
    name,
    isErrored,
    shouldShowErrors,
    isGreyedOut,
    isSelected,
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
                    <VisualBuilderActionTag nodeType="conditions" />
                    <Label className={css.nodeTitle}>
                        {name || (
                            <span className={css.clickToAdd}>
                                Route customers using variables
                            </span>
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

export default function ConditionsNodeWrapper(
    node: NodeProps<ConditionsNodeType['data']>
) {
    const {checkInvalidVariablesForNode, checkInvalidConditionsForNode} =
        useVisualBuilderContext()

    const hasInvalidVariables = useMemo(
        () =>
            checkInvalidVariablesForNode({
                id: node.id,
                data: node.data,
                type: 'conditions',
            }),
        [node.id, node.data, checkInvalidVariablesForNode]
    )

    const hasInvalidConditions = useMemo(
        () =>
            checkInvalidConditionsForNode({
                id: node.id,
                data: node.data,
                type: 'conditions',
            }),
        [node.id, node.data, checkInvalidConditionsForNode]
    )

    const isErrored = hasInvalidVariables || hasInvalidConditions

    const commonProps = useVisualBuilderNodeProps(node)

    return (
        <ConditionsNode
            {...commonProps}
            name={node.data.name}
            shouldShowErrors={commonProps.shouldShowErrors && isErrored}
            isErrored={isErrored}
        />
    )
}
