import { Meta } from 'models/ticket/types'
import DatetimeLabel from 'pages/common/utils/DatetimeLabel'

import { SourceDetailsFrom } from './SourceDetailsFrom'

type Props = {
    datetime: string
    meta?: Meta
}

export function SourceDetailsInfo({ datetime, meta }: Props) {
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
    return <DatetimeLabel dateTime={datetime} />
}
