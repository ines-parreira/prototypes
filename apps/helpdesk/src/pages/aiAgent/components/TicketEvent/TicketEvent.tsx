import classnames from 'classnames'

import check from 'assets/img/icons/check.svg'
import person_add from 'assets/img/icons/person_add.svg'
import timer from 'assets/img/icons/timer_empty.svg'
import { TicketOutcome } from 'models/aiAgentPlayground/types'

import css from './TicketEvent.less'

type Props = {
    type: TicketOutcome
}

const ticketOutcomeToIcon: { [key in TicketOutcome]: string } = {
    [TicketOutcome.CLOSE]: check,
    [TicketOutcome.HANDOVER]: person_add,
    [TicketOutcome.WAIT]: timer,
}

export const ticketOutcomeToLabel: { [key in TicketOutcome]: string } = {
    [TicketOutcome.CLOSE]: 'Closed',
    [TicketOutcome.HANDOVER]: 'Handed over',
    [TicketOutcome.WAIT]: 'Snoozed',
}

const TicketEvent = ({ type }: Props) => {
    return (
        <div className={css.ticketEventContainer}>
            <div className={css.ticketEventBadge}>
                <div className={css.badgeTopLine}></div>
                <div
                    className={classnames(
                        css.badgeIconContainer,
                        type === TicketOutcome.CLOSE
                            ? css.badgeIconContainerGreen
                            : css.badgeIconContainerBlack,
                    )}
                >
                    <img alt="timer" src={ticketOutcomeToIcon[type]} />
                </div>
                <div className={css.badgeBottomLine}></div>
            </div>
            <div className={css.ticketEventLabel}>
                {ticketOutcomeToLabel[type]}
            </div>
        </div>
    )
}

export default TicketEvent
