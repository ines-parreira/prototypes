import { useCallback, useMemo, useState } from 'react'

import type { ZonedDateTime } from '@internationalized/date'
import { parseAbsolute, parseAbsoluteToLocal } from '@internationalized/date'
import moment from 'moment'

import {
    Button,
    Color,
    DatePicker,
    DatePickerChangeEventSource,
    Icon,
    IconName,
    Menu,
    MenuItem,
    MenuPlacement,
    MenuSize,
    SubMenu,
} from '@gorgias/axiom'
import { useGetCurrentUser } from '@gorgias/helpdesk-queries'
import type { Ticket } from '@gorgias/helpdesk-types'

import { TicketStatusTrigger } from './TicketStatusTrigger'
import { useCloseTicket } from './useCloseTicket'
import { useOpenTicket } from './useOpenTicket'
import { useSnoozeTicket } from './useSnoozeTicket'
import { useTicketStatusShortcuts } from './useTicketStatusShortcuts'
import { disableDatesBeforeToday, getTicketStatus, TicketStatus } from './utils'

type TicketStatusMenuProps = {
    ticket: Ticket
}

export function TicketStatusMenu({ ticket }: TicketStatusMenuProps) {
    const { data: currentUser } = useGetCurrentUser()
    const [isOpen, setIsOpen] = useState(false)
    const [snoozeDate, setSnoozeDate] = useState<Date | null>(null)
    const status = getTicketStatus(ticket)
    useTicketStatusShortcuts(ticket)

    const { snoozeTicket } = useSnoozeTicket(ticket.id)
    const { openTicket } = useOpenTicket(ticket.id)
    const { closeTicket } = useCloseTicket(ticket.id)

    const handleSnoozeChange = useCallback(
        async (
            value: ZonedDateTime | null,
            context?: DatePickerChangeEventSource | undefined,
        ) => {
            const snooze_datetime = value?.toDate()
                ? moment(value.toDate()).format()
                : null
            switch (context) {
                case DatePickerChangeEventSource.Preset:
                    setSnoozeDate(null)
                    setIsOpen(false)
                    await snoozeTicket({
                        snooze_datetime,
                        status: TicketStatus.Closed,
                    })
                    break
                case DatePickerChangeEventSource.Calendar:
                case DatePickerChangeEventSource.TimePicker:
                    setSnoozeDate(value?.toDate() ?? null)
                    break
                default:
                    return
            }
        },
        [snoozeTicket],
    )

    const handleSnoozeApply = useCallback(async () => {
        if (!snoozeDate) {
            return
        }
        const snooze_datetime = moment(snoozeDate).format()
        setSnoozeDate(null)
        setIsOpen(false)
        await snoozeTicket({
            snooze_datetime,
            status: TicketStatus.Closed,
        })
    }, [snoozeTicket, snoozeDate, setIsOpen, setSnoozeDate])

    const handleCloseTicket = useCallback(async () => {
        setIsOpen(false)
        await closeTicket()
    }, [closeTicket])

    const handleOpenTicket = useCallback(async () => {
        setIsOpen(false)
        await openTicket()
    }, [openTicket])

    const handleMenuOpenChange = useCallback((isOpen: boolean) => {
        setIsOpen(isOpen)
        setSnoozeDate(null)
    }, [])

    const snoozeDateValue = useMemo(() => {
        if (snoozeDate) {
            if (currentUser?.data?.timezone) {
                return parseAbsolute(
                    moment(snoozeDate).format(),
                    currentUser?.data?.timezone,
                )
            }
            return parseAbsoluteToLocal(moment(snoozeDate).format())
        }

        if (ticket.snooze_datetime) {
            if (currentUser?.data?.timezone) {
                return parseAbsolute(
                    ticket.snooze_datetime,
                    currentUser?.data?.timezone,
                )
            }
            return parseAbsoluteToLocal(ticket.snooze_datetime)
        }

        return null
    }, [ticket.snooze_datetime, snoozeDate, currentUser?.data?.timezone])

    return (
        <Menu
            isOpen={isOpen}
            onOpenChange={handleMenuOpenChange}
            placement={MenuPlacement.BottomLeft}
            trigger={<TicketStatusTrigger ticket={ticket} />}
            selectionMode="single"
            selectedKeys={new Set([status])}
            size={MenuSize.Sm}
        >
            <>
                <MenuItem
                    id={TicketStatus.Open}
                    label={status === TicketStatus.Open ? 'Open' : 'Reopen'}
                    leadingSlot={
                        <Icon name={IconName.Inbox} color={Color.Purple} />
                    }
                    onAction={handleOpenTicket}
                />
                <SubMenu
                    asSlot
                    id={TicketStatus.Snoozed}
                    label={
                        status === TicketStatus.Snoozed
                            ? 'Change snooze time'
                            : 'Snooze'
                    }
                    leadingSlot={
                        <Icon name={IconName.TimerSnooze} color={Color.Blue} />
                    }
                >
                    <MenuItem asSlot>
                        <DatePicker
                            withoutPopover
                            withTimePicker
                            presets="next-week"
                            isDateUnavailable={disableDatesBeforeToday}
                            value={snoozeDateValue}
                            onChange={handleSnoozeChange}
                        >
                            <Button
                                size="sm"
                                onClick={handleSnoozeApply}
                                isDisabled={
                                    !snoozeDate ||
                                    moment(snoozeDate).isBefore(moment())
                                }
                            >
                                Apply
                            </Button>
                        </DatePicker>
                    </MenuItem>
                </SubMenu>
                <MenuItem
                    id={TicketStatus.Closed}
                    label="Close"
                    leadingSlot={<Icon name={IconName.CircleCheck} />}
                    onAction={handleCloseTicket}
                />
            </>
        </Menu>
    )
}
