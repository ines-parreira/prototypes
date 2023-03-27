import classNames from 'classnames'
import React from 'react'
import {Handle, Position} from 'reactflow'
import _isEqual from 'lodash/isEqual'

import useId from 'hooks/useId'
import Badge from 'pages/common/components/Badge/Badge'
import Tooltip from 'pages/common/components/Tooltip'
import {useWorkflowConfigurationContext} from '../../hooks/useWorkflowConfiguration'
import css from './Node.less'

function PlaceholderNode({data}: {data: {parentStepId: string}}) {
    const badgeInfoId = `workflow-placeholder-${useId()}`
    const {dispatch} = useWorkflowConfigurationContext()

    const badge = (
        <div
            className={css.badgeContainer}
            style={{top: -42}}
            onClick={(e) => {
                e.stopPropagation()
            }}
        >
            <Badge className={css.badge}>
                end of flow{' '}
                <i className="material-icons" id={badgeInfoId}>
                    info
                </i>
                <Tooltip target={badgeInfoId} placement="top">
                    Customers will be asked if the message was helpful or if
                    they need more help. A ticket will be created if they ask
                    for more help.
                </Tooltip>
            </Badge>
        </div>
    )

    return (
        <div>
            {badge}
            <div
                className={classNames(css.node, css.placeholderNode)}
                onClick={() =>
                    dispatch({
                        type: 'ADD_REPLY_BUTTONS',
                        step_id: data.parentStepId,
                    })
                }
            >
                <Handle
                    type="target"
                    position={Position.Top}
                    className={classNames(css.sourceHandle)}
                />
                <div className={classNames(css.placeholderContainer)}>
                    <div className={classNames(css.nodeContent)}>
                        + Add reply buttons
                    </div>
                </div>
            </div>
        </div>
    )
}

export default React.memo(PlaceholderNode, (prevProps, nextProps) =>
    _isEqual(prevProps, nextProps)
)
