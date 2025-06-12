import cn from 'classnames'

import { Meta } from 'models/ticket/types'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'

import { SourceDetailsFrom } from './SourceDetailsFrom'

import css from './SourceDetails.less'

type Props = {
    datetime: string
    hideTimestamp?: boolean
    meta?: Meta
}

export function SourceDetailsInfo({ datetime, hideTimestamp, meta }: Props) {
    if (meta?.is_duplicated) {
        return (
            <SourceDetailsFrom label="go to" key="ref-widget">
                <a
                    target="_blank"
                    href={meta.private_reply!.original_ticket_id}
                    rel="noopener noreferrer"
                >
                    ticket
                </a>
            </SourceDetailsFrom>
        )
    }
    return (
        <DatetimeLabel
            dateTime={datetime}
            className={cn({ [css.hideTimestamp]: hideTimestamp })}
        />
    )
}
