import classNames from 'classnames'
import React, {useRef, useState} from 'react'
import {Handle, Position} from 'reactflow'
import _isEqual from 'lodash/isEqual'

import useId from 'hooks/useId'
import Badge from 'pages/common/components/Badge/Badge'
import Tooltip from 'pages/common/components/Tooltip'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import Dropdown from 'pages/common/components/dropdown/Dropdown'

import EdgeIconButton from '../components/EdgeIconButton'
import {useWorkflowConfigurationContext} from '../../hooks/useWorkflowConfiguration'

import css from './Node.less'

function PlaceholderNode({data}: {data: {parentStepId: string}}) {
    const badgeInfoId = `workflow-placeholder-${useId()}`
    const {dispatch} = useWorkflowConfigurationContext()
    const edgeRef = useRef<HTMLDivElement>(null)
    const [isNodeMenuDropdownOpen, setIsNodeMenuDropdownOpen] = useState(false)

    const badge = (
        <div
            className={css.badgeContainer}
            style={{top: -21}}
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
    const addNode = (
        <div
            className={css.addNodeIconContainer}
            onClick={(e) => {
                e.stopPropagation()
            }}
            style={{top: -55}}
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

    return (
        <div>
            {addNode}
            {badge}
            <div
                className={classNames(css.node, css.placeholderNode)}
                style={{
                    visibility: 'hidden', // TODO: bring back once solution for "Clarify end of flow behavior" is defined
                }}
            >
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
