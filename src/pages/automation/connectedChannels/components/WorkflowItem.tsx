import React, {ReactNode, RefObject} from 'react'
import classnames from 'classnames'

import ToggleInput from 'pages/common/forms/ToggleInput'
import {useReorderDnD} from 'pages/common/hooks/useReorderDnD'
import Tooltip from 'pages/common/components/Tooltip'
import useId from 'hooks/useId'

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
    limitTooltipMessage: ReactNode
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
    limitTooltipMessage,
}: Props) => {
    const toggleInputId = `workflow-item-${useId()}`

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
                    {limitTooltipMessage}
                </Tooltip>
            )}
        </div>
    )
}

export default WorkflowItem
