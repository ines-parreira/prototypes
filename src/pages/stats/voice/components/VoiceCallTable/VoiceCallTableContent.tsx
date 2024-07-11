import React, {ComponentProps, UIEventHandler, useMemo, useState} from 'react'
import classNames from 'classnames'
import {Link} from 'react-router-dom'
import useMeasure from 'hooks/useMeasure'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import VoiceIntegrationBasicLabel from 'pages/common/components/VoiceIntegrationBasicLabel/VoiceIntegrationBasicLabel'
import VoiceCallStatusLabel from 'pages/common/components/VoiceCallStatusLabel/VoiceCallStatusLabel'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import {getFormattedDurationEndedCall} from 'models/voiceCall/utils'
import VoiceCallActivity from 'pages/stats/voice/components/VoiceCallActivity/VoiceCallActivity'
import {
    isInboundVoiceCallSummary,
    VoiceCallSummary,
} from 'pages/stats/voice/models/types'
import {TruncateCellContent} from 'pages/stats/TruncateCellContent'
import {CALL_LIST_PAGE_SIZE} from 'pages/stats/voice/constants/voiceOverview'
import VoiceCallRecording from 'pages/stats/voice/components/VoiceCallRecording/VoiceCallRecording'
import {NoDataAvailable} from 'pages/stats/NoDataAvailable'

import css from './VoiceCallTable.less'

type VoiceCallTableContentProps = {
    data?: VoiceCallSummary[]
    isFetching: boolean
}

export default function VoiceCallTableContent({
    data,
    isFetching,
}: VoiceCallTableContentProps) {
    const [ref, {width}] = useMeasure<HTMLDivElement>()
    const [isTableScrolled, setIsTableScrolled] = useState(false)

    const handleScroll: UIEventHandler<HTMLDivElement> = (event) => {
        if (event.currentTarget.scrollLeft > 0) {
            setIsTableScrolled(true)
        } else {
            setIsTableScrolled(false)
        }
    }

    const skeletons = useMemo(() => {
        return new Array(CALL_LIST_PAGE_SIZE).fill(null).map((_, rowIndex) => (
            <TableBodyRow key={rowIndex} className={css.tableRow}>
                {[
                    ['activity', 364],
                    ['integration', 174],
                    ['date', 154],
                    ['state', 74],
                    ['recording', 84],
                    ['duration', 74],
                    ['wait time', 84],
                    ['ticket', 82],
                ].map(([key, width]) => (
                    <BodyCell
                        key={key}
                        justifyContent={
                            key === 'duration' || key === 'wait time'
                                ? 'right'
                                : 'left'
                        }
                        className={classNames({
                            [css.withShadow]:
                                isTableScrolled && key === 'activity',
                        })}
                    >
                        <Skeleton inline width={width} />
                    </BodyCell>
                ))}
            </TableBodyRow>
        ))
    }, [isTableScrolled])

    if (!isFetching && data?.length === 0) {
        return (
            <NoDataAvailable
                title="No voice calls"
                description="Try adjusting filters to get results."
                className={css.noData}
            />
        )
    }

    return (
        <>
            <div ref={ref} className={css.container} onScroll={handleScroll}>
                <TableWrapper className={css.table} style={{width}}>
                    <TableHead
                        className={classNames(css.tableHead, css.tableRow)}
                    >
                        {getOrderedHeaderCells({isTableScrolled}).map(
                            (cell) => (
                                <HeaderCellProperty
                                    key={`${cell.key}-header-cell`}
                                    {...cell.props}
                                />
                            )
                        )}
                    </TableHead>
                    <TableBody>
                        {isFetching
                            ? skeletons
                            : data?.map((item, index) => (
                                  <TableBodyRow
                                      key={`row-${index}`}
                                      className={css.tableRow}
                                  >
                                      {getOrderedCells({
                                          item,
                                          isTableScrolled,
                                      }).map((cell) => (
                                          <BodyCell
                                              key={`${cell.key}-cell`}
                                              {...cell.props}
                                          />
                                      ))}
                                  </TableBodyRow>
                              ))}
                    </TableBody>
                </TableWrapper>
            </div>
        </>
    )
}

type HeaderCell = {
    key: string
    props: ComponentProps<typeof HeaderCellProperty>
}

const getOrderedHeaderCells = ({
    isTableScrolled,
}: {
    isTableScrolled: boolean
}): HeaderCell[] => {
    const headerCells: HeaderCell[] = [
        {
            key: 'activity',
            props: {
                title: 'Activity',
                key: 'activity-header-cell',
                className: classNames(css.activityCell, {
                    [css.withShadow]: isTableScrolled,
                }),
            },
        },
        {
            key: 'integration',
            props: {
                title: 'Integration',
                key: 'integration-header-cell',
                className: css.integrationCell,
            },
        },
        {
            key: 'date',
            props: {
                title: 'Date',
                className: css.dateCell,
            },
        },
        {
            key: 'state',
            props: {
                title: 'State',
                key: 'state-header-cell',
                className: css.tinyCell,
                tooltip: (
                    <>
                        The status of the phone call.
                        <br />
                        <a
                            href="https://docs.gorgias.com/en-US/voice-statistics-384475#activity"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Learn about the call states
                        </a>
                    </>
                ),
            },
        },
        {
            key: 'recording',
            props: {
                title: 'Recording',
                key: 'recording-header-cell',
                className: css.smallCell,
                tooltip: 'Call recording or voicemail left by customer.',
            },
        },
        {
            key: 'duration',
            props: {
                title: 'Length',
                justifyContent: 'right',
                wrapContent: true,
                className: css.tinyCell,
                tooltip:
                    'Total duration from the moment the agent accepts the call.',
            },
        },
        {
            key: 'wait time',
            props: {
                title: 'Wait time',
                justifyContent: 'right',
                wrapContent: true,
                className: css.smallCell,
                tooltip:
                    'Time a customer spent waiting to be connected to an agent or sent to voicemail.',
            },
        },
        {
            key: 'ticket',
            props: {
                title: 'Ticket',
                className: css.ticketCell,
            },
        },
    ]

    return headerCells
}

type Cell = {
    key: string
    props: ComponentProps<typeof BodyCell>
}

const getOrderedCells = ({
    item,
    order,
    isTableScrolled,
}: {
    item: VoiceCallSummary
    order?: any
    isTableScrolled: boolean
}): Cell[] => {
    const cells: Cell[] = [
        {
            key: 'activity',
            props: {
                className: classNames(css.activityCell, {
                    [css.withShadow]: isTableScrolled,
                }),
                children: <VoiceCallActivity voiceCall={item} />,
            },
        },
        {
            key: 'integration',
            props: {
                className: css.integrationCell,
                children: (
                    <TruncateCellContent
                        content={
                            item.integrationId ? (
                                <VoiceIntegrationBasicLabel
                                    integrationId={item.integrationId}
                                    phoneNumber={
                                        isInboundVoiceCallSummary(item)
                                            ? item.phoneNumberDestination
                                            : item.phoneNumberSource
                                    }
                                />
                            ) : (
                                '-'
                            )
                        }
                        className={css.truncateContent}
                    />
                ),
            },
        },
        {
            key: 'date',
            props: {
                className: css.dateCell,
                children: (
                    <DatetimeLabel
                        dateTime={item.createdAt?.slice(0, -4)}
                        breakDate
                    />
                ),
            },
        },
        {
            key: 'state',
            props: {
                className: css.tinyCell,
                children: (
                    <VoiceCallStatusLabel
                        voiceCallStatus={item.status}
                        direction={item.direction}
                        lastAnsweredByAgentId={item.agentId}
                    />
                ),
            },
        },
        {
            key: 'recording',
            props: {
                className: css.smallCell,
                children: <VoiceCallRecording voiceCall={item} />,
            },
        },
        {
            key: 'duration',
            props: {
                className: css.tinyCell,
                justifyContent: 'right',
                children: (
                    <>
                        {!!item.talkTime
                            ? getFormattedDurationEndedCall(item.talkTime)
                            : '-'}
                    </>
                ),
            },
        },
        {
            key: 'wait time',
            props: {
                className: css.smallCell,
                justifyContent: 'right',
                children: (
                    <>
                        {!!item.waitTime
                            ? getFormattedDurationEndedCall(item.waitTime)
                            : '-'}
                    </>
                ),
            },
        },
        {
            key: 'ticket',
            props: {
                className: css.ticketCell,
                children: (
                    <>
                        {item.ticketId ? (
                            <Link
                                to={`/app/ticket/${item.ticketId}`}
                                target="_blank"
                            >
                                View ticket
                            </Link>
                        ) : (
                            '-'
                        )}
                    </>
                ),
            },
        },
    ]

    return order ? cells : cells
}
