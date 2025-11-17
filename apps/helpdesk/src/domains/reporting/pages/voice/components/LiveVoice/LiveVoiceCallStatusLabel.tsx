import classNames from 'classnames'

import { VoiceCallDirection } from '@gorgias/helpdesk-queries'

import css from 'domains/reporting/pages/voice/components/LiveVoice/LiveVoiceCallStatusLabel.less'
import {
    isLiveCallRinging,
    isLiveInboundVoiceCallAnswered,
} from 'domains/reporting/pages/voice/components/LiveVoice/utils'
import type { VoiceCallSummary } from 'domains/reporting/pages/voice/models/types'

type Props = {
    direction: VoiceCallDirection
    status: VoiceCallSummary['status']
}

export default function LiveVoiceCallStatusLabel({ direction, status }: Props) {
    const isOutbound = direction === VoiceCallDirection.Outbound

    if (isOutbound && isLiveCallRinging(status)) {
        return <div className={css.status}>Ringing</div>
    }

    if (isOutbound || isLiveInboundVoiceCallAnswered(status)) {
        return (
            <div className={classNames(css.status, css.active)}>
                In progress
            </div>
        )
    }

    return <div className={css.status}>In queue</div>
}
