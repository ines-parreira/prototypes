import type { ReactElement, ReactNode } from 'react'
import { useCallback, useRef, useState } from 'react'

import {
    Button,
    ButtonSize,
    ButtonVariant,
    Intent,
    Menu,
    MenuItem,
} from '@gorgias/axiom'

import { EditableField } from '../EditableField'
import { CopyButton } from './CopyButton'

import css from './EditableMenuField.less'

type EditableMenuFieldProps = {
    id?: string
    value?: string
    onValueChange: (value: string) => unknown
    onBlur: (value: string) => void
    placeholder?: string
    renderTrigger: (value: string) => ReactElement
    validator?: (value: string) => string | undefined
    className?: string
    name: string
    onDelete?: () => void
    children?: ReactNode
    ariaLabel?: string
    isReadOnly?: boolean
}

export function EditableMenuField(props: EditableMenuFieldProps) {
    const {
        id,
        value,
        onValueChange,
        onBlur,
        placeholder = '+ Add',
        renderTrigger,
        validator,
        className,
        name,
        onDelete,
        children,
        ariaLabel,
        isReadOnly = false,
    } = props

    const [isEditing, setIsEditing] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const fieldRef = useRef<HTMLDivElement>(null)

    const handleEditClick = useCallback(() => {
        if (isReadOnly) {
            return
        }

        setIsEditing(true)
    }, [isReadOnly])

    const handleValueChange = useCallback(
        (newValue: string) => {
            if (isReadOnly) {
                return
            }

            onValueChange(newValue)
        },
        [isReadOnly, onValueChange],
    )

    const handleBlur = useCallback(
        (value: string) => {
            if (isReadOnly) {
                setIsEditing(false)
                return
            }

            onBlur(value)
            setIsEditing(false)
        },
        [isReadOnly, onBlur],
    )

    if (isEditing || !value) {
        return (
            <div ref={fieldRef}>
                <EditableField
                    id={id}
                    value={value}
                    onValueChange={handleValueChange}
                    placeholder={placeholder}
                    validator={validator}
                    className={className}
                    autoFocus={isEditing}
                    onBlur={handleBlur}
                    ariaLabel={ariaLabel}
                    isReadOnly={isReadOnly}
                />
            </div>
        )
    }

    return (
        <div>
            <Menu
                aria-labelledby={id}
                aria-label="Field actions"
                trigger={
                    <div className={css.triggerContainer}>
                        <Button
                            variant={ButtonVariant.Tertiary}
                            size={ButtonSize.Sm}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            trailingSlot={
                                <CopyButton
                                    value={value}
                                    isVisible={isHovered}
                                />
                            }
                        >
                            {renderTrigger(value)}
                        </Button>
                    </div>
                }
                placement="bottom right"
            >
                {children}
                {!isReadOnly && (
                    <>
                        <MenuItem
                            label={`Edit ${name}`}
                            leadingSlot="edit-pencil"
                            onAction={handleEditClick}
                        />
                        {onDelete && (
                            <MenuItem
                                label={`Delete ${name}`}
                                intent={Intent.Destructive}
                                leadingSlot="trash-empty"
                                onAction={onDelete}
                            />
                        )}
                    </>
                )}
            </Menu>
        </div>
    )
}
