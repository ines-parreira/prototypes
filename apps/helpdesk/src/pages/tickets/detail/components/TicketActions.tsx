import { useCallback, useRef, useState } from 'react'

import cn from 'classnames'

import { LegacyButton as Button } from '@gorgias/axiom'

import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'

import css from './TicketActions.less'

type Intent = 'delete'
export type Action = [string, string, () => void, Intent?]

type Props = {
    actions: Action[]
}

export default function TicketActions({ actions }: Props) {
    const [showDropdown, setShowDropdown] = useState(false)
    const toggleRef = useRef<HTMLButtonElement>(null)

    const handleClick = useCallback(() => {
        setShowDropdown((s) => !s)
    }, [])

    const handleToggleDropdown = useCallback(() => {
        setShowDropdown((s) => !s)
    }, [])

    return (
        <>
            <Button
                ref={toggleRef}
                className={css.button}
                fillStyle="ghost"
                id="ticket-actions-button"
                intent="secondary"
                onClick={handleClick}
                size="small"
            >
                <i className={cn(css.icon, 'material-icons')}>more_vert</i>
            </Button>
            <Dropdown
                isOpen={showDropdown}
                offset={4}
                placement="bottom-end"
                target={toggleRef}
                onToggle={handleToggleDropdown}
            >
                <DropdownBody>
                    {actions.map(([label, icon, callback, intent]) => {
                        const content = (
                            <>
                                <i
                                    className={cn(
                                        css.icon,
                                        css.optionIcon,
                                        'material-icons',
                                    )}
                                >
                                    {icon}
                                </i>
                                {label}
                            </>
                        )
                        return (
                            <DropdownItem
                                key={label}
                                onClick={() => {
                                    callback()
                                }}
                                option={{ label: '', value: '' }}
                                shouldCloseOnSelect
                            >
                                {intent === 'delete' ? (
                                    <div
                                        className={cn(
                                            'text-danger',
                                            css.intentDelete,
                                        )}
                                    >
                                        {content}
                                    </div>
                                ) : (
                                    content
                                )}
                            </DropdownItem>
                        )
                    })}
                </DropdownBody>
            </Dropdown>
        </>
    )
}
