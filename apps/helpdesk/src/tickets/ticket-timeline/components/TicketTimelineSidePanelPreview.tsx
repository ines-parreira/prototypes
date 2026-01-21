import { useCallback } from 'react'

import {
    Box,
    Button,
    Icon,
    LegacyIconButton as IconButton,
    OverlayContent,
    OverlayFooter,
    SidePanel,
} from '@gorgias/axiom'
import type { TicketCompact } from '@gorgias/helpdesk-types'

import { ErrorBoundary } from 'pages/ErrorBoundary'
import { TicketDetail } from 'tickets/ticket-detail/components/TicketDetail'
import { TicketModalProvider } from 'timeline/ticket-modal/components/TicketModalProvider'

import css from './TicketTimelineSidePanelPreview.less'

type Props = {
    ticket: TicketCompact | null
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    onNext: () => void
    onPrevious: () => void
    isFirstTicket: boolean
    isLastTicket: boolean
}

export function TicketTimelineSidePanelPreview({
    ticket,
    isOpen,
    onOpenChange,
    onNext,
    onPrevious,
    isFirstTicket,
    isLastTicket,
}: Props) {
    const handleClose = useCallback(() => {
        onOpenChange(false)
    }, [onOpenChange])

    if (!ticket) {
        return null
    }

    return (
        <SidePanel isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
            <OverlayContent>
                <ErrorBoundary>
                    <TicketModalProvider isInsideSidePanel>
                        <TicketDetail
                            summary={ticket}
                            ticketId={ticket.id}
                            additionalHeaderActions={
                                <IconButton
                                    aria-label="Close preview"
                                    fillStyle="ghost"
                                    icon="close"
                                    intent="secondary"
                                    onClick={handleClose}
                                />
                            }
                        />
                    </TicketModalProvider>
                </ErrorBoundary>
            </OverlayContent>
            <OverlayFooter hideCancelButton>
                <div className={css.footer}>
                    <Box gap="xxxs">
                        <Button
                            variant="secondary"
                            isDisabled={isFirstTicket}
                            onClick={onPrevious}
                            aria-label="Previous ticket"
                        >
                            <Icon name="arrow-chevron-left" />
                        </Button>
                        <Button
                            variant="secondary"
                            isDisabled={isLastTicket}
                            onClick={onNext}
                            aria-label="Next ticket"
                        >
                            <Icon name="arrow-chevron-right" />
                        </Button>
                    </Box>
                    <Button
                        as="a"
                        variant="tertiary"
                        href={`/app/ticket/${ticket.id}`}
                        target="_blank"
                        rel="noreferrer"
                        trailingSlot={<Icon name="external-link" />}
                    >
                        Expand Ticket
                    </Button>
                </div>
            </OverlayFooter>
        </SidePanel>
    )
}
