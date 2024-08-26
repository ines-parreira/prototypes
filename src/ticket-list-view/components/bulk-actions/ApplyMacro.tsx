import {fromJS, List} from 'immutable'
import React, {useCallback, useMemo, useRef, useState} from 'react'
import {Tooltip} from '@gorgias/ui-kit'

import useAppSelector from 'hooks/useAppSelector'
import IconButton from 'pages/common/components/button/IconButton'
import MacroContainer from 'pages/tickets/common/macros/MacroContainer'
import {getActiveView} from 'state/views/selectors'

import css from './style.less'

type Props = {
    isDisabled: boolean
    onComplete: () => void
    ticketIds: number[]
}

export default function ApplyMacro({isDisabled, onComplete, ticketIds}: Props) {
    const ref = useRef(null)
    const activeView = useAppSelector(getActiveView)
    const [isMacroModalOpen, setIsMacroModalOpen] = useState(false)

    const selectedTicketIdsImmutable = useMemo(
        () => fromJS(ticketIds) as List<number>,
        [ticketIds]
    )

    const onCloseModal = useCallback(() => {
        setIsMacroModalOpen(false)
    }, [])

    const onOpenModal = useCallback(() => {
        setIsMacroModalOpen(true)
    }, [])

    return (
        <>
            <IconButton
                ref={ref}
                className={css.button}
                size="small"
                fillStyle="ghost"
                intent="secondary"
                onClick={onOpenModal}
                isDisabled={isDisabled}
            >
                bolt
            </IconButton>
            <Tooltip target={ref}>Apply macro</Tooltip>
            {isMacroModalOpen && (
                <MacroContainer
                    activeView={activeView}
                    disableExternalActions
                    selectedItemsIds={selectedTicketIdsImmutable}
                    closeModal={onCloseModal}
                    allViewItemsSelected={selectedTicketIdsImmutable.isEmpty()}
                    selectionMode
                    onComplete={onComplete}
                />
            )}
        </>
    )
}
