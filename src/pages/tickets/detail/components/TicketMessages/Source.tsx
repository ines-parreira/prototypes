import React from 'react'
import classnames from 'classnames'
import _isArray from 'lodash/isArray'

import {TicketMessageSourceType} from '../../../../../business/types/ticket'
import SourceIcon from '../../../../common/components/SourceIcon'
import {DatetimeLabel} from '../../../../common/utils/labels'
import {
    Source as SourceType,
    SourceAddress,
} from '../../../../../models/ticket/types'
import {getPersonLabelFromSource} from '../../../common/utils'
import Tooltip from '../../../../common/components/Tooltip'

import css from './Source.less'

type Props = {
    id: string
    isForwarded: boolean
    createdDatetime: string
    source: SourceType
}

export default function Source({
    createdDatetime,
    id,
    isForwarded,
    source,
}: Props) {
    return (
        <div>
            <span className={classnames('clickable', css.source)}>
                <SourceIcon
                    id={id}
                    type={
                        isForwarded
                            ? TicketMessageSourceType.EmailForward
                            : source.type
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
                            <span className="text-faded">Sent via: </span>
                            <strong>{source.type}</strong>
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
