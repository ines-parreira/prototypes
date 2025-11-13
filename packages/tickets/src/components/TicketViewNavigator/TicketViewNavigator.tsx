import { useCallback } from 'react'

import { useHistory, useParams } from 'react-router'

import { Button, Tooltip, TooltipContent } from '@gorgias/axiom'

import { useTicketsLegacyBridge } from '../../utils/LegacyBridge'

import css from './TicketViewNavigator.less'

export function TicketViewNavigator() {
    const { ticketViewNavigation } = useTicketsLegacyBridge()
    const history = useHistory()
    const { viewId } = useParams<{
        viewId?: string
    }>()

    const handleGoToPreviousViewTicket = useCallback(() => {
        if (ticketViewNavigation.shouldUseLegacyFunctions) {
            return ticketViewNavigation.legacyGoToPrevTicket()
        }
        if (viewId && ticketViewNavigation.previousTicketId) {
            history.push(
                `/app/views/${viewId}/${ticketViewNavigation.previousTicketId}`,
            )
        }
    }, [viewId, ticketViewNavigation, history])

    const handleGoToNextViewTicket = useCallback(() => {
        if (ticketViewNavigation.shouldUseLegacyFunctions) {
            return ticketViewNavigation.legacyGoToNextTicket()
        }
        if (viewId && ticketViewNavigation.nextTicketId) {
            history.push(
                `/app/views/${viewId}/${ticketViewNavigation.nextTicketId}`,
            )
        }
    }, [viewId, ticketViewNavigation, history])

    if (!ticketViewNavigation.shouldDisplay) {
        return null
    }

    return (
        <div className={css.ticketViewNavigatorContainer}>
            <Tooltip placement="bottom">
                <Button
                    isDisabled={!ticketViewNavigation.isPreviousEnabled}
                    variant="tertiary"
                    icon="arrow-chevron-left"
                    size="sm"
                    onClick={handleGoToPreviousViewTicket}
                />
                <TooltipContent title="Previous ticket" shortcut="←" />
            </Tooltip>
            <Tooltip placement="bottom">
                <Button
                    isDisabled={!ticketViewNavigation.isNextEnabled}
                    variant="tertiary"
                    icon="arrow-chevron-right"
                    size="sm"
                    onClick={handleGoToNextViewTicket}
                />
                <TooltipContent title="Next ticket" shortcut="→" />
            </Tooltip>
        </div>
    )
}
