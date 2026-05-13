import type { CSSProperties } from 'react'
import { useCallback, useRef, useState } from 'react'

import {
    Button,
    DropdownIcon,
    Menu,
    MenuItem,
    MultiButton,
} from '@gorgias/axiom'

import { TicketStatus } from '../../../../../../types/ticket'

type BulkStatusSelectProps = {
    onChange: (status: TicketStatus) => void | Promise<void>
    isDisabled?: boolean
}

const MENU_CONTAINER_STYLE: CSSProperties = {
    height: 0,
    overflow: 'hidden',
    position: 'absolute',
    width: 0,
}

const HIDDEN_MENU_TRIGGER_STYLE: CSSProperties = {
    height: 0,
    opacity: 0,
    overflow: 'hidden',
    pointerEvents: 'none',
    position: 'absolute',
    width: 0,
}

const ROOT_CONTAINER_STYLE: CSSProperties = {
    display: 'inline-flex',
    position: 'relative',
}

export function BulkStatusSelect({
    onChange,
    isDisabled = false,
}: BulkStatusSelectProps) {
    const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false)
    const statusMenuTriggerRef = useRef<HTMLButtonElement>(null)

    const handleStatusMenuOpenChange = useCallback((open: boolean) => {
        setIsStatusMenuOpen(open)
    }, [])

    const handleStatusMenuButtonClick = useCallback(() => {
        setIsStatusMenuOpen((isOpen) => !isOpen)
    }, [])

    return (
        <div style={ROOT_CONTAINER_STYLE}>
            <MultiButton variant="secondary" size="sm">
                <Button
                    isDisabled={isDisabled}
                    onClick={() => onChange(TicketStatus.Closed)}
                >
                    Close
                </Button>
                <Button
                    ref={statusMenuTriggerRef}
                    aria-label="More status actions"
                    icon={<DropdownIcon isOpen={isStatusMenuOpen} />}
                    isDisabled={isDisabled}
                    onClick={handleStatusMenuButtonClick}
                />
            </MultiButton>
            {!isDisabled && (
                <span style={MENU_CONTAINER_STYLE}>
                    <Menu
                        aria-label="Status actions"
                        isOpen={isStatusMenuOpen}
                        onOpenChange={handleStatusMenuOpenChange}
                        placement="bottom left"
                        size="sm"
                        trigger={
                            <Button
                                aria-label="Open status actions menu"
                                aria-hidden
                                excludeFromTabOrder
                                icon={<DropdownIcon isOpen={false} />}
                                style={HIDDEN_MENU_TRIGGER_STYLE}
                            />
                        }
                        triggerRef={statusMenuTriggerRef}
                    >
                        <MenuItem
                            id="open"
                            label="Open"
                            onAction={() => onChange(TicketStatus.Open)}
                        />
                    </Menu>
                </span>
            )}
        </div>
    )
}
