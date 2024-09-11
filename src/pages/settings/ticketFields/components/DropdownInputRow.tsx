import React, {memo, useCallback, useEffect, useRef} from 'react'

import classnames from 'classnames'
import IconButton from 'pages/common/components/button/IconButton'
import TextInput from 'pages/common/forms/input/TextInput'
import Caption from 'pages/common/forms/Caption/Caption'
import {useReorderDnD} from 'pages/common/hooks/useReorderDnD'
import {
    CustomField,
    CustomFieldInput,
    CustomFieldManagedType,
} from 'models/customField/types'

import css from './DropdownInputRow.less'

const defaultPlaceholder = 'e.g. Shipping issue::Delay'
const placeholders: Record<CustomFieldManagedType, string> = {
    contact_reason: defaultPlaceholder,
    product: 'e.g. Men::Tops::Polo shirt',
    resolution: 'e.g. Order actions::Refund::Partial refund',
}

interface DropdownInputRowProps {
    field: CustomField | CustomFieldInput
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
    isDisabled?: boolean
}

export function DropdownInputRow({
    field,
    value,
    position,
    id,
    nextId,
    error,
    isLast,
    isDisabled = false,
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
            className={isLast && !isDisabled ? css.lastInput : css.input}
            style={{opacity: isDragging ? 0.3 : 1}}
        >
            <div className={css.inputContainer}>
                {!isDisabled && (
                    <>
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
                    </>
                )}
                <TextInput
                    id={id}
                    value={value}
                    placeholder={
                        field.managed_type
                            ? placeholders[field.managed_type]
                            : defaultPlaceholder
                    }
                    onChange={(val) => onChange(position, val)}
                    hasError={!!error}
                    data-testid={id}
                    onKeyDown={handleEnterKeyDown}
                    isDisabled={isDisabled}
                />
                {!isLast && !isDisabled && (
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
