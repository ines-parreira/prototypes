import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useId } from '@repo/hooks'
import { DateAndTimeFormatting } from '@repo/utils'
import classnames from 'classnames'
import _isArray from 'lodash/isArray'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import type { TicketChannel } from 'business/types/ticket'
import { TicketMessageSourceType } from 'business/types/ticket'
import { isTicketMessageSourceType } from 'models/ticket/predicates'
import type {
    Meta,
    SourceAddress,
    Source as SourceType,
} from 'models/ticket/types'
import SourceIcon from 'pages/common/components/SourceIcon'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'
import { getPersonLabelFromSource } from 'pages/tickets/common/utils'
import { toChannel } from 'services/channels'
import { humanizeChannel } from 'state/ticket/utils'

import css from './Source.less'

type Props = {
    isForwarded: boolean
    createdDatetime: string
    source: SourceType
    channel?: TicketChannel | string
    containerRef?: React.RefObject<HTMLElement>
    meta?: Meta
}

export default function Source({
    createdDatetime,
    isForwarded,
    source,
    channel,
    containerRef,
    meta,
}: Props) {
    const id = `source-${useId()}`
    const hasTicketThreadRevamp = useFlag(FeatureFlagKey.TicketThreadRevamp)
    const channelIdentifier = source.type ?? channel
    const sourceChannel = isTicketMessageSourceType(channelIdentifier)
        ? channelIdentifier
        : toChannel(channelIdentifier)

    return (
        <div>
            <span className={classnames('clickable', css.source)}>
                <SourceIcon
                    id={id}
                    type={
                        isForwarded
                            ? TicketMessageSourceType.EmailForward
                            : sourceChannel
                    }
                    variant="secondary"
                />
            </span>
            <Tooltip
                target={id}
                placement="bottom"
                autohide={false}
                container={containerRef}
            >
                <div className={css.details}>
                    <ul>
                        <SourceAddressElement
                            field="from"
                            title="From"
                            source={source}
                        />
                        <SourceAddressElement
                            field="to"
                            title="To"
                            source={source}
                        />
                        <SourceAddressElement
                            field="cc"
                            title="Cc"
                            source={source}
                        />
                        <SourceAddressElement
                            field="bcc"
                            title="Bcc"
                            source={source}
                        />
                        <li>
                            <span className="text-faded">Channel: </span>
                            <strong>
                                {humanizeChannel(channelIdentifier)}
                            </strong>
                        </li>
                        <li>
                            <span className="text-faded">Date: </span>
                            <strong>
                                <DatetimeLabel
                                    dateTime={createdDatetime}
                                    labelFormat={
                                        DateAndTimeFormatting.CompactDateWithTime
                                    }
                                />
                            </strong>
                        </li>
                        {hasTicketThreadRevamp && (
                            <>
                                {source.type ===
                                TicketMessageSourceType.ChatContactForm ? (
                                    <li>
                                        <span className="text-faded">
                                            Via:{' '}
                                        </span>
                                        <strong>contact form</strong>
                                    </li>
                                ) : source.type ===
                                  TicketMessageSourceType.ChatOfflineCapture ? (
                                    <li>
                                        <span className="text-faded">
                                            Via:{' '}
                                        </span>
                                        <strong>offline capture</strong>
                                    </li>
                                ) : null}
                                {meta?.current_page && (
                                    <li>
                                        <span className="text-faded">
                                            Url:{' '}
                                        </span>
                                        <a
                                            target="_blank"
                                            href={meta.current_page}
                                            rel="noopener noreferrer"
                                            title={meta.current_page}
                                        >
                                            {meta.current_page}
                                        </a>
                                    </li>
                                )}
                            </>
                        )}
                    </ul>
                </div>
            </Tooltip>
        </div>
    )
}

function SourceAddressElement({
    field,
    title,
    source,
}: {
    field: keyof SourceType
    title: string
    source: SourceType
}) {
    let fieldSource = source[field] as Maybe<SourceAddress[]>

    if (!fieldSource) {
        return null
    }
    fieldSource = _isArray(fieldSource) ? fieldSource : [fieldSource]

    if (!fieldSource.length) {
        return null
    }

    return (
        <li>
            <span className="text-faded">{title}: </span>
            <strong>
                {fieldSource
                    .map((person) =>
                        getPersonLabelFromSource(person, source.type),
                    )
                    .join(', ')}
            </strong>
        </li>
    )
}
