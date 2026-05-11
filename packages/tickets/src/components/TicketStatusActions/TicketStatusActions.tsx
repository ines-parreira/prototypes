import { useCallback, useMemo, useState } from 'react'

import type { ZonedDateTime } from '@internationalized/date'
import { parseAbsolute, parseAbsoluteToLocal } from '@internationalized/date'
import moment from 'moment'

import {
    Box,
    Button,
    Color,
    DatePicker,
    DatePickerChangeEventSource,
    Icon,
    Menu,
    MenuItem,
    MenuPlacement,
    MenuSize,
    ShortcutKey,
    StatusButton,
    SubMenu,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import { useGetCurrentUser } from '@gorgias/helpdesk-queries'
import type { Ticket } from '@gorgias/helpdesk-types'

import { TicketStatusTrigger } from './TicketStatusTrigger'
import { useAutoOpenSnoozeSubmenu } from './useAutoOpenSnoozeSubmenu'
import { useCloseTicket } from './useCloseTicket'
import { useOpenTicket } from './useOpenTicket'
import { useSnoozeTicket } from './useSnoozeTicket'
import { useTicketStatusShortcuts } from './useTicketStatusShortcuts'
import {
    disableDatesBeforeToday,
    getRemainingSnoozeTime,
    getSnoozeTooltipTitle,
    getTicketStatus,
    TicketStatus,
} from './utils'

type TicketStatusActionsProps = {
    ticket: Ticket
}

export function TicketStatusActions({ ticket }: TicketStatusActionsProps) {
    const { data: currentUser } = useGetCurrentUser()
    const [isSnoozeMenuOpen, setIsSnoozeMenuOpen] = useState(false)
    const [snoozeDate, setSnoozeDate] = useState<Date | null>(null)
    const status = getTicketStatus(ticket)

    const openSnoozeSubmenu = useAutoOpenSnoozeSubmenu()
    const { snoozeTicket } = useSnoozeTicket(ticket.id)
    const { openTicket } = useOpenTicket(ticket.id)
    const { closeTicket } = useCloseTicket(ticket.id)

    const handleSnoozeChange = useCallback(
        async (
            value: ZonedDateTime | null,
            context?: DatePickerChangeEventSource,
        ) => {
            const snooze_datetime = value?.toDate()
                ? moment(value.toDate()).format()
                : null

            switch (context) {
                case DatePickerChangeEventSource.Preset:
                    setSnoozeDate(null)
                    setIsSnoozeMenuOpen(false)
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
        if (!snoozeDate) return

        setSnoozeDate(null)
        setIsSnoozeMenuOpen(false)

        await snoozeTicket({
            snooze_datetime: moment(snoozeDate).format(),
            status: TicketStatus.Closed,
        })
    }, [snoozeDate, snoozeTicket])

    const handleSnoozeMenuOpenChange = useCallback((isOpen: boolean) => {
        setIsSnoozeMenuOpen(isOpen)
        setSnoozeDate(null)
    }, [])

    const handleOpenSnooze = useCallback(() => {
        setIsSnoozeMenuOpen(true)
        if (status === TicketStatus.Snoozed) {
            openSnoozeSubmenu()
        }
    }, [openSnoozeSubmenu, status])

    useTicketStatusShortcuts({
        ticket,
        onOpenSnooze: handleOpenSnooze,
    })

    const handleCloseTicket = useCallback(async () => {
        await closeTicket()
    }, [closeTicket])

    const handleOpenTicket = useCallback(async () => {
        setIsSnoozeMenuOpen(false)
        await openTicket()
    }, [openTicket])

    const snoozeDateValue = useMemo(() => {
        if (snoozeDate) {
            if (currentUser?.data?.timezone) {
                return parseAbsolute(
                    moment(snoozeDate).format(),
                    currentUser.data.timezone,
                )
            }

            return parseAbsoluteToLocal(moment(snoozeDate).format())
        }

        if (ticket.snooze_datetime) {
            if (currentUser?.data?.timezone) {
                return parseAbsolute(
                    ticket.snooze_datetime,
                    currentUser.data.timezone,
                )
            }

            return parseAbsoluteToLocal(ticket.snooze_datetime)
        }

        return null
    }, [currentUser?.data?.timezone, snoozeDate, ticket.snooze_datetime])

    const snoozeTrigger =
        status === TicketStatus.Snoozed ? (
            <StatusButton
                aria-label="Change snooze time"
                color={Color.Blue}
                leadingSlot="timer-snooze"
                trailingSlot={
                    <Icon
                        name={
                            isSnoozeMenuOpen
                                ? 'arrow-chevron-up'
                                : 'arrow-chevron-down'
                        }
                        size="xs"
                    />
                }
            >
                {getRemainingSnoozeTime(ticket.snooze_datetime)}
            </StatusButton>
        ) : (
            <Button
                size="sm"
                variant="secondary"
                icon="timer-snooze"
                aria-label="Snooze ticket"
            />
        )

    const snoozePicker = (
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
                        !snoozeDate || moment(snoozeDate).isBefore(moment())
                    }
                >
                    Apply
                </Button>
            </DatePicker>
        </MenuItem>
    )

    return (
        <Box alignItems="center" gap="xs">
            <Tooltip
                placement="bottom"
                trigger={
                    <Menu
                        isOpen={isSnoozeMenuOpen}
                        onOpenChange={handleSnoozeMenuOpenChange}
                        placement={MenuPlacement.BottomLeft}
                        size={MenuSize.Sm}
                        aria-label="Snooze ticket"
                        trigger={snoozeTrigger}
                    >
                        {status === TicketStatus.Snoozed ? (
                            <>
                                <MenuItem
                                    id="unsnooze-ticket"
                                    label="Unsnooze"
                                    leadingSlot="close-circle"
                                    onAction={handleOpenTicket}
                                />
                                <SubMenu
                                    asSlot
                                    id="update-snooze"
                                    label={
                                        <Box alignItems="center" gap="xxs">
                                            <Text size="sm">Update snooze</Text>
                                            <ShortcutKey>B</ShortcutKey>
                                        </Box>
                                    }
                                    leadingSlot="timer-snooze"
                                >
                                    {snoozePicker}
                                </SubMenu>
                            </>
                        ) : (
                            snoozePicker
                        )}
                    </Menu>
                }
            >
                {status === TicketStatus.Snoozed ? (
                    <TooltipContent
                        title={getSnoozeTooltipTitle(ticket.snooze_datetime)}
                        caption="Click to update"
                    />
                ) : (
                    <TooltipContent>
                        <Box alignItems="center" gap="xxxs">
                            <Text size="sm" variant="bold">
                                Snooze ticket <ShortcutKey>B</ShortcutKey>
                            </Text>
                        </Box>
                    </TooltipContent>
                )}
            </Tooltip>
            <TicketStatusTrigger
                ticket={ticket}
                onCloseTicket={handleCloseTicket}
                onOpenTicket={handleOpenTicket}
            />
        </Box>
    )
}
