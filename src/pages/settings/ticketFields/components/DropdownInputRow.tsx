import React, {memo, useCallback, useEffect, useRef} from 'react'

import classnames from 'classnames'
import IconButton from 'pages/common/components/button/IconButton'
import TextInput from 'pages/common/forms/input/TextInput'
import Caption from 'pages/common/forms/Caption/Caption'
import {useReorderDnD} from 'pages/common/hooks/useReorderDnD'

import css from './DropdownInput.less'

interface DropdownInputRowProps {
    value: string
    error?: string
    onChange: (index: number, value: string) => void
    onRemove: (index: number) => void
    position: number
    id: string
    nextId?: string | undefined
    onHover: any
    onDrop: any
    isLast?: boolean
}

export function DropdownInputRow({
    value,
    position,
    id,
    nextId,
    error,
    isLast,
    onChange,
    onDrop,
    onHover,
    onRemove,
}: DropdownInputRowProps) {
    const nextInputRef = useRef<HTMLInputElement | null>(null)
    const {dragRef, dropRef, handlerId, isDragging} = useReorderDnD(
        {
            position,
            id: id,
            type: 'dropdown-choice',
        },
        ['dropdown-choice'],
        {onHover, onDrop}
    )

    // Set HTML5 validation status

    useEffect(() => {
        const elt = document.getElementById(id) as HTMLInputElement | null
        elt?.setCustomValidity(error || '')
    }, [id, error])

    useEffect(() => {
        if (!nextId) {
            nextInputRef.current = null
            return
        }
        nextInputRef.current = document.getElementById(
            nextId
        ) as HTMLInputElement | null
    }, [nextId])

    const handleEnterKeyDown = useCallback(
        (evt: React.KeyboardEvent<HTMLInputElement>) => {
            if (evt.key === 'Enter') {
                if (!isLast) {
                    nextInputRef.current?.focus()
                }
            }
        },
        [isLast, nextInputRef]
    )

    return (
        <div
            ref={
                isLast ? undefined : (dropRef as React.Ref<HTMLTableRowElement>)
            }
            data-handler-id={handlerId}
            className={isLast ? css.lastInput : css.input}
            style={{opacity: isDragging ? 0.3 : 1}}
        >
            <div className={css.inputContainer}>
                {!isLast ? (
                    <div
                        ref={dragRef as React.RefObject<HTMLDivElement>}
                        className={classnames(
                            'material-icons',
                            css.dragIndicator,
                            css.dragIndicatorActive
                        )}
                        data-testid={`${id}-handle`}
                    >
                        drag_indicator
                    </div>
                ) : (
                    <div
                        className={classnames(
                            'material-icons',
                            css.dragIndicator,
                            css.dragIndicatorDisabled
                        )}
                    >
                        drag_indicator
                    </div>
                )}
                <TextInput
                    id={id}
                    value={value}
                    placeholder="e.g. Shipping issue::Delay"
                    onChange={(val) => onChange(position, val)}
                    hasError={!!error}
                    data-testid={id}
                    onKeyDown={handleEnterKeyDown}
                />
                {!isLast && (
                    <IconButton
                        onClick={() => onRemove(position)}
                        fillStyle="ghost"
                        intent="destructive"
                        className={css.deleteButton}
                        data-testid={`${id}-remove`}
                    >
                        clear
                    </IconButton>
                )}
            </div>
            {error && <Caption className={css.lastInput} error={error} />}
        </div>
    )
}

export default memo(DropdownInputRow)
