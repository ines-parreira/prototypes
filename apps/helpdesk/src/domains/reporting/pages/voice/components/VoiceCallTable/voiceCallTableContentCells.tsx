import type { ComponentProps } from 'react'

import classNames from 'classnames'
import { Link } from 'react-router-dom'

import { TruncateCellContent } from 'domains/reporting/pages/common/components/TruncateCellContent'
import LiveVoiceCallStatusLabel from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceCallStatusLabel'
import MonitorCell from 'domains/reporting/pages/voice/components/LiveVoice/MonitorCell'
import VoiceCallActivity from 'domains/reporting/pages/voice/components/VoiceCallActivity/VoiceCallActivity'
import VoiceCallRecording from 'domains/reporting/pages/voice/components/VoiceCallRecording/VoiceCallRecording'
import {
    VoiceCallTableColumn,
    voiceCallTableColumnName,
} from 'domains/reporting/pages/voice/components/VoiceCallTable/constants'
import { filterAndOrderCells } from 'domains/reporting/pages/voice/components/VoiceCallTable/utils'
import css from 'domains/reporting/pages/voice/components/VoiceCallTable/VoiceCallTable.less'
import VoiceCallTransferActivity from 'domains/reporting/pages/voice/components/VoiceCallTransferActivity/VoiceCallTransferActivity'
import type { VoiceCallSummary } from 'domains/reporting/pages/voice/models/types'
import { isInboundVoiceCallSummary } from 'domains/reporting/pages/voice/models/types'
import { getFormattedDurationEndedCall } from 'models/voiceCall/utils'
import type BodyCell from 'pages/common/components/table/cells/BodyCell'
import type HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import VoiceCallStatusLabel from 'pages/common/components/VoiceCallStatusLabel/VoiceCallStatusLabel'
import VoiceCallTimerBadge from 'pages/common/components/VoiceCallTimerBadge/VoiceCallTimerBadge'
import VoiceIntegrationBasicLabel from 'pages/common/components/VoiceIntegrationBasicLabel/VoiceIntegrationBasicLabel'
import VoiceQueueLabel from 'pages/common/components/VoiceQueueLabel/VoiceQueueLabel'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'

export const getOrderedHeaderCells = ({
    isTableScrolled,
    columns,
    ongoingTimeColumnTitle,
}: {
    columns?: VoiceCallTableColumn[]
    isTableScrolled: boolean
    ongoingTimeColumnTitle?: string
}) => {
    const headerCells: Record<
        VoiceCallTableColumn,
        { props: ComponentProps<typeof HeaderCellProperty> }
    > = {
        [VoiceCallTableColumn.Activity]: {
            props: {
                title: voiceCallTableColumnName[VoiceCallTableColumn.Activity],
                className: classNames(css.activityCell, {
                    [css.withShadow]: isTableScrolled,
                }),
            },
        },
        [VoiceCallTableColumn.TransferActivity]: {
            props: {
                title: voiceCallTableColumnName[
                    VoiceCallTableColumn.TransferActivity
                ],
                className: classNames(css.transferActivityCell, {
                    [css.withShadow]: isTableScrolled,
                }),
            },
        },
        [VoiceCallTableColumn.Integration]: {
            props: {
                title: voiceCallTableColumnName[
                    VoiceCallTableColumn.Integration
                ],
                className: css.integrationCell,
            },
        },
        [VoiceCallTableColumn.Queue]: {
            props: {
                title: voiceCallTableColumnName[VoiceCallTableColumn.Queue],
                className: css.integrationCell,
            },
        },
        [VoiceCallTableColumn.Date]: {
            props: {
                title: voiceCallTableColumnName[VoiceCallTableColumn.Date],
                className: css.dateCell,
            },
        },
        [VoiceCallTableColumn.State]: {
            props: {
                title: voiceCallTableColumnName[VoiceCallTableColumn.State],
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
        [VoiceCallTableColumn.Recording]: {
            props: {
                title: voiceCallTableColumnName[VoiceCallTableColumn.Recording],
                className: css.smallCell,
                tooltip: 'Call recording or voicemail left by customer.',
            },
        },
        [VoiceCallTableColumn.Duration]: {
            props: {
                title: voiceCallTableColumnName[VoiceCallTableColumn.Duration],
                justifyContent: 'right',
                wrapContent: true,
                className: css.tinyCell,
            },
        },
        [VoiceCallTableColumn.TalkTime]: {
            props: {
                title: voiceCallTableColumnName[VoiceCallTableColumn.TalkTime],
                justifyContent: 'right',
                wrapContent: true,
                className: css.tinyCell,
                tooltip:
                    'Total duration from the moment the agent accepts the call.',
            },
        },
        [VoiceCallTableColumn.WaitTime]: {
            props: {
                title: voiceCallTableColumnName[VoiceCallTableColumn.WaitTime],
                justifyContent: 'right',
                wrapContent: true,
                className: css.smallCell,
                tooltip:
                    'Time a customer spent waiting to be connected to an agent or sent to voicemail.',
            },
        },
        [VoiceCallTableColumn.Ticket]: {
            props: {
                title: voiceCallTableColumnName[VoiceCallTableColumn.Ticket],
                className: css.ticketCell,
            },
        },
        [VoiceCallTableColumn.OngoingTime]: {
            props: {
                title:
                    ongoingTimeColumnTitle ??
                    voiceCallTableColumnName[VoiceCallTableColumn.OngoingTime],
                className: css.smallCell,
            },
        },
        [VoiceCallTableColumn.LiveStatus]: {
            props: {
                title: voiceCallTableColumnName[
                    VoiceCallTableColumn.LiveStatus
                ],
                className: css.smallCell,
            },
        },
        [VoiceCallTableColumn.Monitor]: {
            props: {
                title: voiceCallTableColumnName[VoiceCallTableColumn.Monitor],
                className: css.smallCell,
            },
        },
    }

    return filterAndOrderCells<typeof HeaderCellProperty>(headerCells, columns)
}

export const getOrderedCells = ({
    item,
    columns,
    isTableScrolled,
    isRecordingDownloadable,
}: {
    item: VoiceCallSummary
    columns?: VoiceCallTableColumn[]
    isTableScrolled: boolean
    isRecordingDownloadable?: boolean
}) => {
    const cells: Record<
        VoiceCallTableColumn,
        { props: ComponentProps<typeof BodyCell> }
    > = {
        [VoiceCallTableColumn.Activity]: {
            props: {
                className: classNames(css.activityCell, {
                    [css.withShadow]: isTableScrolled,
                }),
                children: <VoiceCallActivity voiceCall={item} />,
            },
        },
        [VoiceCallTableColumn.TransferActivity]: {
            props: {
                className: classNames(css.transferActivityCell, {
                    [css.withShadow]: isTableScrolled,
                }),
                children: <VoiceCallTransferActivity voiceCall={item} />,
            },
        },
        [VoiceCallTableColumn.Integration]: {
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
                        left
                    />
                ),
            },
        },
        [VoiceCallTableColumn.Queue]: {
            props: {
                className: css.integrationCell,
                children: (
                    <TruncateCellContent
                        content={
                            item.queueId ? (
                                <VoiceQueueLabel
                                    queueId={item.queueId}
                                    queueName={item.queueName}
                                />
                            ) : (
                                '-'
                            )
                        }
                        className={css.truncateContent}
                        left
                    />
                ),
            },
        },
        [VoiceCallTableColumn.Date]: {
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
        [VoiceCallTableColumn.State]: {
            props: {
                className: css.tinyCell,
                children: (
                    <VoiceCallStatusLabel displayStatus={item.displayStatus} />
                ),
            },
        },
        [VoiceCallTableColumn.Recording]: {
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
        [VoiceCallTableColumn.Duration]: {
            props: {
                className: css.tinyCell,
                justifyContent: 'right',
                children: (
                    <>
                        {!!item.duration
                            ? getFormattedDurationEndedCall(item.duration)
                            : '-'}
                    </>
                ),
            },
        },
        [VoiceCallTableColumn.TalkTime]: {
            props: {
                className: css.smallCell,
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
        [VoiceCallTableColumn.WaitTime]: {
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
        [VoiceCallTableColumn.Ticket]: {
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
        [VoiceCallTableColumn.OngoingTime]: {
            props: {
                className: css.smallCell,
                children: (
                    <>
                        {!!item.createdAt ? (
                            <VoiceCallTimerBadge datetime={item.createdAt} />
                        ) : (
                            '-'
                        )}
                    </>
                ),
            },
        },
        [VoiceCallTableColumn.LiveStatus]: {
            props: {
                className: css.smallCell,
                children: (
                    <LiveVoiceCallStatusLabel
                        direction={item.direction}
                        status={item.status}
                    />
                ),
            },
        },
        [VoiceCallTableColumn.Monitor]: {
            props: {
                className: css.smallCell,
                children: <MonitorCell voiceCall={item} />,
            },
        },
    }

    return filterAndOrderCells<typeof BodyCell>(cells, columns)
}
