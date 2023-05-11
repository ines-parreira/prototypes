import classNames from 'classnames'
import React, {useRef, useState} from 'react'
import {Handle, Position} from 'reactflow'
import _isEqual from 'lodash/isEqual'
import colors from 'assets/tokens/colors.json'

import useId from 'hooks/useId'
import Badge, {ColorType} from 'pages/common/components/Badge/Badge'
import Tooltip from 'pages/common/components/Tooltip'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import Dropdown from 'pages/common/components/dropdown/Dropdown'

import Button from 'pages/common/components/button/Button'
import EdgeIconButton from '../components/EdgeIconButton'
import {useWorkflowConfigurationContext} from '../../hooks/useWorkflowConfiguration'

import css from './Node.less'

function PlaceholderNode({data}: {data: {parentStepId: string}}) {
    const tooltipId = `workflow-placeholder-${useId()}`
    const {dispatch} = useWorkflowConfigurationContext()
    const edgeRef = useRef<HTMLDivElement>(null)
    const [isNodeMenuDropdownOpen, setIsNodeMenuDropdownOpen] = useState(false)

    const addNode = (
        <div
            className={css.addNodeIconContainer}
            onClick={(e) => {
                e.stopPropagation()
            }}
            style={{top: -34}}
        >
            <EdgeIconButton
                ref={edgeRef}
                icon="add"
                onClick={() => {
                    setIsNodeMenuDropdownOpen(true)
                }}
            />
            <Dropdown
                isOpen={isNodeMenuDropdownOpen}
                onToggle={setIsNodeMenuDropdownOpen}
                target={edgeRef}
                placement="right-start"
            >
                <DropdownBody>
                    <DropdownItem
                        option={{
                            label: 'Multiple choice (6 maximum)',
                            value: 'ADD_REPLY_BUTTONS',
                        }}
                        onClick={() => {
                            dispatch({
                                type: 'ADD_REPLY_BUTTONS',
                                step_id: data.parentStepId,
                            })
                        }}
                        shouldCloseOnSelect
                    />
                </DropdownBody>
            </Dropdown>
        </div>
    )

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
            {addNode}
            <div className={classNames(css.node, css.placeholderNode)}>
                <div className={'w-100'}>
                    <Badge type={ColorType.Blue}>end flow</Badge>
                </div>
                <span>
                    Was this helpful?{' '}
                    <i
                        className={classNames(
                            css.placeholderTooltipIcon,
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

export default React.memo(PlaceholderNode, (prevProps, nextProps) =>
    _isEqual(prevProps, nextProps)
)
