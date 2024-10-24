import {Label} from '@gorgias/ui-kit'
import classNames from 'classnames'
import React, {memo, useMemo} from 'react'
import {Handle, Position, NodeProps} from 'reactflow'

import VisualBuilderActionTag from 'pages/automate/workflows/components/VisualBuilderActionTag'
import {useVisualBuilderContext} from 'pages/automate/workflows/hooks/useVisualBuilder'
import {
    VisualBuilderNodeProps,
    useVisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import {
    workflowVariableRegex,
    isValidLiquidSyntaxInNode,
} from 'pages/automate/workflows/models/variables.model'

import {FileUploadNodeType} from '../../../models/visualBuilderGraph.types'
import EdgeBlock from '../components/EdgeBlock'
import NodeDeleteIcon from '../components/NodeDeleteIcon'

import css from './Node.less'

type Props = VisualBuilderNodeProps & {
    contentText: string
    isErrored: boolean
}

const FileUploadNode = memo(function FileUploadNode({
    contentText,
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
                    <VisualBuilderActionTag nodeType="file_upload" />
                    <Label className={css.nodeTitle}>
                        {contentText.length > 0 ? (
                            contentText.replace(workflowVariableRegex, '{...}')
                        ) : (
                            <span className={css.clickToAdd}>Message</span>
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

export default function FileUploadNodeWrapper(
    node: NodeProps<FileUploadNodeType['data']>
) {
    const {content} = node.data
    const {checkInvalidVariablesForNode} = useVisualBuilderContext()
    const hasInvalidVariables = useMemo(
        () =>
            checkInvalidVariablesForNode({
                id: node.id,
                data: node.data,
                type: 'file_upload',
            }),
        [node.id, node.data, checkInvalidVariablesForNode]
    )
    const isErrored =
        content.text.length === 0 ||
        hasInvalidVariables ||
        !isValidLiquidSyntaxInNode({data: node.data, type: 'file_upload'})
    const commonProps = useVisualBuilderNodeProps(node)

    return (
        <FileUploadNode
            {...commonProps}
            shouldShowErrors={
                commonProps.shouldShowErrors || hasInvalidVariables
            }
            contentText={content.text}
            isErrored={isErrored}
        />
    )
}
