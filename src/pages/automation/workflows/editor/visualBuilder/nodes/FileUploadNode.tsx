import classNames from 'classnames'
import React, {memo, useMemo} from 'react'
import {Handle, Position, NodeProps} from 'reactflow'

import Label from 'pages/common/forms/Label/Label'
import VisualBuilderActionTag from 'pages/automation/workflows/components/VisualBuilderActionTag'
import {
    flowVariableRegex,
    isValidLiquidSyntaxInNode,
} from 'pages/automation/workflows/models/variables.model'
import {
    VisualBuilderNodeProps,
    useVisualBuilderNodeProps,
} from 'pages/automation/workflows/hooks/useVisualBuilderNodeProps'
import {useWorkflowEditorContext} from 'pages/automation/workflows/hooks/useWorkflowEditor'

import {FileUploadNodeType} from '../../../models/visualBuilderGraph.types'
import NodeDeleteIcon from '../components/NodeDeleteIcon'
import EdgeBlock from '../components/EdgeBlock'

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
                            contentText.replace(flowVariableRegex, '{...}')
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
    const {checkInvalidVariablesForNode} = useWorkflowEditorContext()
    const hasInvalidVariables = useMemo(
        () => checkInvalidVariablesForNode(content.text, node.id),
        [content.text, node.id, checkInvalidVariablesForNode]
    )
    const isErrored =
        content.text.length === 0 ||
        hasInvalidVariables ||
        !isValidLiquidSyntaxInNode(node.data.content)
    const commonProps = useVisualBuilderNodeProps(node)

    return (
        <FileUploadNode
            {...commonProps}
            contentText={content.text}
            isErrored={isErrored}
        />
    )
}
