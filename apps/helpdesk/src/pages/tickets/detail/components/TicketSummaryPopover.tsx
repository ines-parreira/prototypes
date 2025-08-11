import { forwardRef, useCallback, useRef, useState } from 'react'

import { Tooltip } from '@gorgias/axiom'

import { logEvent, SegmentEvent } from 'common/segment'
import { Popover } from 'components/Popover'
import useAppSelector from 'hooks/useAppSelector'
import TicketSummarySection, {
    TicketSummaryButton,
} from 'pages/tickets/detail/components/TicketSummary'
import css from 'pages/tickets/detail/components/TicketSummary.less'

const TicketSummaryPopover = forwardRef(
    (
        {
            displayLabel = true,
            hasTooltip = false,
        }: {
            displayLabel?: boolean
            hasTooltip?: boolean
        },
        ref: React.Ref<HTMLDivElement>,
    ) => {
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
            <div ref={ref}>
                <TicketSummaryButton
                    onClick={handleClick}
                    ref={buttonRef}
                    displayLabel={displayLabel}
                    {...(isOpen && { leadingIcon: 'close' })}
                />
                {buttonRef.current && (
                    <Popover
                        placement="bottom"
                        isOpen={isOpen}
                        setIsOpen={setIsOpen}
                        shiftOptions={{ padding: 8 }}
                        showArrow={false}
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
                {hasTooltip && (
                    <Tooltip target={buttonRef}>Summarize ticket</Tooltip>
                )}
            </div>
        )
    },
)

export default TicketSummaryPopover
