import { useUserDateTimePreferences } from '@repo/preferences'
import {
    DateAndTimeFormatting,
    formatDatetime,
    getDateAndTimeFormat,
} from '@repo/utils'

import type { CellContext, ColumnDef } from '@gorgias/axiom'
import {
    Text,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    useTable,
} from '@gorgias/axiom'
import type { TicketsSearchListDataItem } from '@gorgias/helpdesk-types'

import { TicketMessageSourceIcon } from '../../../TicketMessageSourceIcon/TicketMessageSourceIcon'
import type { TicketMessageSource } from '../../../TicketMessageSourceIcon/utils'

const subjectMaxLength = 68

const shorten = (text: string | undefined | null, maxLength: number) => {
    if (!text) {
        return ''
    }
    return text.length < maxLength ? text : text.substring(0, maxLength) + '...'
}

function SubjectCell(info: CellContext<TicketsSearchListDataItem, unknown>) {
    const { subject, excerpt } = info.getValue<{
        subject: string
        excerpt: string
    }>()

    if (!subject && !excerpt) {
        return null
    }

    return (
        <Tooltip>
            <TooltipTrigger>
                <span role="button">
                    <Text>{shorten(subject, subjectMaxLength)}</Text>
                </span>
            </TooltipTrigger>
            <TooltipContent title={subject} caption={excerpt} />
        </Tooltip>
    )
}

const customerNameMaxLength = 20

function CustomerNameCell(
    info: CellContext<TicketsSearchListDataItem, unknown>,
) {
    const { name, id } =
        info.getValue<TicketsSearchListDataItem['customer']>() ?? {}

    if (!name && !id) {
        return null
    }

    if (!name) {
        return <Text>{shorten(`#${id}`, customerNameMaxLength)}</Text>
    }

    if (name.length < customerNameMaxLength) {
        return <Text>{name}</Text>
    }

    return (
        <Tooltip>
            <TooltipTrigger>
                <span role="button">
                    <Text>{shorten(name, customerNameMaxLength)}</Text>
                </span>
            </TooltipTrigger>
            <TooltipContent title={name} />
        </Tooltip>
    )
}

function ChannelCell(info: CellContext<TicketsSearchListDataItem, unknown>) {
    return (
        <TicketMessageSourceIcon
            source={info.getValue<TicketMessageSource>()}
        />
    )
}

type UseMergeTicketsTableParams = {
    tickets: TicketsSearchListDataItem[]
}

export function useMergeTicketsTable({ tickets }: UseMergeTicketsTableParams) {
    const { dateFormat, timeFormat, timezone } = useUserDateTimePreferences()
    const datetimeFormat = getDateAndTimeFormat(
        dateFormat,
        timeFormat,
        DateAndTimeFormatting.CompactDate,
    )

    const columns: ColumnDef<TicketsSearchListDataItem>[] = [
        {
            accessorFn: ({ subject, excerpt }) => ({
                subject,
                excerpt,
            }),
            header: 'Subject',
            cell: SubjectCell,
        },
        {
            accessorKey: 'customer',
            header: 'Customer',
            cell: CustomerNameCell,
        },
        {
            accessorKey: 'channel',
            header: 'Channel',
            cell: ChannelCell,
        },
        {
            accessorKey: 'created_datetime',
            header: 'Created',
            cell: (info) => (
                <Text>
                    {formatDatetime(
                        info.getValue() as string,
                        datetimeFormat,
                        timezone,
                    )}
                </Text>
            ),
        },
    ]

    const table = useTable({
        data: tickets,
        columns,
        selectionConfig: {
            enableRowSelection: true,
            enableMultiRowSelection: false,
        },
    })

    return {
        table,
        columnCount: columns.length,
    }
}
