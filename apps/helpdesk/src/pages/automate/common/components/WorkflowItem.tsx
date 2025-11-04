import { ReactNode, RefObject } from 'react'

import { useId } from '@repo/hooks'
import classnames from 'classnames'

import {
    LegacyToggleField as ToggleField,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import { useReorderDnD } from 'pages/common/hooks/useReorderDnD'

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
    toggleTooltipMessage: ReactNode
    warningTooltipMessage: ReactNode
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
    toggleTooltipMessage,
    warningTooltipMessage,
}: Props) => {
    const toggleInputId = `workflow-item-${useId()}`
    const warningIconId = `workflow-item-warning-icon-${useId()}`

    const { dragRef, dropRef, handlerId, isDragging } = useReorderDnD(
        { type: dndType, position: index },
        [dndType],
        { onHover: onMove, onDrop, onCancel },
    )

    const handleToggle = (nextValue: boolean) => {
        onToggle(index, nextValue)
    }

    return (
        <div
            ref={dropRef as RefObject<HTMLDivElement>}
            style={{ opacity: isDragging ? 0 : 1 }}
            data-handler-id={handlerId}
            className={css.container}
        >
            <i
                ref={dragRef as RefObject<HTMLElement>}
                className={classnames('material-icons', css.icon)}
            >
                drag_indicator
            </i>
            <ToggleField
                name={toggleInputId}
                value={isEnabled}
                onChange={handleToggle}
                isDisabled={!isToggleable}
                label={name}
            />
            {warningTooltipMessage && (
                <>
                    <i
                        id={warningIconId}
                        className={classnames(
                            'material-icons',
                            css.warningIcon,
                        )}
                    >
                        error
                    </i>
                    <Tooltip
                        placement="top-start"
                        target={warningIconId}
                        trigger={['hover']}
                        autohide={false}
                    >
                        {warningTooltipMessage}
                    </Tooltip>
                </>
            )}
            {!isToggleable && toggleTooltipMessage && (
                <Tooltip
                    placement="top-start"
                    target={`${toggleInputId} + div`}
                    trigger={['hover']}
                    autohide={false}
                >
                    {toggleTooltipMessage}
                </Tooltip>
            )}
        </div>
    )
}

export default WorkflowItem
