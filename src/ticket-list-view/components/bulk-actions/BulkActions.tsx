import React, {useMemo} from 'react'

import ApplyMacro from './ApplyMacro'
import CloseTickets from './CloseTickets'

import css from './BulkActions.less'

export default function BulkActions({
    onComplete,
    selectedTickets,
}: {
    onComplete: () => void
    selectedTickets: Record<number, boolean>
}) {
    const ticketIds = useMemo(
        () =>
            Object.entries(selectedTickets).reduce<number[]>(
                (ids, [id, isSelected]) =>
                    isSelected ? [...ids, parseInt(id)] : ids,
                []
            ),
        [selectedTickets]
    )

    return (
        <div className={css.bulkActions}>
            <CloseTickets onComplete={onComplete} ticketIds={ticketIds} />
            <ApplyMacro onComplete={onComplete} ticketIds={ticketIds} />
        </div>
    )
}
