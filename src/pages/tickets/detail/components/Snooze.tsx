import {Moment} from 'moment'
import React, {Fragment, useCallback, useState} from 'react'
import {
    Button,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledDropdown,
} from 'reactstrap'

import useAppSelector from 'hooks/useAppSelector'
import {getTimezone} from 'state/currentUser/selectors'

import TicketSnoozePicker from './TicketDetails/TicketSnoozePicker'

type Props = {
    until?: string
    onUpdate: (until: Moment | null) => void
}

export default function Snooze({until, onUpdate}: Props) {
    const [showPicker, setShowPicker] = useState(false)
    const timezone = useAppSelector(getTimezone)

    const handleToggle = useCallback(() => {
        setShowPicker((s) => !s)
    }, [])

    const handleClickClear = useCallback(() => {
        onUpdate(null)
    }, [onUpdate])

    const snoozePicker = (
        <TicketSnoozePicker
            datetime={until}
            timezone={timezone}
            isOpen={showPicker}
            toggle={handleToggle}
            onSubmit={onUpdate}
        />
    )

    const isSnoozed = !!until
    /**
     * The DropdownToggle component comes from reactstrap and uses
     * reactstrap's Button component under the hood, so in order to
     * keep the same look and feel, we use that button here.
     *
     * Unfortunately, it is not possible to prevent the DropdownToggle
     * from opening the dropdown, so I've had to separate this case here
     */
    if (!isSnoozed) {
        return (
            <Fragment>
                <Button
                    className="btn-transparent"
                    color="secondary"
                    id="ticket-snooze-button"
                    size="sm"
                    type="button"
                    onClick={handleToggle}
                >
                    <i className="material-icons md-2">snooze</i>
                </Button>
                {snoozePicker}
            </Fragment>
        )
    }

    return (
        <UncontrolledDropdown>
            <DropdownToggle
                className="btn-transparent"
                color="secondary"
                id="ticket-snooze-button"
                size="sm"
                type="button"
            >
                <i className="material-icons md-2">snooze</i>
            </DropdownToggle>
            {snoozePicker}
            <DropdownMenu right>
                <DropdownItem type="button" onClick={handleToggle}>
                    <i className="icon material-icons">snooze</i>
                    Change snooze time
                </DropdownItem>
                {isSnoozed && (
                    <DropdownItem type="button" onClick={handleClickClear}>
                        <i className="icon material-icons">timer_off</i>
                        Clear snooze
                    </DropdownItem>
                )}
            </DropdownMenu>
        </UncontrolledDropdown>
    )
}
