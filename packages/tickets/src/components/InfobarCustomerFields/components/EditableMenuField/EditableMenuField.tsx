import type { ReactElement, ReactNode } from 'react'
import { useCallback, useRef, useState } from 'react'

import {
    Button,
    ButtonSize,
    ButtonVariant,
    IconName,
    Intent,
    Menu,
    MenuItem,
} from '@gorgias/axiom'

import { EditableField } from '../EditableField'
import { CopyButton } from './CopyButton'

import css from './EditableMenuField.less'

type EditableMenuFieldProps = {
    value?: string
    onValueChange: (value: string) => unknown
    placeholder?: string
    renderTrigger: (value: string) => ReactElement
    validator?: (value: string) => string | undefined
    className?: string
    name: string
    onDelete?: () => void
    children?: ReactNode
    ariaLabel?: string
}

export function EditableMenuField(props: EditableMenuFieldProps) {
    const {
        value,
        onValueChange,
        placeholder = '+ Add',
        renderTrigger,
        validator,
        className,
        name,
        onDelete,
        children,
        ariaLabel,
    } = props

    const [isEditing, setIsEditing] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const fieldRef = useRef<HTMLDivElement>(null)

    const handleEditClick = useCallback(() => {
        setIsEditing(true)
    }, [])

    const handleValueChange = useCallback(
        (newValue: string) => {
            onValueChange(newValue)
            setIsEditing(false)
        },
        [onValueChange],
    )

    const handleBlur = useCallback(() => {
        setIsEditing(false)
    }, [])

    if (isEditing || !value) {
        return (
            <div ref={fieldRef}>
                <EditableField
                    value={value}
                    onValueChange={handleValueChange}
                    placeholder={placeholder}
                    validator={validator}
                    className={className}
                    autoFocus={isEditing}
                    onBlur={handleBlur}
                    ariaLabel={ariaLabel}
                />
            </div>
        )
    }

    return (
        <div>
            <Menu
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
                <MenuItem
                    label={`Edit ${name}`}
                    leadingSlot={IconName.EditPencil}
                    onAction={handleEditClick}
                />
                {onDelete && (
                    <MenuItem
                        label={`Delete ${name}`}
                        intent={Intent.Destructive}
                        leadingSlot={IconName.TrashEmpty}
                        onAction={onDelete}
                    />
                )}
            </Menu>
        </div>
    )
}
