import { useCallback, useRef, useState } from 'react'

import cn from 'classnames'
import _capitalize from 'lodash/capitalize'

import { TicketPriority } from '@gorgias/helpdesk-types'
import { Button } from '@gorgias/merchant-ui-kit'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'

import css from './TicketPriorityDropdown.less'

const PRIORITY_OPTIONS: TicketPriority[] =
    Object.values(TicketPriority).reverse()

const PRIORITY_TO_ICON: Record<TicketPriority, string> = {
    low: 'keyboard_arrow_down',
    normal: 'drag_handle',
    high: 'keyboard_arrow_up',
    critical: 'keyboard_double_arrow_up',
}

const PRIORITY_TO_COLOR: Record<TicketPriority, string> = {
    low: 'neutral-grey-4',
    normal: 'neutral-grey-5',
    high: 'feedback-warning-4',
    critical: 'feedback-error-4',
}

const PriorityIcon = ({ priority }: { priority: TicketPriority }) => (
    <i
        className={cn(css.icon, 'material-icons')}
        style={{ color: `var(--${PRIORITY_TO_COLOR[priority]})` }}
    >
        {PRIORITY_TO_ICON[priority]}
    </i>
)

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
        </>
    )
}

export default TicketPriorityDropdown
