import cn from 'classnames'
import {Moment} from 'moment'
import React, {useCallback, useRef, useState} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {getTimezone} from 'state/currentUser/selectors'

import Button from 'pages/common/components/button/Button'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'

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

    const handleShowSnoozePicker = useCallback(() => {
        setShowPicker(true)
    }, [])

    return (
        <>
            <Button
                ref={toggleRef}
                className={css.button}
                fillStyle="ghost"
                intent="secondary"
                onClick={handleClick}
            >
                <i className={cn(css.icon, 'material-icons')}>snooze</i>
            </Button>
            <TicketSnoozePicker
                datetime={until}
                timezone={timezone}
                isOpen={showPicker}
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
