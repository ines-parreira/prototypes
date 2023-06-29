import classNames from 'classnames'
import React from 'react'
import {Handle, NodeProps, Position} from 'reactflow'
import _isEqual from 'lodash/isEqual'
import colors from 'assets/tokens/colors.json'

import useId from 'hooks/useId'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import Tooltip from 'pages/common/components/Tooltip'
import Button from 'pages/common/components/button/Button'
import {EndNodeType} from 'pages/automation/workflows/models/visualBuilderGraph.types'

import EdgeBlock from '../components/EdgeBlock'

import css from './Node.less'

function EndNode(node: NodeProps<EndNodeType['data']>) {
    const tooltipId = `workflow-placeholder-${useId()}`

    const buttonProps = {
        size: 'small',
        intent: 'secondary',
        style: {
            textTransform: 'none',
            color: colors['📺 Classic'].Neutral.Grey_6.value,
        },
        isDisabled: true,
    } as const

    return (
        <div>
            <EdgeBlock node={node} />
            <div className={classNames(css.node, css.endNode)}>
                <div className={'w-100'}>
                    <Badge type={ColorType.Light}>end flow</Badge>
                </div>
                <span>
                    Was this helpful?{' '}
                    <i
                        className={classNames(
                            css.endTooltipIcon,
                            'material-icons'
                        )}
                        id={tooltipId}
                    >
                        info
                    </i>
                </span>
                <span>
                    <Button {...buttonProps} className="mr-2">
                        Yes, thank you
                    </Button>
                    <Button {...buttonProps}>No, I need more help</Button>
                </span>
                <Tooltip target={tooltipId} placement="top">
                    If customers click yes, the flow ends. If customers click
                    no, a ticket will be created.
                </Tooltip>
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
