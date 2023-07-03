import classNames from 'classnames'
import React from 'react'
import {Handle, NodeProps, Position} from 'reactflow'
import _isEqual from 'lodash/isEqual'

import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import {EndNodeType} from 'pages/automation/workflows/models/visualBuilderGraph.types'

import EdgeBlock from '../components/EdgeBlock'

import css from './Node.less'

function EndNode(node: NodeProps<EndNodeType['data']>) {
    return (
        <div>
            <EdgeBlock node={node} />
            <div className={classNames(css.node, css.endNode)}>
                <div className={'w-100'}>
                    <Badge type={ColorType.Light}>end flow</Badge>
                </div>
                <div className={css.nodeTitle}>
                    <div>
                        <span className={css.iconContainer}>
                            {' '}
                            <i className={classNames('material-icons')}>
                                thumb_up_alt
                            </i>
                        </span>
                        {node.data.withWasThisHelpfulPrompt
                            ? 'Ask for feedback'
                            : 'Create ticket'}
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
}

export default React.memo(EndNode, (prevProps, nextProps) =>
    _isEqual(prevProps, nextProps)
)
