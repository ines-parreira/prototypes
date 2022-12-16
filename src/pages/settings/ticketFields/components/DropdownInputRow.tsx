import React from 'react'

import IconButton from 'pages/common/components/button/IconButton'
import TextInput from 'pages/common/forms/input/TextInput'

import {useReorderDnD} from 'pages/settings/helpCenter/hooks/useReorderDnD'

import css from './DropdownInput.less'

interface DropdownInputRowProps {
    value: string
    onChange: (value: string) => void
    onRemove: () => void
    position: number
    id: string
    onHover: any
    onDrop: any
    isLast?: boolean
}

export default function DropdownInputRow(props: DropdownInputRowProps) {
    const {dragRef, dropRef, handlerId, isDragging} = useReorderDnD(
        {
            position: props.position,
            id: props.id,
            type: 'dropdown-choice',
        },
        ['dropdown-choice'],
        {onHover: props.onHover, onDrop: props.onDrop}
    )

    return (
        <div
            ref={
                props.isLast
                    ? undefined
                    : (dropRef as React.Ref<HTMLTableRowElement>)
            }
            data-handler-id={handlerId}
            className={props.isLast ? css.lastInput : css.input}
            style={{opacity: isDragging ? 0.3 : 1}}
        >
            {!props.isLast && (
                <div
                    ref={dragRef as React.RefObject<HTMLDivElement>}
                    className={'material-icons ' + css.dragIndicator}
                    data-testid={`${props.id}-handle`}
                >
                    drag_indicator
                </div>
            )}
            <TextInput
                id={props.id}
                value={props.value}
                onChange={props.onChange}
                data-testid={props.id}
            />
            {!props.isLast && (
                <IconButton
                    onClick={props.onRemove}
                    fillStyle="ghost"
                    intent="destructive"
                    className={css.deleteButton}
                    data-testid={`${props.id}-remove`}
                >
                    clear
                </IconButton>
            )}
        </div>
    )
}
