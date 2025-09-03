import { MacroAction } from '@gorgias/helpdesk-types'

import { TimedeltaLabel } from 'pages/common/utils/labels'

import css from './Preview.less'

export const SnoozeTicketPreview = ({
    snoozeTicketAction,
}: {
    snoozeTicketAction?: MacroAction
}) => {
    if (!snoozeTicketAction) return null

    const duration = snoozeTicketAction.arguments.snooze_timedelta as string

    return (
        <div className={css.macroData}>
            <strong className="text-muted">Snooze for </strong>
            <TimedeltaLabel duration={duration} />
        </div>
    )
}
