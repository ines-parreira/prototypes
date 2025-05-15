import { useRef, useState } from 'react'

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

    return (
        <>
            <TicketSummaryButton
                onClick={() => setIsOpen((prevState) => !prevState)}
                ref={buttonRef}
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
