import {fromJS, List} from 'immutable'
import React, {useMemo} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import MacroContainer from 'pages/tickets/common/macros/MacroContainer'
import {getActiveView} from 'state/views/selectors'

type Props = {
    onApplyMacro: () => void
    setIsOpen: (v: boolean) => void
    ticketIds: number[]
}

export default function ApplyMacro({
    onApplyMacro,
    setIsOpen,
    ticketIds,
}: Props) {
    const activeView = useAppSelector(getActiveView)
    const selectedTicketIdsImmutable = useMemo(
        () => fromJS(ticketIds) as List<number>,
        [ticketIds]
    )

    return (
        <MacroContainer
            activeView={activeView}
            areExternalActionsDisabled
            selectedItemsIds={selectedTicketIdsImmutable}
            closeModal={() => setIsOpen(false)}
            allViewItemsSelected={selectedTicketIdsImmutable.isEmpty()}
            selectionMode
            onComplete={onApplyMacro}
        />
    )
}
