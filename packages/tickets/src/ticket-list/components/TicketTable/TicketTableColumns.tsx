import type { UserDateTimePreferences } from '@repo/preferences'

import { createColumnHelper, DataTableBaseCell, Tag } from '@gorgias/axiom'
import type { DataTableColumnDef } from '@gorgias/axiom'
import type {
    Language,
    TicketCompact,
    TicketTranslationCompact,
} from '@gorgias/helpdesk-types'

import { ChannelCell } from './components/ChannelCell'
import { CustomerCell } from './components/CustomerCell'
import { DateTimeCell } from './components/DateTimeCell'
import { PriorityCell } from './components/PriorityCell'
import { SingleLineTextCell } from './components/SingleLineTextCell'
import { SubjectOnlyCell } from './components/SubjectOnlyCell'
import { TagsCell } from './components/TagsCell'
import { TicketCell } from './components/TicketCell'

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

const columnHelper = createColumnHelper<TicketCompact>()

export type TicketTableColumnsParams = {
    translationMap: Record<number, TicketTranslationCompact>
    shouldShowTranslatedContent: (language?: Language | null) => boolean
    currentUserId?: number
    dateTimePreferences: UserDateTimePreferences
}

export function createTicketTableColumns({
    translationMap,
    shouldShowTranslatedContent,
    currentUserId,
    dateTimePreferences,
}: TicketTableColumnsParams): DataTableColumnDef<TicketCompact>[] {
    return [
        columnHelper.display({
            id: 'subject',
            header: 'Ticket',
            enableSorting: false,
            enableHiding: false,
            size: 350,
            maxSize: 350,
            cell: (cell) => (
                <TicketCell
                    ticket={cell.row.original}
                    translation={translationMap[cell.row.original.id]}
                    showTranslatedContent={shouldShowTranslatedContent(
                        cell.row.original.language,
                    )}
                    currentUserId={currentUserId}
                />
            ),
        }),
        columnHelper.display({
            id: 'subject_text',
            header: 'Subject',
            enableSorting: false,
            cell: (cell) => (
                <SubjectOnlyCell
                    ticket={cell.row.original}
                    translation={translationMap[cell.row.original.id]}
                    showTranslatedContent={shouldShowTranslatedContent(
                        cell.row.original.language,
                    )}
                />
            ),
        }),
        columnHelper.display({
            id: 'customer',
            header: 'Customer',
            enableSorting: false,
            size: 220,
            minSize: 180,
            cell: (cell) => <CustomerCell ticket={cell.row.original} />,
        }),
        columnHelper.accessor(
            (ticket) => {
                const user = ticket.assignee_user
                if (!user) return 'Unassigned'
                return `${user.firstname} ${user.lastname}`.trim() || user.email
            },
            {
                id: 'assignee',
                header: 'Assignee',
                enableSorting: false,
                size: 220,
                minSize: 180,
                cell: (cell) => <SingleLineTextCell value={cell.getValue()} />,
            },
        ),
        columnHelper.display({
            id: 'status',
            header: 'Status',
            enableSorting: false,
            cell: (cell) => {
                const ticket = cell.row.original
                const status = ticket.snooze_datetime
                    ? 'snoozed'
                    : ((ticket.status ??
                          'open') as keyof typeof STATUS_TAG_COLOR)
                return (
                    <DataTableBaseCell>
                        <Tag color={STATUS_TAG_COLOR[status]}>
                            {STATUS_LABEL[status]}
                        </Tag>
                    </DataTableBaseCell>
                )
            },
        }),
        columnHelper.accessor(
            (ticket) => ticket.last_message_datetime || ticket.updated_datetime,
            {
                id: 'last_message_datetime',
                header: 'Last message',
                enableSorting: true,
                size: 180,
                minSize: 160,
                cell: (cell) => (
                    <DateTimeCell
                        datetime={cell.getValue()}
                        preferences={dateTimePreferences}
                    />
                ),
            },
        ),
        columnHelper.display({
            id: 'tags',
            header: 'Tags',
            enableSorting: false,
            size: 240,
            minSize: 200,
            cell: (cell) => <TagsCell ticket={cell.row.original} />,
        }),
        columnHelper.accessor((ticket) => ticket.priority ?? 'normal', {
            id: 'priority',
            header: 'Priority',
            enableSorting: true,
            cell: (cell) => <PriorityCell ticket={cell.row.original} />,
        }),
        columnHelper.accessor((ticket) => ticket.assignee_team?.name ?? null, {
            id: 'assignee_team',
            header: 'Assignee team',
            enableSorting: false,
            cell: (cell) => <SingleLineTextCell value={cell.getValue()} />,
        }),
        columnHelper.accessor(
            (ticket) =>
                ticket.integrations.map((i) => i.name).join(', ') || null,
            {
                id: 'integrations',
                header: 'Integration',
                enableSorting: false,
                size: 240,
                minSize: 200,
                cell: (cell) => <SingleLineTextCell value={cell.getValue()} />,
            },
        ),
        columnHelper.accessor((ticket) => String(ticket.id), {
            id: 'id',
            header: 'ID',
            enableSorting: false,
            cell: (cell) => <SingleLineTextCell value={cell.getValue()} />,
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
                cell: (cell) => <SingleLineTextCell value={cell.getValue()} />,
            },
        ),
        columnHelper.display({
            id: 'channel',
            header: 'Channel',
            enableSorting: false,
            cell: (cell) => <ChannelCell ticket={cell.row.original} />,
        }),
        columnHelper.accessor((ticket) => ticket.created_datetime, {
            id: 'created_datetime',
            header: 'Created',
            enableSorting: true,
            size: 180,
            minSize: 160,
            cell: (cell) => (
                <DateTimeCell
                    datetime={cell.getValue()}
                    preferences={dateTimePreferences}
                />
            ),
        }),
        columnHelper.accessor((ticket) => ticket.updated_datetime, {
            id: 'updated_datetime',
            header: 'Updated',
            enableSorting: true,
            size: 180,
            minSize: 160,
            cell: (cell) => (
                <DateTimeCell
                    datetime={cell.getValue()}
                    preferences={dateTimePreferences}
                />
            ),
        }),
        columnHelper.accessor(
            (ticket) => ticket.last_received_message_datetime,
            {
                id: 'last_received_message_datetime',
                header: 'Last received',
                enableSorting: true,
                size: 180,
                minSize: 160,
                cell: (cell) => (
                    <DateTimeCell
                        datetime={cell.getValue()}
                        preferences={dateTimePreferences}
                    />
                ),
            },
        ),
        columnHelper.accessor((ticket) => ticket.closed_datetime, {
            id: 'closed',
            header: 'Closed',
            enableSorting: false,
            size: 180,
            minSize: 160,
            cell: (cell) => (
                <DateTimeCell
                    datetime={cell.getValue()}
                    preferences={dateTimePreferences}
                />
            ),
        }),
        columnHelper.accessor((ticket) => ticket.snooze_datetime, {
            id: 'snooze',
            header: 'Snooze',
            enableSorting: false,
            size: 180,
            minSize: 160,
            cell: (cell) => (
                <DateTimeCell
                    datetime={cell.getValue()}
                    preferences={dateTimePreferences}
                />
            ),
        }),
    ]
}
