import type { UserDateTimePreferences } from '@repo/preferences'

import {
    createColumnHelper,
    Dot,
    OverflowList,
    OverflowListItem,
    OverflowListShowLess,
    OverflowListShowMore,
    Tag,
} from '@gorgias/axiom'
import type { ColorValue, DataTableColumnDef } from '@gorgias/axiom'
import type { TicketCompact } from '@gorgias/helpdesk-types'

import type { DisplayTextValue } from '../../types/display'
import { AssigneeCell } from './components/AssigneeCell'
import { ChannelCell } from './components/ChannelCell'
import { CustomerCell } from './components/CustomerCell'
import { DateTimeCell } from './components/DateTimeCell'
import { PriorityCell } from './components/PriorityCell'
import { SingleLineTextCell } from './components/SingleLineTextCell'
import { SubjectOnlyCell } from './components/SubjectOnlyCell'
import { TicketCell } from './components/TicketCell'
import { TicketTableCellLink } from './components/TicketTableCellLink'

const STATUS_TAG_COLOR = {
    open: 'purple',
    snoozed: 'blue',
    closed: 'grey',
} as const

const STATUS_LABEL = {
    open: 'Open',
    snoozed: 'Snoozed',
    closed: 'Closed',
} as const

const languageDisplayNames = new Intl.DisplayNames(['en'], {
    type: 'language',
})

export type TicketTableRow = TicketCompact & {
    displayCustomer: DisplayTextValue
    displaySubject: DisplayTextValue
    displayExcerpt: DisplayTextValue
    displayTicketId: DisplayTextValue
}

const columnHelper = createColumnHelper<TicketTableRow>()

export type TicketTableColumnsParams = {
    currentUserId?: number
    dateTimePreferences: UserDateTimePreferences
    onNavigateToTicket?: (ticket: TicketTableRow) => void
}

export function createTicketTableColumns({
    currentUserId,
    dateTimePreferences,
    onNavigateToTicket,
}: TicketTableColumnsParams): DataTableColumnDef<TicketTableRow>[] {
    const getLinkProps = (cell: {
        column: unknown
        table: unknown
        row: { original: TicketTableRow }
    }) => {
        const ticket = cell.row.original

        return {
            column: cell.column as never,
            table: cell.table as never,
            to: `/app/ticket/${ticket.id}`,
            onNavigateToTicket: () => onNavigateToTicket?.(ticket),
        }
    }

    return [
        columnHelper.display({
            id: 'ticket',
            header: 'Ticket',
            enableSorting: false,
            enableHiding: false,
            size: 350,
            minSize: 350,
            maxSize: 350,
            cell: (cell) => {
                const ticket = cell.row.original

                return (
                    <TicketCell
                        ticketId={ticket.id}
                        isUnread={ticket.is_unread}
                        subject={ticket.displaySubject}
                        excerpt={ticket.displayExcerpt}
                        hasFailedMessageTag={
                            !!ticket.last_sent_message_not_delivered
                        }
                        currentUserId={currentUserId}
                        linkProps={getLinkProps(cell)}
                    />
                )
            },
        }),
        columnHelper.display({
            id: 'subject',
            header: 'Subject',
            enableSorting: false,
            minSize: 200,
            maxSize: 240,
            cell: (cell) => {
                const ticket = cell.row.original

                return (
                    <SubjectOnlyCell
                        value={ticket.displaySubject}
                        isUnread={ticket.is_unread}
                        linkProps={getLinkProps(cell)}
                    />
                )
            },
        }),
        columnHelper.display({
            id: 'customer',
            header: 'Customer',
            enableSorting: false,
            minSize: 180,
            maxSize: 220,
            cell: (cell) => (
                <CustomerCell
                    value={cell.row.original.displayCustomer}
                    linkProps={getLinkProps(cell)}
                />
            ),
        }),
        columnHelper.display({
            id: 'assignee',
            header: 'Assignee',
            enableSorting: false,
            minSize: 180,
            maxSize: 250,
            cell: (cell) => (
                <AssigneeCell
                    assignee={cell.row.original.assignee_user}
                    linkProps={getLinkProps(cell)}
                />
            ),
        }),
        columnHelper.display({
            id: 'status',
            header: 'Status',
            enableSorting: false,
            hug: true,
            cell: (cell) => {
                const ticket = cell.row.original
                const status = ticket.snooze_datetime
                    ? 'snoozed'
                    : ((ticket.status ??
                          'open') as keyof typeof STATUS_TAG_COLOR)
                return (
                    <TicketTableCellLink {...getLinkProps(cell)}>
                        <Tag color={STATUS_TAG_COLOR[status]}>
                            {STATUS_LABEL[status]}
                        </Tag>
                    </TicketTableCellLink>
                )
            },
        }),
        columnHelper.accessor(
            (ticket) => ticket.last_message_datetime || ticket.updated_datetime,
            {
                id: 'last_message_datetime',
                header: 'Last message',
                enableSorting: true,
                hug: true,
                maxSize: 180,
                cell: (cell) => (
                    <DateTimeCell
                        datetime={cell.getValue()}
                        preferences={dateTimePreferences}
                        isUnread={cell.row.original.is_unread}
                        linkProps={getLinkProps(cell)}
                    />
                ),
            },
        ),
        columnHelper.display({
            id: 'tags',
            header: 'Tags',
            enableSorting: false,
            minSize: 240,
            maxSize: 350,
            cell: (cell) => (
                <TicketTableCellLink {...getLinkProps(cell)} overflow="hidden">
                    <OverflowList gap="xxxs" w="100%">
                        {cell.row.original.tags.map((tag, index) => (
                            <OverflowListItem key={index}>
                                <Tag
                                    {...(tag.decoration?.color && {
                                        leadingSlot: (
                                            <Dot
                                                color={
                                                    tag.decoration
                                                        .color as ColorValue
                                                }
                                            />
                                        ),
                                    })}
                                >
                                    {tag.name}
                                </Tag>
                            </OverflowListItem>
                        ))}
                        <OverflowListShowMore />
                        <OverflowListShowLess />
                    </OverflowList>
                </TicketTableCellLink>
            ),
        }),
        columnHelper.accessor((ticket) => ticket.priority ?? 'normal', {
            id: 'priority',
            header: 'Priority',
            enableSorting: true,
            hug: true,
            cell: (cell) => (
                <PriorityCell
                    ticket={cell.row.original}
                    linkProps={getLinkProps(cell)}
                />
            ),
        }),
        columnHelper.accessor((ticket) => ticket.assignee_team?.name ?? null, {
            id: 'assignee_team',
            header: 'Assignee team',
            enableSorting: false,
            hug: true,
            cell: (cell) =>
                cell.getValue() ? (
                    <SingleLineTextCell
                        value={{ text: cell.getValue() }}
                        linkProps={getLinkProps(cell)}
                    />
                ) : (
                    <SingleLineTextCell
                        value={null}
                        linkProps={getLinkProps(cell)}
                    />
                ),
        }),
        columnHelper.accessor(
            (ticket) =>
                ticket.integrations.map((i) => i.name).join(', ') || null,
            {
                id: 'integrations',
                header: 'Integration',
                enableSorting: false,
                minSize: 150,
                maxSize: 250,
                cell: (cell) =>
                    cell.getValue() ? (
                        <SingleLineTextCell
                            value={{ text: cell.getValue() }}
                            linkProps={getLinkProps(cell)}
                        />
                    ) : (
                        <SingleLineTextCell
                            value={null}
                            linkProps={getLinkProps(cell)}
                        />
                    ),
            },
        ),
        columnHelper.accessor((ticket) => String(ticket.id), {
            id: 'id',
            header: 'ID',
            enableSorting: false,
            hug: true,
            cell: (cell) => (
                <SingleLineTextCell
                    value={cell.row.original.displayTicketId}
                    linkProps={getLinkProps(cell)}
                />
            ),
        }),
        columnHelper.accessor(
            (ticket) =>
                ticket.language
                    ? (languageDisplayNames.of(ticket.language) ??
                      ticket.language)
                    : null,
            {
                id: 'language',
                header: 'Language',
                enableSorting: false,
                hug: true,
                cell: (cell) =>
                    cell.getValue() ? (
                        <SingleLineTextCell
                            value={{ text: cell.getValue() }}
                            linkProps={getLinkProps(cell)}
                        />
                    ) : (
                        <SingleLineTextCell
                            value={null}
                            linkProps={getLinkProps(cell)}
                        />
                    ),
            },
        ),
        columnHelper.display({
            id: 'channel',
            header: 'Channel',
            enableSorting: false,
            hug: true,
            cell: (cell) => (
                <ChannelCell
                    ticket={cell.row.original}
                    linkProps={getLinkProps(cell)}
                />
            ),
        }),
        columnHelper.accessor((ticket) => ticket.created_datetime, {
            id: 'created_datetime',
            header: 'Created',
            enableSorting: true,
            hug: true,
            maxSize: 180,
            cell: (cell) => (
                <DateTimeCell
                    datetime={cell.getValue()}
                    preferences={dateTimePreferences}
                    linkProps={getLinkProps(cell)}
                />
            ),
        }),
        columnHelper.accessor((ticket) => ticket.updated_datetime, {
            id: 'updated_datetime',
            header: 'Updated',
            enableSorting: true,
            hug: true,
            maxSize: 180,
            cell: (cell) => (
                <DateTimeCell
                    datetime={cell.getValue()}
                    preferences={dateTimePreferences}
                    linkProps={getLinkProps(cell)}
                />
            ),
        }),
        columnHelper.accessor(
            (ticket) => ticket.last_received_message_datetime,
            {
                id: 'last_received_message_datetime',
                header: 'Last received',
                enableSorting: true,
                hug: true,
                maxSize: 180,
                cell: (cell) => (
                    <DateTimeCell
                        datetime={cell.getValue()}
                        preferences={dateTimePreferences}
                        linkProps={getLinkProps(cell)}
                    />
                ),
            },
        ),
        columnHelper.accessor((ticket) => ticket.closed_datetime, {
            id: 'closed',
            header: 'Closed',
            enableSorting: false,
            hug: true,
            maxSize: 180,
            cell: (cell) => (
                <DateTimeCell
                    datetime={cell.getValue()}
                    preferences={dateTimePreferences}
                    linkProps={getLinkProps(cell)}
                />
            ),
        }),
        columnHelper.accessor((ticket) => ticket.snooze_datetime, {
            id: 'snooze',
            header: 'Snooze',
            enableSorting: false,
            hug: true,
            maxSize: 180,
            cell: (cell) => (
                <DateTimeCell
                    datetime={cell.getValue()}
                    preferences={dateTimePreferences}
                    linkProps={getLinkProps(cell)}
                />
            ),
        }),
    ]
}
