import React, {memo, useEffect} from 'react'

import IconButton from 'pages/common/components/button/IconButton'
import TextInput from 'pages/common/forms/input/TextInput'

import Caption from 'pages/common/forms/Caption/Caption'
import {useReorderDnD} from 'pages/settings/helpCenter/hooks/useReorderDnD'

import css from './DropdownInput.less'

interface DropdownInputRowProps {
    value: string
    error?: string
    onChange: (index: number, value: string) => void
    onRemove: (index: number) => void
    position: number
    id: string
    onHover: any
    onDrop: any
    isLast?: boolean
}

export function DropdownInputRow(props: DropdownInputRowProps) {
    const {dragRef, dropRef, handlerId, isDragging} = useReorderDnD(
        {
            position: props.position,
            id: props.id,
            type: 'dropdown-choice',
        },
        ['dropdown-choice'],
        {onHover: props.onHover, onDrop: props.onDrop}
    )

    // Set HTML5 validation status
    const id = props.id
    const error = props.error
    useEffect(() => {
        const elt = document.getElementById(id) as HTMLInputElement
        elt?.setCustomValidity(error || '')
    }, [id, error])

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
            <div className={css.inputContainer}>
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
                    onChange={(val) => props.onChange(props.position, val)}
                    hasError={!!props.error}
                    data-testid={props.id}
                />
                {!props.isLast && (
                    <IconButton
                        onClick={() => props.onRemove(props.position)}
                        fillStyle="ghost"
                        intent="destructive"
                        className={css.deleteButton}
                        data-testid={`${props.id}-remove`}
                    >
                        clear
                    </IconButton>
                )}
            </div>
            {props.error && (
                <Caption className={css.lastInput} error={props.error} />
            )}
        </div>
    )
}

export default memo(DropdownInputRow)
