import { Button, Tooltip, TooltipContent } from '@gorgias/axiom'

import { useTicketViewNavigation } from '../../hooks/useTicketViewNavigation'

import css from './TicketViewNavigator.less'

export function TicketViewNavigator() {
    const {
        ticketViewNavigation,
        handleGoToPreviousViewTicket,
        handleGoToNextViewTicket,
    } = useTicketViewNavigation()

    if (!ticketViewNavigation.shouldDisplay) {
        return null
    }

    return (
        <div className={css.ticketViewNavigatorContainer}>
            <Tooltip
                placement="bottom"
                trigger={
                    <Button
                        isDisabled={!ticketViewNavigation.isPreviousEnabled}
                        variant="tertiary"
                        icon="arrow-chevron-left"
                        size="sm"
                        onClick={handleGoToPreviousViewTicket}
                    />
                }
            >
                <TooltipContent title="Previous ticket" shortcut="←" />
            </Tooltip>
            <Tooltip
                placement="bottom"
                trigger={
                    <Button
                        isDisabled={!ticketViewNavigation.isNextEnabled}
                        variant="tertiary"
                        icon="arrow-chevron-right"
                        size="sm"
                        onClick={handleGoToNextViewTicket}
                    />
                }
            >
                <TooltipContent title="Next ticket" shortcut="→" />
            </Tooltip>
        </div>
    )
}
