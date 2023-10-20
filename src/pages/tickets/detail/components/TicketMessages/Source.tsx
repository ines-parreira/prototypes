import React from 'react'
import classnames from 'classnames'
import _isArray from 'lodash/isArray'

import {Source as SourceType, SourceAddress} from 'models/ticket/types'
import {TicketChannel, TicketMessageSourceType} from 'business/types/ticket'
import SourceIcon from 'pages/common/components/SourceIcon'
import {DatetimeLabel} from 'pages/common/utils/labels'
import {getPersonLabelFromSource} from 'pages/tickets/common/utils'
import Tooltip from 'pages/common/components/Tooltip'
import {isChannel, toChannel} from 'services/channels'
import {isTicketMessageSourceType} from 'models/ticket/predicates'
import {humanizeChannel} from 'state/ticket/utils'

import css from './Source.less'

type Props = {
    id: string
    isForwarded: boolean
    createdDatetime: string
    source: SourceType
    channel?: TicketChannel | string
}

export default function Source({
    createdDatetime,
    id,
    isForwarded,
    source,
    channel,
}: Props) {
    const channelIdentifier = source.type ?? channel
    const sourceChannel = isTicketMessageSourceType(channelIdentifier)
        ? channelIdentifier
        : toChannel(channelIdentifier)
    const channelName = isChannel(sourceChannel)
        ? sourceChannel.name
        : humanizeChannel(channelIdentifier)

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
                    className="uncolored"
                />
            </span>
            <Tooltip target={id} placement="bottom" autohide={false}>
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
                            <strong>{channelName}</strong>
                        </li>
                        <li>
                            <span className="text-faded">Date: </span>
                            <strong>
                                <DatetimeLabel
                                    dateTime={createdDatetime}
                                    labelFormat="MM-DD-YYYY HH:mm"
                                />
                            </strong>
                        </li>
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
                        getPersonLabelFromSource(person, source.type)
                    )
                    .join(', ')}
            </strong>
        </li>
    )
}
