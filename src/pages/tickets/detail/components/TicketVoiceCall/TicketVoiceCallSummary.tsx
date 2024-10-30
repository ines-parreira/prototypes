import React from 'react'

import {VoiceCallSummary} from 'models/voiceCall/types'

import css from './TicketVoiceCallSummary.less'

type Props = {
    summaries: VoiceCallSummary[]
}

export default function TicketVoiceCallSummary({summaries}: Props) {
    if (summaries.length === 0) {
        return <></>
    }
    return (
        <div className={css.summaryContainer}>
            <div className={css.summaryTitle}>Call summary</div>
            {summaries
                .sort((a, b) =>
                    a.created_datetime.localeCompare(b.created_datetime)
                )
                .map((summary) => (
                    <span key={summary.id}>{summary.summary}</span>
                ))}
        </div>
    )
}
