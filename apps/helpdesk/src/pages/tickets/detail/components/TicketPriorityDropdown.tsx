import { useCallback, useRef, useState } from 'react'

import _capitalize from 'lodash/capitalize'

import { TicketPriority } from '@gorgias/helpdesk-types'
import { Button, Tooltip } from '@gorgias/merchant-ui-kit'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import { PriorityIcon } from 'pages/tickets/common/components/PriorityIcon'

import css from './TicketPriorityDropdown.less'

const PRIORITY_OPTIONS: TicketPriority[] = Object.values(TicketPriority)

const TicketPriorityDropdown = ({
    priority,
    onPriorityChange,
}: {
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

    return (
        <>
            <Button
                className={css.button}
                size="small"
                intent="secondary"
                fillStyle="ghost"
                leadingIcon={<PriorityIcon priority={priority} />}
                onClick={handleToggleDropdown}
                ref={buttonRef}
            >
                {priority}
            </Button>
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
                                label: _capitalize(option),
                                value: option,
                            }}
                            shouldCloseOnSelect
                        >
                            <PriorityIcon priority={option} />
                            <span className={css.label}>
                                {_capitalize(option)}
                            </span>
                        </DropdownItem>
                    ))}
                </DropdownBody>
            </Dropdown>
            <Tooltip target={buttonRef}>Change priority</Tooltip>
        </>
    )
}

export default TicketPriorityDropdown
