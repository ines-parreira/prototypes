import { createContext, ReactNode, useContext, useRef, useState } from 'react'

import { IconButton } from '@gorgias/merchant-ui-kit'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import IconInput from 'pages/common/forms/input/IconInput'
import css from 'pages/stats/common/components/ActionMenu.less'

export const ACTION_MENU_LABEL = 'Actions'

type ActionMenuItemProps = {
    label: string
    description?: string
    prefix?: ReactNode
    onClick: () => void
    isDisabled?: boolean
}

export const ActionMenuItem = ({
    label,
    description,
    prefix,
    onClick,
    isDisabled,
}: ActionMenuItemProps) => {
    return (
        <DropdownItem
            isDisabled={isDisabled}
            option={{ label, value: '' }}
            shouldCloseOnSelect
            className={css.item}
            onClick={onClick}
        >
            {prefix}
            <div className={css.itemContent}>
                <div className={css.label}>{label}</div>
                {description && (
                    <div className={css.description}>{description}</div>
                )}
            </div>
        </DropdownItem>
    )
}

export const ActionMenuLabel = ({ children }: { children: ReactNode }) => {
    return <div className={css.category}>{children}</div>
}

const actionMenuSelectGroupContext = createContext<{
    value: any
    onValueChange: (value: any) => void
} | null>(null)

const useActionMenuSelectGroup = () => {
    const context = useContext(actionMenuSelectGroupContext)
    if (!context) {
        throw new Error(
            'useActionMenuSelectGroup must be used within a ActionMenuSelectGroup',
        )
    }
    return context
}

export const ActionMenuSelectGroup = <T extends any>({
    children,
    value,
    onValueChange,
}: {
    children: ReactNode
    value: T
    onValueChange: (value: T) => void
}) => {
    return (
        <actionMenuSelectGroupContext.Provider value={{ value, onValueChange }}>
            <div>{children}</div>
        </actionMenuSelectGroupContext.Provider>
    )
}

export const ActionMenuSelectItem = <T extends string>({
    label,
    description,
    value,
    isDisabled,
    prefix,
}: {
    label: string
    description?: string
    value: T
    isDisabled?: boolean
    prefix?: ReactNode
}) => {
    const context = useActionMenuSelectGroup()
    const isSelected = context.value === value

    return (
        <DropdownItem
            className={css.item}
            onClick={() => context.onValueChange(value)}
            option={{ label, value }}
            shouldCloseOnSelect
            isDisabled={isDisabled}
        >
            {prefix}
            <div className={css.itemContent}>
                <div className={css.label}>{label}</div>
                {description && (
                    <div className={css.description}>{description}</div>
                )}
            </div>
            <div className={css.checkContainer}>
                {isSelected && (
                    <IconInput icon="check" className={css.itemIcon} />
                )}
            </div>
        </DropdownItem>
    )
}

export const ActionMenuSeparator = () => <div className={css.separator} />

export const ActionMenu = ({
    children,
    canduId,
}: {
    children: ReactNode
    canduId?: string
}) => {
    const triggerRef = useRef<HTMLButtonElement>(null)

    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <IconButton
                as="button"
                ref={triggerRef}
                intent="secondary"
                fillStyle="ghost"
                icon="more_vert"
                onClick={() => setIsOpen(true)}
                aria-label={ACTION_MENU_LABEL}
                data-candu-id={canduId}
            />
            <Dropdown
                target={triggerRef}
                isOpen={isOpen}
                onToggle={setIsOpen}
                placement="bottom-end"
                offset={4}
            >
                <DropdownBody>{children}</DropdownBody>
            </Dropdown>
        </>
    )
}
