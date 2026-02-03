import { useCallback } from 'react'

import type { EnrichedTicket } from '@repo/tickets'
import { useHistory } from 'react-router-dom'

import {
    Box,
    Button,
    Icon,
    OverlayContent,
    OverlayFooter,
    SidePanel,
} from '@gorgias/axiom'

import { ErrorBoundary } from 'pages/ErrorBoundary'
import { TicketModalProvider } from 'timeline/ticket-modal/components/TicketModalProvider'

import { SidePanelTicketDetail } from './SidePanelTicketDetail'

import css from './TicketTimelineSidePanelPreview.less'

type Props = {
    enrichedTicket: EnrichedTicket | null
    isOpen: boolean
    onOpenChange: (isOpen: boolean) => void
    onNext: () => void
    onPrevious: () => void
    isFirstTicket: boolean
    isLastTicket: boolean
}

export function TicketTimelineSidePanelPreview({
    enrichedTicket,
    isOpen,
    onOpenChange,
    onNext,
    onPrevious,
    isFirstTicket,
    isLastTicket,
}: Props) {
    const history = useHistory()

    const handleClose = useCallback(() => {
        onOpenChange(false)
    }, [onOpenChange])

    const handleExpand = useCallback(() => {
        if (!enrichedTicket) return
        handleClose()
        history.push(`/app/ticket/${enrichedTicket.ticket.id}`)
    }, [enrichedTicket, handleClose, history])

    return (
        <SidePanel
            isOpen={isOpen && !!enrichedTicket}
            onOpenChange={onOpenChange}
            size="md"
            withoutOverlay
            withoutPadding
        >
            {enrichedTicket && (
                <>
                    <OverlayContent>
                        <ErrorBoundary>
                            <TicketModalProvider isInsideSidePanel>
                                <SidePanelTicketDetail
                                    ticket={enrichedTicket.ticket}
                                    customFields={enrichedTicket.customFields}
                                    iconName={enrichedTicket.iconName}
                                    conditionsLoading={
                                        enrichedTicket.conditionsLoading
                                    }
                                    onExpand={handleExpand}
                                    additionalHeaderActions={
                                        <Button
                                            as="button"
                                            icon="close"
                                            intent="regular"
                                            size="sm"
                                            variant="tertiary"
                                            onClick={handleClose}
                                            aria-label="Close preview"
                                        />
                                    }
                                />
                            </TicketModalProvider>
                        </ErrorBoundary>
                    </OverlayContent>
                    <OverlayFooter hideCancelButton>
                        <div className={css.footer}>
                            <Box gap="xxxs" padding="lg">
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
                        </div>
                    </OverlayFooter>
                </>
            )}
        </SidePanel>
    )
}
