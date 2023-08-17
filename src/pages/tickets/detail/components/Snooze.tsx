import cn from 'classnames'
import {Moment} from 'moment'
import React, {useCallback, useMemo, useRef, useState} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import useShortcuts from 'hooks/useShortcuts'
import {getTimezone} from 'state/currentUser/selectors'

import Button from 'pages/common/components/button/Button'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import Tooltip from 'pages/common/components/Tooltip'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'

import TicketSnoozePicker from './TicketDetails/TicketSnoozePicker'
import css from './Snooze.less'

type Props = {
    until?: string
    onUpdate: (until: Moment | null) => void
}

export default function Snooze({until, onUpdate}: Props) {
    const [showDropdown, setShowDropdown] = useState(false)
    const [showPicker, setShowPicker] = useState(false)
    const timezone = useAppSelector(getTimezone)

    const toggleRef = useRef<HTMLButtonElement>(null)

    const isSnoozed = !!until
    const handleClick = useCallback(() => {
        logEvent(SegmentEvent.SnoozeButtonClicked, {isSnoozed})
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

    const actions = useMemo(
        () => ({
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
        }),
        []
    )

    useShortcuts('TicketDetailContainer', actions)

    return (
        <>
            <Button
                ref={toggleRef}
                className={css.button}
                fillStyle="ghost"
                id="snooze-button"
                intent="secondary"
                onClick={handleClick}
            >
                <i className={cn(css.icon, 'material-icons')}>snooze</i>
            </Button>
            <Tooltip placement="bottom-end" target="snooze-button">
                Snooze ticket
            </Tooltip>
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
                        option={{label: '', value: ''}}
                        shouldCloseOnSelect
                    >
                        <i
                            className={cn(
                                css.icon,
                                css.optionIcon,
                                'material-icons'
                            )}
                        >
                            update
                        </i>
                        Change snooze time
                    </DropdownItem>
                    <DropdownItem
                        onClick={handleClickClear}
                        option={{label: '', value: ''}}
                        shouldCloseOnSelect
                    >
                        <i
                            className={cn(
                                css.icon,
                                css.optionIcon,
                                'material-icons'
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
