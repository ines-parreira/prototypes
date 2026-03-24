import { logEvent, SegmentEvent } from '@repo/logging'
import { useConditionalShortcuts } from '@repo/utils'

import { Button, Tooltip, TooltipContent } from '@gorgias/axiom'

import { useTicketViewNavigation } from '../../hooks/useTicketViewNavigation'

import css from './TicketViewNavigator.less'

export function TicketViewNavigator() {
    const {
        ticketViewNavigation,
        handleGoToPreviousViewTicket,
        handleGoToNextViewTicket,
    } = useTicketViewNavigation()

    useConditionalShortcuts(
        ticketViewNavigation.shouldDisplay,
        'TicketViewNavigator',
        {
            GO_BACK: {
                action: () => {
                    if (!ticketViewNavigation.isPreviousEnabled) {
                        return
                    }

                    logEvent(
                        SegmentEvent.TicketKeyboardShortcutsPreviousNavigation,
                    )
                    void handleGoToPreviousViewTicket()
                },
            },
            GO_FORWARD: {
                action: () => {
                    if (!ticketViewNavigation.isNextEnabled) {
                        return
                    }

                    logEvent(SegmentEvent.TicketKeyboardShortcutsNextNavigation)
                    void handleGoToNextViewTicket()
                },
            },
        },
    )

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
