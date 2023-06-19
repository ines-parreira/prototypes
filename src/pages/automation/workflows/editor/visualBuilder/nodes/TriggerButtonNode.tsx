import classNames from 'classnames'
import React from 'react'
import {Handle, Position, NodeProps} from 'reactflow'
import _isEqual from 'lodash/isEqual'
import Label from 'pages/common/forms/Label/Label'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'

import {TriggerButtonNodeType} from '../../../models/visualBuilderGraph.types'
import css from './Node.less'

function TriggerButtonNode({data}: NodeProps<TriggerButtonNodeType['data']>) {
    const {shouldShowErrors} = data
    const isErrored = data.entrypoint_label.length === 0

    return (
        <div>
            <div
                className={classNames(css.node, {
                    [css.nodeErrored]: shouldShowErrors && isErrored,
                })}
                style={{height: 98}}
            >
                <Handle
                    type="target"
                    position={Position.Top}
                    className={css.sourceHandle}
                />
                <div className={css.nodeContainer}>
                    <div className={'w-100, mb-2'}>
                        <Badge type={ColorType.Blue}>start flow</Badge>
                    </div>
                    <div className={css.nodeTitle}>
                        <Label>Trigger button</Label>
                    </div>
                    <div
                        className={classNames(css.nodeContent, {
                            [css.nodeContentErrored]:
                                shouldShowErrors && isErrored,
                        })}
                    >
                        {data.entrypoint_label.length > 0 ? (
                            data.entrypoint_label
                        ) : (
                            <span className={css.clickToAdd}>Click to add</span>
                        )}
                    </div>
                </div>
                <Handle
                    type="source"
                    position={Position.Bottom}
                    className={classNames(css.targetHandle)}
                />
            </div>
        </div>
    )
}

export default React.memo(TriggerButtonNode, (prevProps, nextProps) =>
    _isEqual(prevProps, nextProps)
)
