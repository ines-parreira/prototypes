import { ComponentProps } from 'react'

import classNames from 'classnames'
import { Link } from 'react-router-dom'

import { TruncateCellContent } from 'domains/reporting/pages/common/components/TruncateCellContent'
import LiveVoiceCallStatusLabel from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceCallStatusLabel'
import VoiceCallActivity from 'domains/reporting/pages/voice/components/VoiceCallActivity/VoiceCallActivity'
import VoiceCallRecording from 'domains/reporting/pages/voice/components/VoiceCallRecording/VoiceCallRecording'
import { VoiceCallTableColumnName } from 'domains/reporting/pages/voice/components/VoiceCallTable/constants'
import { filterAndOrderCells } from 'domains/reporting/pages/voice/components/VoiceCallTable/utils'
import css from 'domains/reporting/pages/voice/components/VoiceCallTable/VoiceCallTable.less'
import {
    isInboundVoiceCallSummary,
    VoiceCallSummary,
} from 'domains/reporting/pages/voice/models/types'
import { getFormattedDurationEndedCall } from 'models/voiceCall/utils'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
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
    columns?: VoiceCallTableColumnName[]
    isTableScrolled: boolean
    ongoingTimeColumnTitle?: string
}) => {
    const headerCells: Record<
        VoiceCallTableColumnName,
        { props: ComponentProps<typeof HeaderCellProperty> }
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
        [VoiceCallTableColumnName.Queue]: {
            props: {
                title: VoiceCallTableColumnName.Queue,
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
        [VoiceCallTableColumnName.Duration]: {
            props: {
                title: VoiceCallTableColumnName.Duration,
                justifyContent: 'right',
                wrapContent: true,
                className: css.tinyCell,
            },
        },
        [VoiceCallTableColumnName.TalkTime]: {
            props: {
                title: VoiceCallTableColumnName.TalkTime,
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
        [VoiceCallTableColumnName.OngoingTime]: {
            props: {
                title:
                    ongoingTimeColumnTitle ??
                    VoiceCallTableColumnName.OngoingTime,
                className: css.smallCell,
            },
        },
        [VoiceCallTableColumnName.LiveStatus]: {
            props: {
                title: VoiceCallTableColumnName.LiveStatus,
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
    columns?: VoiceCallTableColumnName[]
    isTableScrolled: boolean
    isRecordingDownloadable?: boolean
}) => {
    const cells: Record<
        VoiceCallTableColumnName,
        { props: ComponentProps<typeof BodyCell> }
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
                        left
                    />
                ),
            },
        },
        [VoiceCallTableColumnName.Queue]: {
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
                    <VoiceCallStatusLabel displayStatus={item.displayStatus} />
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
        [VoiceCallTableColumnName.Duration]: {
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
        [VoiceCallTableColumnName.TalkTime]: {
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
        [VoiceCallTableColumnName.OngoingTime]: {
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
        [VoiceCallTableColumnName.LiveStatus]: {
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
    }

    return filterAndOrderCells<typeof BodyCell>(cells, columns)
}
