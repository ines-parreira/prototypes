import { MacroAction, TicketPriority } from '@gorgias/helpdesk-types'

import { PriorityLabel } from 'pages/tickets/common/components/PriorityLabel'

import css from './Preview.less'

export const SetPriorityPreview = ({
    setPriorityAction,
}: {
    setPriorityAction?: MacroAction
}) => {
    if (!setPriorityAction) return null

    return (
        <div className={css.macroData}>
            <strong className="text-muted mr-2">Set priority:</strong>
            <PriorityLabel
                priority={
                    setPriorityAction.arguments.priority as TicketPriority
                }
            />
        </div>
    )
}
