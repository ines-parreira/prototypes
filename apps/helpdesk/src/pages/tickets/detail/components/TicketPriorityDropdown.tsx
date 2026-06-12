import { useCallback, useRef, useState } from 'react'
import { Button, Tooltip, TooltipContent } from '@gorgias/axiom'
import { TicketPriority } from '@gorgias/helpdesk-types'
import { capitalize } from '@gorgias/toolkit'

import { Dropdown } from 'pages/common/components/dropdown/Dropdown'
import { DefaultExportDropdownBody as DropdownBody } from 'pages/common/components/dropdown/DropdownBody'
import { DefaultExportDropdownItem as DropdownItem } from 'pages/common/components/dropdown/DropdownItem'
import { PriorityIcon } from 'pages/tickets/common/components/PriorityIcon'

import css from './TicketPriorityDropdown.less'

const PRIORITY_OPTIONS: TicketPriority[] = Object.values(TicketPriority)

const TicketPriorityDropdown = ({
    disabled = false,
    priority,
    onPriorityChange,
}: {
    disabled?: boolean
    priority: TicketPriority
    onPriorityChange: (priority: TicketPriority) => void
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)

    const handleToggleDropdown = useCallback(() => {
        setIsOpen((s) => !s)
    }, [])

    const handlePriorityChange = useCallback(
        (priority: TicketPriority) => {
            onPriorityChange(priority)
        },
        [onPriorityChange],
    )

    const button = (
        <Button
            className={css.button}
            size="sm"
            variant="tertiary"
            leadingSlot={<PriorityIcon priority={priority} />}
            onClick={handleToggleDropdown}
            ref={buttonRef}
            isDisabled={disabled}
        >
            {priority}
        </Button>
    )

    return (
        <>
            <Tooltip delay={0} placement="bottom" trigger={button}>
                <TooltipContent
                    title={
                        disabled
                            ? 'Not available in standalone mode'
                            : 'Change priority'
                    }
                />
            </Tooltip>
            <Dropdown
                isOpen={isOpen}
                offset={4}
                placement="bottom-end"
                target={buttonRef}
                onToggle={handleToggleDropdown}
                value={priority}
            >
                <DropdownBody>
                    {PRIORITY_OPTIONS.map((option) => (
                        <DropdownItem
                            key={option}
                            onClick={handlePriorityChange}
                            option={{
                                label: capitalize(option),
                                value: option,
                            }}
                            shouldCloseOnSelect
                        >
                            <PriorityIcon priority={option} />
                            <span className={css.label}>
                                {capitalize(option)}
                            </span>
                        </DropdownItem>
                    ))}
                </DropdownBody>
            </Dropdown>
        </>
    )
}

export { TicketPriorityDropdown }
