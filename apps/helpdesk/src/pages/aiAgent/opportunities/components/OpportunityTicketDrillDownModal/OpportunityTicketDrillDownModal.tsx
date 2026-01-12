import { useCallback, useEffect, useMemo, useState } from 'react'

import classNames from 'classnames'

import {
    Box,
    Button,
    Heading,
    Icon,
    Modal,
    ModalSize,
    Pagination,
    Tag,
} from '@gorgias/axiom'
import { ListTicketsOrderBy, useListTickets } from '@gorgias/helpdesk-queries'
import type { TicketCompact } from '@gorgias/helpdesk-types'

import type { TicketChannel, TicketStatus } from 'business/types/ticket'
import { DrillDownTableContentSkeleton } from 'domains/reporting/pages/common/components/Table/DrillDownTableContentSkeleton'
import css from 'domains/reporting/pages/common/drill-down/DrillDownTable.less'
import { DrillDownTicketDetailsCell } from 'domains/reporting/pages/common/drill-down/DrillDownTicketDetailsCell'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { useExportOpportunityTickets } from 'pages/aiAgent/opportunities/hooks/useExportOpportunityTickets'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'

import { formatOutcome } from './formatOutcome'
import { OpportunityTicketDrillDownInfoBar } from './OpportunityTicketDrillDownInfoBar'

import localCss from './OpportunityTicketDrillDownModal.less'

const TICKETS_PER_PAGE = 10
const NOT_AVAILABLE_PLACEHOLDER = '-'

const columnWidths = {
    ticket: 460,
    outcome: 140,
    created: 160,
}

interface OpportunityTicketDrillDownModalProps {
    isOpen: boolean
    onClose: () => void
    ticketIds: string[]
}

export const OpportunityTicketDrillDownModal = ({
    isOpen,
    onClose,
    ticketIds,
}: OpportunityTicketDrillDownModalProps) => {
    const [currentPage, setCurrentPage] = useState(1)

    const {
        exportTickets,
        isLoading: isExportLoading,
        isError: isExportError,
        isRequested: isExportRequested,
        resetState: resetExportState,
    } = useExportOpportunityTickets()

    const reversedTicketIds = [...ticketIds].reverse()
    const startIndex = (currentPage - 1) * TICKETS_PER_PAGE
    const endIndex = startIndex + TICKETS_PER_PAGE
    const currentTicketIds = reversedTicketIds.slice(startIndex, endIndex)

    const numericTicketIds = currentTicketIds.map((id) => Number(id))

    const { data, isLoading } = useListTickets(
        {
            ticket_ids: numericTicketIds,
            limit: TICKETS_PER_PAGE,
            order_by: ListTicketsOrderBy.CreatedDatetimeDesc,
        },
        {
            query: {
                enabled: isOpen && numericTicketIds.length > 0,
                staleTime: 60000,
            },
        },
    )

    const { outcomeCustomFieldId } = useGetCustomTicketsFieldsDefinitionData()

    const tickets = useMemo(() => data?.data.data ?? [], [data])
    const pagesCount = Math.ceil(ticketIds.length / TICKETS_PER_PAGE)

    useEffect(() => {
        if (!isOpen) {
            resetExportState()
        }
    }, [isOpen, resetExportState])

    const getOutcome = useCallback(
        (ticket: TicketCompact): string | undefined => {
            if (!outcomeCustomFieldId || !ticket.custom_fields) return undefined
            const field = ticket.custom_fields[outcomeCustomFieldId]
            const rawOutcome = field?.value as string | undefined
            return formatOutcome(rawOutcome)
        },
        [outcomeCustomFieldId],
    )

    const handleTicketClick = useCallback((ticketId: number) => {
        window.open(`/app/ticket/${ticketId}`, '_blank')
    }, [])

    const handlePageChange = useCallback(
        (direction: 'next' | 'previous') => {
            setCurrentPage((prev) => {
                if (direction === 'next' && prev < pagesCount) {
                    return prev + 1
                } else if (direction === 'previous' && prev > 1) {
                    return prev - 1
                }
                return prev
            })
        },
        [pagesCount],
    )

    const handleDownload = useCallback(async () => {
        await exportTickets(ticketIds)
    }, [ticketIds, exportTickets])

    const columnWidthsForSkeleton = [
        columnWidths.ticket,
        columnWidths.outcome,
        columnWidths.created,
    ].map((width) => width - 40)

    return (
        <Modal size={ModalSize.Lg} isOpen={isOpen} onOpenChange={onClose}>
            <Box flexDirection="column" gap="md">
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    gap="md"
                >
                    <Heading size="md">Handover tickets</Heading>
                    <Button
                        icon={<Icon name="close" />}
                        variant="tertiary"
                        size="md"
                        aria-label="Close modal"
                        onClick={onClose}
                    />
                </Box>
                <OpportunityTicketDrillDownInfoBar
                    totalTickets={ticketIds.length}
                    isLoading={isLoading}
                    onDownload={handleDownload}
                    isDownloading={isExportLoading}
                    isDownloadRequested={isExportRequested}
                    isDownloadError={isExportError}
                />
                <div
                    className={classNames(
                        css.container,
                        localCss.tableContainer,
                    )}
                >
                    <div
                        className={classNames(
                            css.tableBorder,
                            localCss.tableBorder,
                        )}
                    >
                        <TableWrapper className={css.table}>
                            <TableHead>
                                <HeaderCellProperty
                                    title="Ticket"
                                    width={columnWidths.ticket}
                                    className={localCss.headerCell}
                                    titleClassName={localCss.headerCellTitle}
                                />
                                <HeaderCellProperty
                                    title="Outcome"
                                    width={columnWidths.outcome}
                                    className={localCss.headerCell}
                                    titleClassName={localCss.headerCellTitle}
                                />
                                <HeaderCellProperty
                                    title="Date"
                                    width={columnWidths.created}
                                    className={localCss.headerCell}
                                    titleClassName={localCss.headerCellTitle}
                                />
                            </TableHead>
                            <TableBody>
                                {isLoading ? (
                                    <DrillDownTableContentSkeleton
                                        columnWidths={columnWidthsForSkeleton}
                                        rowCount={currentTicketIds.length}
                                    />
                                ) : (
                                    tickets.map((ticket) => {
                                        const outcome = getOutcome(ticket)

                                        return (
                                            <TableBodyRow
                                                key={ticket.id}
                                                onClick={() =>
                                                    handleTicketClick(ticket.id)
                                                }
                                            >
                                                <DrillDownTicketDetailsCell
                                                    ticketDetails={{
                                                        id: ticket.id,
                                                        subject: ticket.subject,
                                                        description:
                                                            ticket.excerpt ??
                                                            '',
                                                        status:
                                                            (ticket.status as TicketStatus) ??
                                                            null,
                                                        channel:
                                                            (ticket.channel as TicketChannel) ??
                                                            null,
                                                        isRead: false,
                                                        contactReason: null,
                                                        created:
                                                            ticket.created_datetime,
                                                    }}
                                                    bodyCellProps={{
                                                        width: columnWidths.ticket,
                                                    }}
                                                />
                                                <BodyCell
                                                    width={columnWidths.outcome}
                                                >
                                                    <Tag
                                                        color={
                                                            outcome ===
                                                            'Automated'
                                                                ? 'green'
                                                                : 'orange'
                                                        }
                                                    >
                                                        {outcome ??
                                                            NOT_AVAILABLE_PLACEHOLDER}
                                                    </Tag>
                                                </BodyCell>
                                                <BodyCell
                                                    width={columnWidths.created}
                                                >
                                                    {ticket.created_datetime ? (
                                                        <DatetimeLabel
                                                            dateTime={
                                                                ticket.created_datetime
                                                            }
                                                        />
                                                    ) : (
                                                        NOT_AVAILABLE_PLACEHOLDER
                                                    )}
                                                </BodyCell>
                                            </TableBodyRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </TableWrapper>
                    </div>
                </div>
                {pagesCount > 1 && (
                    <div className={localCss.pagination}>
                        <Pagination
                            hasNextPage={pagesCount > currentPage}
                            hasPreviousPage={currentPage > 1}
                            onPageChange={handlePageChange}
                            hasLinesPerPage={false}
                        />
                    </div>
                )}
            </Box>
        </Modal>
    )
}
