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
import {
    VoiceCallTableColumnName,
    skeletonColumnsWidth,
    tableColumns,
} from './constants'
import {Cell, filterAndOrderCells} from './utils'

type VoiceCallTableContentProps = {
    data?: VoiceCallSummary[]
    isFetching: boolean
    columns?: VoiceCallTableColumnName[]
    onRowClick?: (voiceCall: VoiceCallSummary) => void
    isRecordingDownloadable?: boolean
    useMeasuredWidth?: boolean
}

export default function VoiceCallTableContent({
    data,
    isFetching,
    columns,
    onRowClick,
    isRecordingDownloadable,
    useMeasuredWidth = true,
}: VoiceCallTableContentProps) {
    const [ref, {width: measuredWidth}] = useMeasure<HTMLDivElement>()
    const [isTableScrolled, setIsTableScrolled] = useState(false)

    const width = useMeasuredWidth ? measuredWidth : undefined

    const handleScroll: UIEventHandler<HTMLDivElement> = (event) => {
        if (event.currentTarget.scrollLeft > 0) {
            setIsTableScrolled(true)
        } else {
            setIsTableScrolled(false)
        }
    }

    const skeletons = useMemo(() => {
        const skeletonColumns = columns ?? tableColumns.default
        const orderedSkeletonColumns = skeletonColumns.map((columnName) => [
            columnName,
            skeletonColumnsWidth[columnName],
        ])
        return new Array(CALL_LIST_PAGE_SIZE).fill(null).map((_, rowIndex) => (
            <TableBodyRow key={rowIndex} className={css.tableRow}>
                {orderedSkeletonColumns.map(([key, width]) => (
                    <BodyCell
                        key={key}
                        justifyContent={
                            key === VoiceCallTableColumnName.Length ||
                            key === VoiceCallTableColumnName.WaitTime
                                ? 'right'
                                : 'left'
                        }
                        className={classNames({
                            [css.withShadow]:
                                isTableScrolled &&
                                key === VoiceCallTableColumnName.Activity,
                        })}
                    >
                        <Skeleton inline width={width} />
                    </BodyCell>
                ))}
            </TableBodyRow>
        ))
    }, [isTableScrolled, columns])

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
                        {getOrderedHeaderCells({
                            columns,
                            isTableScrolled,
                        }).map((cell) => (
                            <HeaderCellProperty
                                key={`${cell.key}-header-cell`}
                                {...cell.props}
                            />
                        ))}
                    </TableHead>
                    <TableBody>
                        {isFetching
                            ? skeletons
                            : data?.map((item, index) => (
                                  <TableBodyRow
                                      key={`row-${index}`}
                                      className={css.tableRow}
                                      onClick={() => onRowClick?.(item)}
                                  >
                                      {getOrderedCells({
                                          item,
                                          columns,
                                          isTableScrolled,
                                          isRecordingDownloadable,
                                      }).map((cell: Cell<typeof BodyCell>) => (
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

const getOrderedHeaderCells = ({
    isTableScrolled,
    columns,
}: {
    columns?: VoiceCallTableColumnName[]
    isTableScrolled: boolean
}) => {
    const headerCells: Record<
        VoiceCallTableColumnName,
        {props: ComponentProps<typeof HeaderCellProperty>}
    > = {
        [VoiceCallTableColumnName.Activity]: {
            props: {
                title: VoiceCallTableColumnName.Activity,
                className: classNames(css.activityCell, {
                    [css.withShadow]: isTableScrolled,
                }),
            },
        },
        [VoiceCallTableColumnName.Integration]: {
            props: {
                title: VoiceCallTableColumnName.Integration,
                className: css.integrationCell,
            },
        },
        [VoiceCallTableColumnName.Date]: {
            props: {
                title: VoiceCallTableColumnName.Date,
                className: css.dateCell,
            },
        },
        [VoiceCallTableColumnName.State]: {
            props: {
                title: VoiceCallTableColumnName.State,
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
        [VoiceCallTableColumnName.Recording]: {
            props: {
                title: VoiceCallTableColumnName.Recording,
                className: css.smallCell,
                tooltip: 'Call recording or voicemail left by customer.',
            },
        },
        [VoiceCallTableColumnName.Length]: {
            props: {
                title: VoiceCallTableColumnName.Length,
                justifyContent: 'right',
                wrapContent: true,
                className: css.tinyCell,
                tooltip:
                    'Total duration from the moment the agent accepts the call.',
            },
        },
        [VoiceCallTableColumnName.WaitTime]: {
            props: {
                title: VoiceCallTableColumnName.WaitTime,
                justifyContent: 'right',
                wrapContent: true,
                className: css.smallCell,
                tooltip:
                    'Time a customer spent waiting to be connected to an agent or sent to voicemail.',
            },
        },
        [VoiceCallTableColumnName.Ticket]: {
            props: {
                title: VoiceCallTableColumnName.Ticket,
                className: css.ticketCell,
            },
        },
    }

    return filterAndOrderCells<typeof HeaderCellProperty>(headerCells, columns)
}

const getOrderedCells = ({
    item,
    columns,
    isTableScrolled,
    isRecordingDownloadable,
}: {
    item: VoiceCallSummary
    columns?: VoiceCallTableColumnName[]
    isTableScrolled: boolean
    isRecordingDownloadable?: boolean
}) => {
    const cells: Record<
        VoiceCallTableColumnName,
        {props: ComponentProps<typeof BodyCell>}
    > = {
        [VoiceCallTableColumnName.Activity]: {
            props: {
                className: classNames(css.activityCell, {
                    [css.withShadow]: isTableScrolled,
                }),
                children: <VoiceCallActivity voiceCall={item} />,
            },
        },
        [VoiceCallTableColumnName.Integration]: {
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
        [VoiceCallTableColumnName.Date]: {
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
        [VoiceCallTableColumnName.State]: {
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
        [VoiceCallTableColumnName.Recording]: {
            props: {
                className: css.smallCell,
                children: (
                    <VoiceCallRecording
                        isDownloadable={isRecordingDownloadable}
                        voiceCall={item}
                    />
                ),
            },
        },
        [VoiceCallTableColumnName.Length]: {
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
        [VoiceCallTableColumnName.WaitTime]: {
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
        [VoiceCallTableColumnName.Ticket]: {
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
    }

    return filterAndOrderCells<typeof BodyCell>(cells, columns)
}
