import classNames from 'classnames'
import React, {PropsWithRef, UIEventHandler, useState} from 'react'
import {useDispatch} from 'react-redux'
import {OnlineTimeCellSummary} from 'pages/stats/OnlineTimeCellSummary'
import {User} from 'config/types/user'
import {useAgentsTableConfigSetting} from 'hooks/reporting/useAgentsTableConfigSetting'
import useAppSelector from 'hooks/useAppSelector'
import useMeasure from 'hooks/useMeasure'
import {NumberedPagination} from 'pages/common/components/Paginations'
import BodyCell, {
    Props as BodyCellProps,
} from 'pages/common/components/table/cells/BodyCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import {AgentCellContent} from 'pages/stats/AgentCellContent'
import {AgentsHeaderCellContent} from 'pages/stats/AgentsHeaderCellContent'
import css from 'pages/stats/AgentsTable.less'
import {getColumnAlignment, getColumnWidth} from 'pages/stats/AgentsTableConfig'
import {ClosedTicketsCellContent} from 'pages/stats/ClosedTicketsCellContent'
import {ClosedTicketsCellSummary} from 'pages/stats/ClosedTicketsCellSummary'
import {CustomerSatisfactionCellContent} from 'pages/stats/CustomerSatisfactionCellContent'
import {CustomerSatisfactionCellSummary} from 'pages/stats/CustomerSatisfactionCellSummary'
import {MedianFirstResponseTimeCellContent} from 'pages/stats/MedianFirstResponseTimeCellContent'
import {MedianFirstResponseTimeCellSummary} from 'pages/stats/MedianFirstResponseTimeCellSummary'
import {MedianResolutionTimeCellContent} from 'pages/stats/MedianResolutionTimeCellContent'
import {MedianResolutionTimeCellSummary} from 'pages/stats/MedianResolutionTimeCellSummary'
import {MessagesSentCellContent} from 'pages/stats/MessagesSentCellContent'
import {MessagesSentCellSummary} from 'pages/stats/MessagesSentCellSummary'
import {OneTouchTicketsCellContent} from 'pages/stats/OneTouchTicketsCellContent'
import {OneTouchTicketsCellSummary} from 'pages/stats/OneTouchTicketsCellSummary'
import {OnlineTimeCellContent} from 'pages/stats/OnlineTimeCellContent'
import {PercentageOfClosedTicketsCellContent} from 'pages/stats/PercentageOfClosedTicketsCellContent'
import {PercentageOfClosedTicketsCellSummary} from 'pages/stats/PercentageOfClosedTicketsCellSummary'
import {SummaryCell} from 'pages/stats/SummaryCell'

import {TicketsRepliedCellContent} from 'pages/stats/TicketsRepliedCellContent'
import {TicketsRepliedCellSummary} from 'pages/stats/TicketsRepliedCellSummary'
import {
    getPaginatedAgents,
    getSortedAgents,
    pageSet,
} from 'state/ui/stats/agentPerformanceSlice'
import {TableColumn} from 'state/ui/stats/types'

const getCell = (
    column: TableColumn
): React.FunctionComponent<{
    agent: User
    bodyCellProps: PropsWithRef<BodyCellProps>
    column: TableColumn
}> => {
    switch (column) {
        case TableColumn.RepliedTickets:
            return TicketsRepliedCellContent
        case TableColumn.ClosedTickets:
            return ClosedTicketsCellContent
        case TableColumn.PercentageOfClosedTickets:
            return PercentageOfClosedTicketsCellContent
        case TableColumn.MessagesSent:
            return MessagesSentCellContent
        case TableColumn.MedianFirstResponseTime:
            return MedianFirstResponseTimeCellContent
        case TableColumn.CustomerSatisfaction:
            return CustomerSatisfactionCellContent
        case TableColumn.AgentName:
            return AgentCellContent
        case TableColumn.MedianResolutionTime:
            return MedianResolutionTimeCellContent
        case TableColumn.OneTouchTickets:
            return OneTouchTicketsCellContent
        case TableColumn.OnlineTime:
            return OnlineTimeCellContent
    }
}

const getSummaryCell = (column: TableColumn): React.FC => {
    switch (column) {
        case TableColumn.RepliedTickets:
            return TicketsRepliedCellSummary
        case TableColumn.ClosedTickets:
            return ClosedTicketsCellSummary
        case TableColumn.PercentageOfClosedTickets:
            return PercentageOfClosedTicketsCellSummary
        case TableColumn.MessagesSent:
            return MessagesSentCellSummary
        case TableColumn.MedianFirstResponseTime:
            return MedianFirstResponseTimeCellSummary
        case TableColumn.CustomerSatisfaction:
            return CustomerSatisfactionCellSummary
        case TableColumn.MedianResolutionTime:
            return MedianResolutionTimeCellSummary
        case TableColumn.OneTouchTickets:
            return OneTouchTicketsCellSummary
        case TableColumn.OnlineTime:
            return OnlineTimeCellSummary
        case TableColumn.AgentName:
            return SummaryCell
    }
}

export const AgentsTable = () => {
    const agents = useAppSelector<Pick<User, 'id'>[]>(getSortedAgents)
    const {
        currentPage,
        perPage,
        agents: paginatedAgents,
    } = useAppSelector(getPaginatedAgents)
    const dispatch = useDispatch()
    const onPageChangeCallback = (page: number) => {
        dispatch(pageSet(page))
    }
    const [ref, {width}] = useMeasure<HTMLDivElement>()
    const [isTableScrolled, setIsTableScrolled] = useState(false)
    const handleScroll: UIEventHandler<HTMLDivElement> = (event) => {
        if (event.currentTarget.scrollLeft > 0) {
            setIsTableScrolled(true)
        } else {
            setIsTableScrolled(false)
        }
    }
    const {columnsOrder} = useAgentsTableConfigSetting()

    return (
        <>
            <div ref={ref} className={css.container} onScroll={handleScroll}>
                <TableWrapper className={css.table} style={{width}}>
                    <TableHead>
                        {columnsOrder.map((column, index) => (
                            <AgentsHeaderCellContent
                                key={`header-cell-${column}`}
                                width={getColumnWidth(column)} //TODO: consider introducing common props per cell type (header, average, body)
                                justifyContent={getColumnAlignment(column)}
                                className={classNames(css.BodyCell, {
                                    [css.withShadow]:
                                        index === 0 && isTableScrolled,
                                })}
                                column={column}
                            />
                        ))}
                    </TableHead>
                    <TableBody>
                        <TableBodyRow>
                            {columnsOrder.map((column) => (
                                <BodyCell
                                    key={column}
                                    width={getColumnWidth(column)}
                                    isHighlighted
                                    justifyContent={getColumnAlignment(column)}
                                    className={classNames(css.BodyCell, {
                                        [css.withShadow]:
                                            column === TableColumn.AgentName &&
                                            isTableScrolled,
                                        [css.highlight]: true,
                                    })}
                                    innerClassName={css.BodyCellContent}
                                >
                                    {React.createElement(
                                        getSummaryCell(column)
                                    )}
                                </BodyCell>
                            ))}
                        </TableBodyRow>
                        {paginatedAgents.map((agent) => (
                            <TableBodyRow key={agent.id}>
                                {columnsOrder.map((column) => (
                                    <React.Fragment key={column}>
                                        {React.createElement(getCell(column), {
                                            agent,
                                            column,
                                            bodyCellProps: {
                                                width: getColumnWidth(column),
                                                justifyContent:
                                                    getColumnAlignment(column),
                                                className: classNames(
                                                    css.BodyCell,
                                                    {
                                                        [css.withShadow]:
                                                            column ===
                                                                TableColumn.AgentName &&
                                                            isTableScrolled,
                                                    }
                                                ),
                                                innerClassName:
                                                    css.BodyCellContent,
                                            },
                                        })}
                                    </React.Fragment>
                                ))}
                            </TableBodyRow>
                        ))}
                    </TableBody>
                </TableWrapper>
            </div>
            <div>
                {agents.length >= perPage && (
                    <NumberedPagination
                        count={Math.ceil(agents.length / perPage)}
                        page={currentPage}
                        onChange={onPageChangeCallback}
                        className={css.pagination}
                    />
                )}
            </div>
        </>
    )
}
