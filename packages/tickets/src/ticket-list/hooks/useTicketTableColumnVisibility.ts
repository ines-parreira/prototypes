import { useCallback, useMemo } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { queryKeys, useGetView, useUpdateView } from '@gorgias/helpdesk-queries'
import { ViewField } from '@gorgias/helpdesk-types'

const ALL_COLUMNS = [
    'subject',
    'customer',
    'assignee',
    'status',
    'last_message_datetime',
    'tags',
    'priority',
    'assignee_team',
    'integrations',
    'id',
    'language',
    'channel',
    'created_datetime',
    'updated_datetime',
    'last_received_message_datetime',
    'closed',
    'snooze',
]

const MANDATORY_COLUMN = 'subject'
const SELECTION_COLUMN = 'select'

const COLUMN_TO_FIELD: Record<string, ViewField> = {
    subject: ViewField.Subject,
    customer: ViewField.Customer,
    assignee: ViewField.Assignee,
    status: ViewField.Status,
    last_message_datetime: ViewField.LastMessage,
    tags: ViewField.Tags,
    priority: ViewField.Priority,
    assignee_team: ViewField.AssigneeTeam,
    integrations: ViewField.Integrations,
    id: ViewField.Id,
    language: ViewField.Language,
    channel: ViewField.Channel,
    created_datetime: ViewField.Created,
    updated_datetime: ViewField.Updated,
    last_received_message_datetime: ViewField.LastReceivedMessage,
    closed: ViewField.Closed,
    snooze: ViewField.Snooze,
}

const FIELD_TO_COLUMN: Record<string, string> = Object.fromEntries(
    Object.entries(COLUMN_TO_FIELD).map(([col, field]) => [field, col]),
)

export function useTicketTableColumnVisibility(viewId: number) {
    const queryClient = useQueryClient()
    const { data: viewResponse } = useGetView(viewId)
    const { mutate: updateView } = useUpdateView()

    const defaultVisibleColumns = useMemo(() => {
        const fields = viewResponse?.data?.fields
        if (!fields?.length) return [SELECTION_COLUMN, ...ALL_COLUMNS]
        const mapped = fields
            .map((f) => FIELD_TO_COLUMN[f])
            .filter(Boolean) as string[]
        if (!mapped.includes(SELECTION_COLUMN)) mapped.unshift(SELECTION_COLUMN)
        if (!mapped.includes(MANDATORY_COLUMN)) mapped.unshift(MANDATORY_COLUMN)
        return mapped
    }, [viewResponse])

    const onChange = useCallback(
        (newVisibleColumns: string[]) => {
            if (!newVisibleColumns.includes(MANDATORY_COLUMN)) return
            const fields = newVisibleColumns
                .filter((col) => col !== SELECTION_COLUMN)
                .map((col) => COLUMN_TO_FIELD[col])
                .filter(Boolean) as ViewField[]

            updateView(
                { id: viewId, data: { fields } },
                {
                    onSuccess: () =>
                        queryClient.invalidateQueries(
                            queryKeys.views.getView(viewId),
                        ),
                },
            )
        },
        [viewId, updateView, queryClient],
    )

    return { defaultVisibleColumns, onChange }
}
