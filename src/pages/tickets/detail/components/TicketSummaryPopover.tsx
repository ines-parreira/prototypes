import { useCallback, useRef, useState } from 'react'

import { logEvent, SegmentEvent } from 'common/segment'
import { Popover } from 'components/Popover'
import useAppSelector from 'hooks/useAppSelector'
import TicketSummarySection, {
    TicketSummaryButton,
} from 'pages/tickets/detail/components/TicketSummary'
import css from 'pages/tickets/detail/components/TicketSummary.less'

const TicketSummaryPopover = () => {
    const [isOpen, setIsOpen] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const ticket = useAppSelector((state) => state.ticket)
    const ticketId = ticket.get('id')
    const summary = ticket.get('summary')?.toJS()

    const handleClick = useCallback(() => {
        setIsOpen((state) => {
            const nextState = !state
            if (nextState) {
                logEvent(SegmentEvent.AiTicketSummaryPopoverOpened, {
                    ticketId,
                    page: 'ticket',
                })
            }
            return nextState
        })
    }, [ticketId])

    return (
        <>
            <TicketSummaryButton
                className={css.popoverButton}
                onClick={handleClick}
                ref={buttonRef}
                {...(isOpen && { leadingIcon: 'close' })}
            >
                Summarize
            </TicketSummaryButton>
            {buttonRef.current && (
                <Popover
                    placement="bottom"
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    target={buttonRef}
                    footer={false}
                    offsetValue={8}
                    className={css.popover}
                >
                    <TicketSummarySection
                        ticketId={ticketId}
                        summary={summary}
                        isPopup
                    />
                </Popover>
            )}
        </>
    )
}
export default TicketSummaryPopover
