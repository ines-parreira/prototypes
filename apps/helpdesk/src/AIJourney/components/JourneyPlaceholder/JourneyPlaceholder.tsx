import calendarClockIcon from 'assets/img/ai-journey/calendar-clock.svg'
import lightningIcon from 'assets/img/ai-journey/lightning.svg'
import placeholder_1Icon from 'assets/img/ai-journey/placeholder-1.svg'
import placeholder_2Icon from 'assets/img/ai-journey/placeholder-2.svg'
import placeholder_3Icon from 'assets/img/ai-journey/placeholder-3.svg'

import css from './JourneyPlaceholder.less'

type JourneyPlaceholderProps = {
    name: string
}

export const JourneyPlaceholder = ({ name }: JourneyPlaceholderProps) => {
    return (
        <div className={css.journeyPlaceholder}>
            <div className={css.status}>
                <img src={lightningIcon} alt="lightning" />
                <span>{name}</span>
                <div className={css.comingSoon}>
                    Coming soon
                    <i className="material-icons-outlined">calendar_today</i>
                </div>
            </div>
            <div className={css.cover}>
                <img src={placeholder_1Icon} alt="placeholder_1" />
                <img src={placeholder_2Icon} alt="placeholder_2" />
                <img src={placeholder_3Icon} alt="placeholder_3" />
            </div>
            <div className={css.coverInfo}>
                <div className={css.calendarClock}>
                    <img src={calendarClockIcon} alt="calendar_clock" />
                </div>
                <span className={css.primaryText}>{name}</span>
                <span className={css.secondaryText}>
                    will be available soon
                </span>
            </div>
        </div>
    )
}
