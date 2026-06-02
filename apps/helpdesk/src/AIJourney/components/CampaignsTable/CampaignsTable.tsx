import type { ReactNode } from 'react'

import type { ColumnDef, SortingState, TableV1ToolbarRow } from '@gorgias/axiom'
import {
    Box,
    Button,
    Size,
    TableHeader,
    TableV1BodyContent,
    TableV1HeaderRowGroup,
    TableV1Root,
    TableV1Toolbar,
    useTableV1,
} from '@gorgias/axiom'

import { DateFormatToggle } from 'AIJourney/components/DateFormatToggle/DateFormatToggle'
import { useDateFormatPreference } from 'AIJourney/hooks'
import { useJourneyContext } from 'AIJourney/providers'

import CancelCampaignConfirmation from './CancelCampaignConfirmation/CancelCampaignConfirmation'
import EmptyCampaignsState from './EmptyCampaignsState/EmptyCampaignsState'
import RemoveCampaignConfirmation from './RemoveCampaignConfirmation/RemoveCampaignConfirmation'
import SendCampaignConfirmation from './SendCampaignConfirmation/SendCampaignConfirmation'
import type { CampaignsTableMeta } from './types'
import { useCampaignActions } from './useCampaignActions'

import styles from './CampaignsTable.less'

type CampaignsTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    onEditColumns?: () => void
    isLoading?: boolean
    initialSorting?: SortingState
    emptyStateCta?: ReactNode
}

export default function CampaignsTable<TData, TValue>({
    columns,
    data,
    onEditColumns,
    isLoading = false,
    initialSorting,
    emptyStateCta,
}: CampaignsTableProps<TData, TValue>) {
    const { shopName, currency, currentIntegration } = useJourneyContext()
    const { format: dateFormat, toggleFormat } = useDateFormatPreference()

    const {
        modalState,
        closeModal,
        openRemoveModal,
        openSendModal,
        openCancelModal,
        confirmRemove,
        confirmSend,
        confirmCancel,
        changeStatus,
        duplicateJourney,
    } = useCampaignActions({
        integrationId: currentIntegration?.id,
        shopName,
    })

    const table = useTableV1({
        data,
        columns,
        sortingConfig: {
            enableSorting: true,
            enableMultiSort: true,
            initialSorting,
        },
        paginationConfig: {
            enablePagination: true,
            manualPagination: false,
            pageSize: 10,
            initialPageIndex: 0,
        },
        globalFilterConfig: {
            enableGlobalFilter: true,
            globalFilterFn: 'includesString',
        },
        additionalOptions: {
            meta: {
                onRemoveClick: openRemoveModal,
                onSendClick: openSendModal,
                onCancelClick: openCancelModal,
                onChangeStatus: changeStatus,
                onDuplicateClick: duplicateJourney,
                currency: currency,
                dateFormat,
            } as CampaignsTableMeta,
        },
    })

    const shouldRenderPaginationComponent =
        table.getFilteredRowModel().rows.length > 10
    const tableToolbarBottonRowElements: TableV1ToolbarRow =
        shouldRenderPaginationComponent ? { right: ['pagination'] } : {}

    return (
        <>
            <div className={styles.tableWrapper}>
                <Box
                    paddingLeft={Size.Lg}
                    paddingRight={Size.Lg}
                    display="block"
                >
                    <TableV1Toolbar<TData>
                        table={table}
                        topRow={{ left: ['search'] }}
                        bottomRow={{
                            left: ['totalCount'],
                            right: [
                                {
                                    key: 'date-format',
                                    content: (
                                        <DateFormatToggle
                                            format={dateFormat}
                                            onToggle={toggleFormat}
                                        />
                                    ),
                                },
                                {
                                    key: 'edit',
                                    content: (
                                        <Button
                                            onClick={onEditColumns}
                                            intent="regular"
                                            leadingSlot="columns"
                                            size="sm"
                                            variant="tertiary"
                                        >
                                            Edit table
                                        </Button>
                                    ),
                                },
                            ],
                        }}
                    />
                </Box>

                <TableV1Root withBorder={false}>
                    <TableHeader>
                        <TableV1HeaderRowGroup
                            headerGroups={table.getHeaderGroups()}
                        />
                    </TableHeader>

                    <TableV1BodyContent
                        isLoading={isLoading}
                        rows={table.getRowModel().rows}
                        columnCount={columns.length}
                        table={table}
                        renderEmptyStateComponent={() => (
                            <Box alignItems="center" justifyContent="center">
                                <EmptyCampaignsState cta={emptyStateCta} />
                            </Box>
                        )}
                    />
                </TableV1Root>
                <Box
                    paddingRight={Size.Lg}
                    display="flex"
                    justifyContent="flex-end"
                >
                    <TableV1Toolbar
                        table={table}
                        bottomRow={tableToolbarBottonRowElements}
                    />
                </Box>
            </div>
            <RemoveCampaignConfirmation
                isOpen={modalState.kind === 'remove'}
                onClose={closeModal}
                onConfirm={confirmRemove}
            />
            <SendCampaignConfirmation
                isOpen={modalState.kind === 'send'}
                onClose={closeModal}
                onConfirm={confirmSend}
                hasIncludedAudiences={
                    modalState.kind === 'send'
                        ? modalState.hasIncludedAudiences
                        : false
                }
            />
            <CancelCampaignConfirmation
                isOpen={modalState.kind === 'cancel'}
                onClose={closeModal}
                onConfirm={confirmCancel}
            />
        </>
    )
}
