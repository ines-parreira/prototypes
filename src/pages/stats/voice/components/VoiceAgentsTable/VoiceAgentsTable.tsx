import React, {UIEventHandler, useState} from 'react'
import classNames from 'classnames'
import {useDispatch} from 'react-redux'
import {Link} from 'react-router-dom'

import {User} from 'config/types/user'
import useMeasure from 'hooks/useMeasure'
import useAppSelector from 'hooks/useAppSelector'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import {
    getPaginatedAgents,
    getSortedAgents,
    pageSet,
} from 'state/ui/stats/agentPerformanceSlice'
import {mergeStatsFilters} from 'state/stats/statsSlice'
import {NumberedPagination} from 'pages/common/components/Paginations'
import {AgentAvatar} from 'pages/stats/AgentAvatar'
import {
    useAnsweredCallsMetricPerAgent,
    useMissedCallsMetricPerAgent,
    useOutboundCallsMetricPerAgent,
    useTotalCallsMetricPerAgent,
    useDeclinedCallsMetricPerAgent,
} from 'pages/stats/voice/hooks/metricsPerDimension'
import {
    useAnsweredCallsMetric,
    useDeclinedCallsMetric,
    useMissedCallsMetric,
    useOutboundCallsMetric,
    useTotalCallsMetric,
} from 'pages/stats/voice/hooks/agentMetrics'

import AverageTalkTimeCell from './AverageTalkTimeCell'
import CallsCountCell from './CallsCountCell'
import TeamAverageCallsCountCell from './TeamAverageCallsCountCell'
import TeamAverageTalkTimeCell from './TeamAverageTalkTimeCell'
import css from './VoiceAgentsTable.less'

export const VoiceAgentsTable = () => {
    const agents = useAppSelector<Pick<User, 'id'>[]>(getSortedAgents)
    const {
        currentPage,
        perPage,
        agents: paginatedAgents,
    } = useAppSelector(getPaginatedAgents)
    const [ref, {width}] = useMeasure<HTMLDivElement>()
    const [isTableScrolled, setIsTableScrolled] = useState(false)
    const dispatch = useDispatch()

    const handlePageChange = (page: number) => {
        dispatch(pageSet(page))
    }

    const handleScroll: UIEventHandler<HTMLDivElement> = (event) => {
        if (event.currentTarget.scrollLeft > 0) {
            setIsTableScrolled(true)
        } else {
            setIsTableScrolled(false)
        }
    }

    const handleAgentClick = (agentId: number) => {
        dispatch(mergeStatsFilters({agents: [agentId]}))
    }

    return (
        <>
            <div ref={ref} className={css.container} onScroll={handleScroll}>
                <TableWrapper className={css.table} style={{width}}>
                    <TableHead
                        className={classNames(css.tableHead, css.tableRow)}
                    >
                        <HeaderCellProperty
                            title={'Agent'}
                            className={classNames(css.agentsCell, {
                                [css.withShadow]: isTableScrolled,
                            })}
                        />
                        <HeaderCellProperty
                            title={'Total calls'}
                            justifyContent={'right'}
                            wrapContent={true}
                            className={css.metricCell}
                        />
                        <HeaderCellProperty
                            title={'Inbound Answered'}
                            justifyContent={'right'}
                            wrapContent={true}
                            className={css.metricCell}
                        />
                        <HeaderCellProperty
                            title={'Inbound Missed'}
                            justifyContent={'right'}
                            wrapContent={true}
                            className={css.metricCell}
                        />
                        <HeaderCellProperty
                            title={'Inbound Declined'}
                            justifyContent={'right'}
                            wrapContent={true}
                            className={css.metricCell}
                        />
                        <HeaderCellProperty
                            title={'Outbound'}
                            justifyContent={'right'}
                            wrapContent={true}
                            className={css.metricCell}
                        />
                        <HeaderCellProperty
                            title={'Avg. Talk Time'}
                            justifyContent={'right'}
                            wrapContent={true}
                            className={css.metricCell}
                            tooltip={
                                'Average time agent spent talking to customers'
                            }
                        />
                    </TableHead>
                    <TableBody>
                        <TableBodyRow
                            className={classNames(css.tableRow, css.summaryRow)}
                        >
                            <BodyCell
                                className={classNames(css.agentsCell, {
                                    [css.withShadow]: isTableScrolled,
                                })}
                            >
                                Average
                            </BodyCell>
                            <TeamAverageCallsCountCell
                                agentsCount={agents.length}
                                useMetric={useTotalCallsMetric}
                            />
                            <TeamAverageCallsCountCell
                                agentsCount={agents.length}
                                useMetric={useAnsweredCallsMetric}
                            />
                            <TeamAverageCallsCountCell
                                agentsCount={agents.length}
                                useMetric={useMissedCallsMetric}
                            />
                            <TeamAverageCallsCountCell
                                agentsCount={agents.length}
                                useMetric={useDeclinedCallsMetric}
                            />
                            <TeamAverageCallsCountCell
                                agentsCount={agents.length}
                                useMetric={useOutboundCallsMetric}
                            />
                            <TeamAverageTalkTimeCell />
                        </TableBodyRow>
                        {paginatedAgents.map((agent) => (
                            <TableBodyRow
                                key={agent.id}
                                className={css.tableRow}
                            >
                                <BodyCell
                                    className={classNames(css.agentsCell, {
                                        [css.withShadow]: isTableScrolled,
                                    })}
                                >
                                    <Link
                                        to="/app/stats/voice-overview"
                                        onClick={() =>
                                            handleAgentClick(agent.id)
                                        }
                                        className={classNames(
                                            css.container,
                                            css.agentsContainer
                                        )}
                                    >
                                        <AgentAvatar agent={agent} />
                                    </Link>
                                </BodyCell>
                                <CallsCountCell
                                    agent={agent}
                                    useMetricPerAgent={
                                        useTotalCallsMetricPerAgent
                                    }
                                />
                                <CallsCountCell
                                    agent={agent}
                                    useMetricPerAgent={
                                        useAnsweredCallsMetricPerAgent
                                    }
                                />
                                <CallsCountCell
                                    agent={agent}
                                    useMetricPerAgent={
                                        useMissedCallsMetricPerAgent
                                    }
                                />
                                <CallsCountCell
                                    agent={agent}
                                    useMetricPerAgent={
                                        useDeclinedCallsMetricPerAgent
                                    }
                                />
                                <CallsCountCell
                                    agent={agent}
                                    useMetricPerAgent={
                                        useOutboundCallsMetricPerAgent
                                    }
                                />
                                <AverageTalkTimeCell agent={agent} />
                            </TableBodyRow>
                        ))}
                    </TableBody>
                </TableWrapper>
            </div>
            <div className={css.pagination}>
                {agents.length >= perPage && (
                    <NumberedPagination
                        count={Math.ceil(agents.length / perPage)}
                        page={currentPage}
                        onChange={handlePageChange}
                    />
                )}
            </div>
        </>
    )
}
