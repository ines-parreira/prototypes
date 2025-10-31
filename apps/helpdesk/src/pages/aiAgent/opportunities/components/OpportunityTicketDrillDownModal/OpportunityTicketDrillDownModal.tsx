import { useCallback, useEffect, useMemo, useState } from 'react'

import classNames from 'classnames'

import { useListTickets } from '@gorgias/helpdesk-queries'
import { TicketCompact } from '@gorgias/helpdesk-types'

import { TicketChannel, TicketStatus } from 'business/types/ticket'
import { User } from 'config/types/user'
import { DROPDOWN_NESTING_DELIMITER } from 'custom-fields/constants'
import { AgentAvatar } from 'domains/reporting/pages/common/AgentAvatar'
import { DrillDownTableContentSkeleton } from 'domains/reporting/pages/common/components/Table/DrillDownTableContentSkeleton'
import { TruncateCellContent } from 'domains/reporting/pages/common/components/TruncateCellContent'
import TruncateMultilineCellContent from 'domains/reporting/pages/common/components/TruncateMultilineCellContent'
import css from 'domains/reporting/pages/common/drill-down/DrillDownTable.less'
import { DrillDownTicketDetailsCell } from 'domains/reporting/pages/common/drill-down/DrillDownTicketDetailsCell'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { useExportOpportunityTickets } from 'pages/aiAgent/opportunities/hooks/useExportOpportunityTickets'
import Modal from 'pages/common/components/modal/Modal'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import { NumberedPagination } from 'pages/common/components/Paginations'
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

const TICKETS_PER_PAGE = 20
const NOT_AVAILABLE_PLACEHOLDER = '-'

const columnWidths = {
    ticket: 280,
    outcome: 180,
    assignee: 180,
    created: 180,
    intent: 180,
}

const tooltipHints = {
    outcome:
        'Current resolution or result of the ticket after being processed by AI Agent. It may be different from what the outcome was at the end of selected timeframe.',
    assignee:
        'The current assignee is displayed in this column. It may be different from who the assignee was at the end of the selected timeframe.',
    intent: 'The primary topic or issue identified by AI Agent for this ticket.',
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

    const startIndex = (currentPage - 1) * TICKETS_PER_PAGE
    const endIndex = startIndex + TICKETS_PER_PAGE
    const currentTicketIds = ticketIds.slice(startIndex, endIndex)

    const numericTicketIds = currentTicketIds.map((id) => Number(id))

    const { data, isLoading } = useListTickets(
        {
            ticket_ids: numericTicketIds,
            limit: TICKETS_PER_PAGE,
        },
        {
            query: {
                enabled: isOpen && numericTicketIds.length > 0,
                staleTime: 60000,
            },
        },
    )

    const { outcomeCustomFieldId, intentCustomFieldId } =
        useGetCustomTicketsFieldsDefinitionData()

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

    const getIntent = useCallback(
        (ticket: TicketCompact): string | undefined => {
            if (!intentCustomFieldId || !ticket.custom_fields) return undefined
            const field = ticket.custom_fields[intentCustomFieldId]
            return field?.value as string | undefined
        },
        [intentCustomFieldId],
    )

    const handleTicketClick = useCallback((ticketId: number) => {
        window.open(`/app/ticket/${ticketId}`, '_blank')
    }, [])

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page)
    }, [])

    const handleDownload = useCallback(async () => {
        await exportTickets(ticketIds)
    }, [ticketIds, exportTickets])

    const columnWidthsForSkeleton = [
        columnWidths.ticket,
        columnWidths.outcome,
        columnWidths.assignee,
        columnWidths.created,
        columnWidths.intent,
    ].map((width) => width - 40)

    return (
        <Modal size="huge" isOpen={isOpen} onClose={onClose}>
            <ModalHeader title={'Related tickets'} />
            <ModalBody className="p-0">
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
                    <TableWrapper className={css.table}>
                        <TableHead>
                            <HeaderCellProperty
                                title="Ticket"
                                width={columnWidths.ticket}
                                className={css.headerCell}
                            />
                            <HeaderCellProperty
                                title="Outcome"
                                width={columnWidths.outcome}
                                className={css.headerCell}
                                tooltip={tooltipHints.outcome}
                            />
                            <HeaderCellProperty
                                title="Assignee"
                                width={columnWidths.assignee}
                                className={css.headerCell}
                                tooltip={tooltipHints.assignee}
                            />
                            <HeaderCellProperty
                                title="Created"
                                width={columnWidths.created}
                                className={css.headerCell}
                            />
                            <HeaderCellProperty
                                title="Intent"
                                width={columnWidths.intent}
                                className={css.headerCell}
                                tooltip={tooltipHints.intent}
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
                                    const intent = getIntent(ticket)

                                    return (
                                        <TableBodyRow
                                            key={ticket.id}
                                            className={classNames(
                                                css.tableRow,
                                                {
                                                    [css.isHighlighted]:
                                                        ticket.is_unread ===
                                                        true,
                                                },
                                            )}
                                            onClick={() =>
                                                handleTicketClick(ticket.id)
                                            }
                                        >
                                            <DrillDownTicketDetailsCell
                                                ticketDetails={{
                                                    id: ticket.id,
                                                    subject: ticket.subject,
                                                    description:
                                                        ticket.excerpt ?? '',
                                                    status:
                                                        (ticket.status as TicketStatus) ??
                                                        null,
                                                    channel:
                                                        (ticket.channel as TicketChannel) ??
                                                        null,
                                                    isRead:
                                                        ticket.is_unread ===
                                                        false,
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
                                                {outcome ? (
                                                    <TruncateMultilineCellContent
                                                        className={
                                                            css.multiLineOutcome
                                                        }
                                                        maxLines={
                                                            outcome
                                                                ? outcome.split(
                                                                      DROPDOWN_NESTING_DELIMITER,
                                                                  ).length
                                                                : 1
                                                        }
                                                        tooltip={outcome}
                                                        value={outcome}
                                                        splitDelimiter={
                                                            DROPDOWN_NESTING_DELIMITER
                                                        }
                                                        level1ClassName={
                                                            localCss.level1Bold
                                                        }
                                                        sublevelsClassName={
                                                            css.sublevels
                                                        }
                                                    />
                                                ) : (
                                                    <span
                                                        className={css.noData}
                                                    >
                                                        {
                                                            NOT_AVAILABLE_PLACEHOLDER
                                                        }
                                                    </span>
                                                )}
                                            </BodyCell>
                                            <BodyCell
                                                width={columnWidths.assignee}
                                                className={
                                                    localCss.boldAssignee
                                                }
                                            >
                                                {ticket.assignee_user ? (
                                                    <AgentAvatar
                                                        agent={
                                                            ticket.assignee_user as User
                                                        }
                                                        avatarSize={24}
                                                        className={css.agent}
                                                    />
                                                ) : (
                                                    NOT_AVAILABLE_PLACEHOLDER
                                                )}
                                            </BodyCell>
                                            <BodyCell
                                                width={columnWidths.created}
                                                className={localCss.boldDate}
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
                                            <BodyCell
                                                width={columnWidths.intent}
                                                className={localCss.boldCell}
                                            >
                                                {intent ? (
                                                    <TruncateCellContent
                                                        content={intent}
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
                {pagesCount > 1 && (
                    <NumberedPagination
                        count={pagesCount}
                        page={currentPage}
                        onChange={handlePageChange}
                        className={css.pagination}
                    />
                )}
            </ModalBody>
        </Modal>
    )
}
