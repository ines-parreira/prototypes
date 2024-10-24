import classNames from 'classnames'
import React, {memo, useMemo} from 'react'
import {Handle, NodeProps, Position} from 'reactflow'

import {
    endNodeActionIconByAction,
    endNodeActionLabelByAction,
} from 'pages/automate/workflows/constants'
import {
    VisualBuilderNodeProps,
    useVisualBuilderNodeProps,
} from 'pages/automate/workflows/hooks/useVisualBuilderNodeProps'
import {
    EndNodeType,
    isTriggerNodeType,
} from 'pages/automate/workflows/models/visualBuilderGraph.types'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'

import {useVisualBuilderContext} from '../../../hooks/useVisualBuilder'
import EdgeBlock from '../components/EdgeBlock'

import css from './Node.less'

type Props = VisualBuilderNodeProps & {
    action: EndNodeType['data']['action']
    actions: EndNodeType['data']['action'][]
}

const EndNode = memo(function EndNode({
    action,
    actions,
    isGreyedOut,
    isSelected,
    edgeProps,
}: Props) {
    return (
        <div>
            <EdgeBlock {...edgeProps} />
            <div
                className={classNames(css.node, css.endNode, {
                    [css.nodeGreyedOut]: isGreyedOut,
                    [css.nodeSelected]: isSelected,
                    [css.notClickable]: actions.length === 1,
                })}
                onClick={(event) => {
                    if (actions.length === 1) {
                        event.stopPropagation()
                    }
                }}
            >
                <div className={'w-100'}>
                    <Badge type={ColorType.Light}>end flow</Badge>
                </div>
                <div className={css.nodeTitle}>
                    <div>
                        <span className={css.iconContainer}>
                            <i className={classNames('material-icons')}>
                                {endNodeActionIconByAction[action]}
                            </i>
                        </span>
                        {endNodeActionLabelByAction[action]}
                    </div>
                </div>
                <Handle
                    type="target"
                    position={Position.Top}
                    className={classNames(css.sourceHandle)}
                />
            </div>
        </div>
    )
})

export default function EndNodeWrapper(node: NodeProps<EndNodeType['data']>) {
    const commonProps = useVisualBuilderNodeProps(node)

    const {visualBuilderGraph} = useVisualBuilderContext()

    const triggerNode = visualBuilderGraph.nodes.find(isTriggerNodeType)!

    const actions = useMemo<EndNodeType['data']['action'][]>(() => {
        switch (triggerNode.type!) {
            case 'llm_prompt_trigger':
                return ['end']
            case 'channel_trigger':
                return ['end', 'ask-for-feedback', 'create-ticket']
        }
    }, [triggerNode.type])

    return (
        <EndNode {...commonProps} action={node.data.action} actions={actions} />
    )
}
