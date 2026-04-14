import { useCallback, useMemo } from 'react'

import { hasRole, UserRole } from '@repo/permissions'
import { useQueryClient } from '@tanstack/react-query'

import {
    queryKeys,
    useGetCurrentUser,
    useGetView,
    useUpdateView,
} from '@gorgias/helpdesk-queries'
import { ViewField } from '@gorgias/helpdesk-types'

const TICKET_TABLE_COLUMNS_IN_ORDER = [
    'subject',
    'integrations',
    'tags',
    'customer',
    'assignee_team',
    'assignee',
    'id',
    'status',
    'language',
    'channel',
    'created_datetime',
    'updated_datetime',
    'last_message_datetime',
    'last_received_message_datetime',
    'closed',
    'snooze',
    'priority',
]

const MANDATORY_COLUMN = 'ticket'
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

type Options = {
    isDraftView?: boolean
    draftFields?: ViewField[]
    onDraftFieldsChange?: (fields: ViewField[]) => void
}

function mapVisibleColumnsToViewFields(
    newVisibleColumns: string[],
    { includeMandatoryField = false }: { includeMandatoryField?: boolean } = {},
) {
    const mappedFields = newVisibleColumns
        .filter((col) => col !== SELECTION_COLUMN && col !== MANDATORY_COLUMN)
        .map((col) => COLUMN_TO_FIELD[col])
        .filter(Boolean) as ViewField[]

    if (!includeMandatoryField) {
        return mappedFields
    }

    return [ViewField.Details, ...mappedFields]
}

function mapOrderedVisibleColumnsToViewFields(
    visibleColumns: string[],
    columnOrder: string[],
    { includeMandatoryField = false }: { includeMandatoryField?: boolean } = {},
) {
    const orderedVisibleColumns = columnOrder.filter((column) =>
        visibleColumns.includes(column),
    )

    return mapVisibleColumnsToViewFields(orderedVisibleColumns, {
        includeMandatoryField,
    })
}

export function useTicketTableColumnVisibility(
    viewId: number,
    { isDraftView = false, draftFields, onDraftFieldsChange }: Options = {},
) {
    const queryClient = useQueryClient()
    const { data: viewResponse } = useGetView(viewId, {
        query: {
            enabled: !isDraftView,
        },
    })
    const { data: currentUser } = useGetCurrentUser()
    const { mutateAsync: updateView, isLoading: isSavingForEveryone } =
        useUpdateView()

    const defaultVisibleColumns = useMemo(() => {
        const fields = isDraftView ? draftFields : viewResponse?.data?.fields
        if (!fields?.length) {
            return [
                SELECTION_COLUMN,
                MANDATORY_COLUMN,
                ...TICKET_TABLE_COLUMNS_IN_ORDER,
            ]
        }

        const mapped = fields
            .map((field) => FIELD_TO_COLUMN[field])
            .filter(Boolean) as string[]

        return [SELECTION_COLUMN, MANDATORY_COLUMN, ...mapped]
    }, [draftFields, isDraftView, viewResponse])

    const canSaveForEveryone = useMemo(
        () =>
            !isDraftView &&
            !!currentUser &&
            (hasRole(currentUser.data, UserRole.Agent) ||
                hasRole(currentUser.data, UserRole.Admin)),
        [currentUser, isDraftView],
    )

    const onLocalChange = useCallback(
        (newVisibleColumns: string[]) => {
            if (!isDraftView) {
                return
            }

            const fields = mapVisibleColumnsToViewFields(newVisibleColumns, {
                includeMandatoryField: true,
            })
            onDraftFieldsChange?.(fields)
        },
        [isDraftView, onDraftFieldsChange],
    )

    const onColumnOrderChange = useCallback(
        (columnOrder: string[]) => {
            if (!isDraftView) {
                return
            }

            const fields = mapOrderedVisibleColumnsToViewFields(
                defaultVisibleColumns,
                columnOrder,
                {
                    includeMandatoryField: true,
                },
            )
            onDraftFieldsChange?.(fields)
        },
        [defaultVisibleColumns, isDraftView, onDraftFieldsChange],
    )

    const saveForEveryone = useCallback(
        async (newVisibleColumns: string[]) => {
            if (isDraftView) {
                return
            }

            const fields = mapVisibleColumnsToViewFields(newVisibleColumns)

            await updateView({ id: viewId, data: { fields } })
            await queryClient.invalidateQueries({
                queryKey: queryKeys.views.getView(viewId),
            })
        },
        [isDraftView, queryClient, updateView, viewId],
    )

    return {
        defaultVisibleColumns,
        onLocalChange,
        onColumnOrderChange,
        saveForEveryone,
        canSaveForEveryone,
        isSavingForEveryone,
    }
}
