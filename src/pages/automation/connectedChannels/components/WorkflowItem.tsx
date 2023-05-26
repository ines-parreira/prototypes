import React, {RefObject} from 'react'
import classnames from 'classnames'
import {Link} from 'react-router-dom'

import ToggleInput from 'pages/common/forms/ToggleInput'
import {useReorderDnD} from 'pages/common/hooks/useReorderDnD'
import Tooltip from 'pages/common/components/Tooltip'
import useId from 'hooks/useId'

import {useConnectedChannelsViewContext} from '../ConnectedChannelsViewContext'

import css from './WorkflowItem.less'

type Props = {
    dndType: string
    onMove: (dragIndex: number, hoverIndex: number) => void
    onDrop: () => void
    onCancel: () => void
    name: string
    isEnabled: boolean
    isToggleable: boolean
    index: number
    onToggle: (index: number, isEnabled: boolean) => void
}

const WorkflowItem = ({
    dndType,
    onMove,
    onDrop,
    onCancel,
    name,
    isEnabled,
    isToggleable,
    index,
    onToggle,
}: Props) => {
    const toggleInputId = `workflow-item-${useId()}`

    const {quickResponsesUrl} = useConnectedChannelsViewContext()
    const {dragRef, dropRef, handlerId, isDragging} = useReorderDnD(
        {type: dndType, position: index},
        [dndType],
        {onHover: onMove, onDrop, onCancel}
    )

    const handleToggle = (nextValue: boolean) => {
        onToggle(index, nextValue)
    }

    return (
        <div
            ref={dropRef as RefObject<HTMLDivElement>}
            style={{opacity: isDragging ? 0 : 1}}
            data-handler-id={handlerId}
            className={css.container}
        >
            <i
                ref={dragRef as RefObject<HTMLElement>}
                className={classnames('material-icons', css.icon)}
            >
                drag_indicator
            </i>
            <ToggleInput
                name={toggleInputId}
                isToggled={isEnabled}
                onClick={handleToggle}
                isDisabled={!isToggleable}
            >
                {name}
            </ToggleInput>
            {!isToggleable && (
                <Tooltip
                    placement="top-start"
                    target={`${toggleInputId} + div`}
                    trigger={['hover']}
                    autohide={false}
                >
                    You have reached the maximum number of enabled flows in this
                    channel. Disable a flow or{' '}
                    <Link to={quickResponsesUrl}>quick response flow</Link> in
                    order to enable this flow.
                </Tooltip>
            )}
        </div>
    )
}

export default WorkflowItem
