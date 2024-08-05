import React from 'react'
import classNames from 'classnames'
import {Label} from '@gorgias/ui-kit'
import {Link} from 'react-router-dom'
import IconButton from 'pages/common/components/button/IconButton'
import {useReorderDnD} from 'pages/common/hooks/useReorderDnD'
import css from './FlowSettingsItem.less'

interface Props {
    label: string
    triggerName: string | undefined
    id: string
    url: string
    index: number
    channelType: string
    onDelete: () => void
    onMove: (dragIndex: number, hoverIndex: number) => void
    onDrop: () => void
    onCancel: () => void
}

export const FlowSettingsItem = ({
    label,
    triggerName,
    url,
    index,
    channelType,
    id,
    onMove,
    onDrop,
    onDelete,
    onCancel,
}: Props) => {
    const type = `flows-${channelType}`
    const {dragRef, dropRef, handlerId, isDragging} = useReorderDnD(
        {type, position: index},
        [type],
        {onHover: onMove, onDrop, onCancel}
    )

    return (
        <div
            data-handler-id={handlerId}
            ref={dropRef as any}
            style={{opacity: isDragging ? 0 : 1}}
            className={css.container}
        >
            <li
                key={id}
                data-handler-id={handlerId}
                ref={dragRef as any}
                className={css.workflowListItem}
            >
                <i className={classNames('material-icons', css.dragIcon)}>
                    drag_indicator
                </i>

                <div>
                    <Label>{label}</Label>

                    <span className={css.workflowTriggerName}>
                        {triggerName}
                    </span>
                </div>
                <div className={css.workflowListItemButtons}>
                    <Link to={url}>
                        <IconButton fillStyle="ghost" intent="secondary">
                            edit
                        </IconButton>
                    </Link>
                    <IconButton
                        fillStyle="ghost"
                        intent="destructive"
                        onClick={() => onDelete?.()}
                    >
                        close
                    </IconButton>
                </div>
            </li>
        </div>
    )
}
