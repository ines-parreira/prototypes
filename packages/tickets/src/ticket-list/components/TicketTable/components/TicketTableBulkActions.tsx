import type { ReactNode } from 'react'

import {
    Box,
    Button,
    DataTableBulkActions,
    DataTableColumnEditing,
    DataTableItemCount,
    Text,
} from '@gorgias/axiom'
import type {
    DataTableBulkActionsProps,
    DataTableColumnEditingProps,
} from '@gorgias/axiom'
import type {
    Team,
    TicketPriority,
    TicketTag,
    User,
} from '@gorgias/helpdesk-queries'

import type { TicketStatus } from '../../../../types/ticket'
import { BulkMoreActionsMenu } from './BulkMoreActionsMenu/BulkMoreActionsMenu'
import { BulkAddTagSelect } from './BulkMoreActionsMenu/components/BulkAddTagSelect'
import { BulkStatusSelect } from './BulkMoreActionsMenu/components/BulkStatusSelect'
import { BulkTeamAssignSelect } from './BulkMoreActionsMenu/components/BulkTeamAssignSelect'
import { BulkUserAssignSelect } from './BulkMoreActionsMenu/components/BulkUserAssignSelect'

type Props = {
    viewId: number
    canSelectAllAcrossPages: boolean
    hasSelectedAll: boolean
    viewName?: string
    viewCount?: number
    isDisabled: boolean
    isAssignUserOpen: boolean
    onAssignUserOpenChange: (open: boolean) => void
    isAddTagOpen: boolean
    onAddTagOpenChange: (open: boolean) => void
    onSetStatus: (status: TicketStatus) => void | Promise<void>
    onAssignUser: (user: User | null) => void | Promise<void>
    onAssignTeam: (team: Team | null) => void | Promise<void>
    onAddTag: (tag: TicketTag) => void | Promise<void>
    onMarkAsUnread: () => void | Promise<void>
    onMarkAsRead: () => void | Promise<void>
    onChangePriority: (priority: TicketPriority) => void | Promise<void>
    onApplyMacro: () => void
    onExportTickets: () => void | Promise<void>
    onMoveToTrash: () => void | Promise<void>
    onUndelete: () => void | Promise<void>
    onDeleteForever: () => void | Promise<void>
    columnEditingFooter?: DataTableColumnEditingProps['footer']
}

type ItemCountRenderProps = {
    isAllSelected: boolean
    text: string
}

type SelectAllActionRenderProps = {
    onSelectAll: () => void
}

type LegacyDataTableItemCountProps = {
    children?: (props: ItemCountRenderProps) => ReactNode
}

type LegacyDataTableBulkActionsProps<TData = unknown> =
    DataTableBulkActionsProps<TData> & {
        selectAllAction?: (props: SelectAllActionRenderProps) => ReactNode
    }

const DataTableItemCountWithChildren = DataTableItemCount as unknown as (
    props: LegacyDataTableItemCountProps,
) => JSX.Element

const DataTableBulkActionsWithSelectAll = DataTableBulkActions as unknown as <
    TData = unknown,
>(
    props: LegacyDataTableBulkActionsProps<TData>,
) => JSX.Element | null

export function TicketTableBulkActions({
    viewId,
    canSelectAllAcrossPages,
    hasSelectedAll,
    viewName,
    viewCount,
    isDisabled,
    isAssignUserOpen,
    onAssignUserOpenChange,
    isAddTagOpen,
    onAddTagOpenChange,
    onSetStatus,
    onAssignUser,
    onAssignTeam,
    onAddTag,
    onMarkAsUnread,
    onMarkAsRead,
    onChangePriority,
    onApplyMacro,
    onExportTickets,
    onMoveToTrash,
    onUndelete,
    onDeleteForever,
    columnEditingFooter,
}: Props) {
    const viewLabel = viewName?.trim() || 'the view'

    return (
        <>
            <DataTableItemCountWithChildren>
                {({ isAllSelected, text }: ItemCountRenderProps) =>
                    isAllSelected || hasSelectedAll ? (
                        <Text size="sm">
                            {viewCount != null
                                ? `All ${viewCount} tickets in ${viewLabel} selected`
                                : `All tickets in ${viewLabel} selected`}
                        </Text>
                    ) : (
                        text
                    )
                }
            </DataTableItemCountWithChildren>
            <DataTableBulkActionsWithSelectAll
                selectAllAction={
                    canSelectAllAcrossPages
                        ? ({ onSelectAll }: SelectAllActionRenderProps) => (
                              <Button
                                  variant="tertiary"
                                  size="sm"
                                  onClick={onSelectAll}
                              >
                                  {viewCount != null
                                      ? `Select all ${viewCount} tickets in ${viewLabel}`
                                      : `Select all tickets in ${viewLabel}`}
                              </Button>
                          )
                        : undefined
                }
            >
                {() => (
                    <Box alignItems="center" gap="xs" height="24px">
                        <BulkStatusSelect
                            onChange={onSetStatus}
                            isDisabled={isDisabled}
                        />
                        <BulkUserAssignSelect
                            onChange={onAssignUser}
                            isDisabled={isDisabled}
                            isOpen={isAssignUserOpen}
                            onOpenChange={onAssignUserOpenChange}
                        />
                        <BulkTeamAssignSelect
                            onChange={onAssignTeam}
                            isDisabled={isDisabled}
                        />
                        <BulkAddTagSelect
                            onChange={onAddTag}
                            isDisabled={isDisabled}
                            isOpen={isAddTagOpen}
                            onOpenChange={onAddTagOpenChange}
                        />
                        <BulkMoreActionsMenu
                            viewId={viewId}
                            isDisabled={isDisabled}
                            onMarkAsUnread={onMarkAsUnread}
                            onMarkAsRead={onMarkAsRead}
                            onChangePriority={onChangePriority}
                            onApplyMacro={onApplyMacro}
                            onExportTickets={onExportTickets}
                            onMoveToTrash={onMoveToTrash}
                            onUndelete={onUndelete}
                            onDeleteForever={onDeleteForever}
                        />
                    </Box>
                )}
            </DataTableBulkActionsWithSelectAll>
            <DataTableColumnEditing footer={columnEditingFooter} />
        </>
    )
}
