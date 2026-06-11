import { useCallback, useMemo, useRef, useState } from 'react'

import { useShortcuts } from '@repo/utils'
import cn from 'classnames'
import type { Moment } from 'moment'

import { Button, Tooltip, TooltipContent } from '@gorgias/axiom'

import { useAppSelector } from 'hooks/useAppSelector'
import { Dropdown } from 'pages/common/components/dropdown/Dropdown'
import { DefaultExportDropdownBody as DropdownBody } from 'pages/common/components/dropdown/DropdownBody'
import { DefaultExportDropdownItem as DropdownItem } from 'pages/common/components/dropdown/DropdownItem'
import { getTimezone } from 'state/currentUser/selectors'

import { TicketSnoozePicker } from './TicketDetails/TicketSnoozePicker'

import css from './Snooze.less'

type Props = {
    until?: string
    onUpdate: (until: Moment | null) => void
    disabled?: boolean
}

export function Snooze({ disabled = false, until, onUpdate }: Props) {
    const [showDropdown, setShowDropdown] = useState(false)
    const [showPicker, setShowPicker] = useState(false)
    const timezone = useAppSelector(getTimezone)

    const toggleRef = useRef<HTMLButtonElement>(null)

    const isSnoozed = !!until
    const handleClick = useCallback(() => {
        if (!isSnoozed) {
            setShowPicker((s) => !s)
            return
        }

        setShowDropdown((s) => !s)
    }, [isSnoozed])

    const handleClickClear = useCallback(() => {
        onUpdate(null)
    }, [onUpdate])

    const handleToggleDropdown = useCallback(() => {
        setShowDropdown((s) => !s)
    }, [])

    const handleTogglePicker = useCallback(() => {
        setShowPicker((s) => !s)
    }, [])

    const handleShowSnoozePicker = useCallback(() => {
        setShowPicker(true)
    }, [])

    const actions = useMemo(() => {
        if (disabled) {
            return {
                OPEN_SNOOZE_TICKET: {
                    action: () => ({}),
                },
                CLOSE_SNOOZE_TICKET: {
                    key: 'esc',
                    action: () => ({}),
                },
            }
        }

        return {
            OPEN_SNOOZE_TICKET: {
                action: () => {
                    setShowPicker(true)
                },
            },
            CLOSE_SNOOZE_TICKET: {
                key: 'esc',
                action: () => {
                    setShowPicker(false)
                },
            },
        }
    }, [disabled])

    useShortcuts('TicketDetailContainer', actions)

    const snoozeButton = (
        <Button
            ref={toggleRef}
            aria-label="Snooze"
            className={css.button}
            icon={<i className={cn(css.icon, 'material-icons')}>snooze</i>}
            isDisabled={disabled}
            onClick={handleClick}
            size="sm"
            variant="tertiary"
        />
    )

    return (
        <>
            {!showPicker ? (
                <Tooltip
                    delay={0}
                    placement="bottom right"
                    trigger={snoozeButton}
                >
                    <TooltipContent
                        title={
                            disabled
                                ? 'Not available in standalone mode'
                                : 'Snooze ticket'
                        }
                    />
                </Tooltip>
            ) : (
                snoozeButton
            )}
            <TicketSnoozePicker
                datetime={until}
                timezone={timezone}
                isOpen={showPicker}
                toggle={handleTogglePicker}
                onSubmit={onUpdate}
            >
                <span className={css.pickerAnchor} />
            </TicketSnoozePicker>
            <Dropdown
                isOpen={showDropdown}
                offset={4}
                placement="bottom-end"
                target={toggleRef}
                onToggle={handleToggleDropdown}
            >
                <DropdownBody>
                    <DropdownItem
                        onClick={handleShowSnoozePicker}
                        option={{ label: '', value: '' }}
                        shouldCloseOnSelect
                    >
                        <i
                            className={cn(
                                css.icon,
                                css.optionIcon,
                                'material-icons',
                            )}
                        >
                            update
                        </i>
                        Change snooze time
                    </DropdownItem>
                    <DropdownItem
                        onClick={handleClickClear}
                        option={{ label: '', value: '' }}
                        shouldCloseOnSelect
                    >
                        <i
                            className={cn(
                                css.icon,
                                css.optionIcon,
                                'material-icons',
                            )}
                        >
                            alarm_off
                        </i>
                        Clear snooze
                    </DropdownItem>
                </DropdownBody>
            </Dropdown>
        </>
    )
}
