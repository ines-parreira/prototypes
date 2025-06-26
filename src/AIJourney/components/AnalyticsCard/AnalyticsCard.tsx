import classNames from 'classnames'

import { DiscountCard } from 'AIJourney/components/DiscountCard/DiscountCard'
import greenLightningIcon from 'assets/img/ai-journey/green-lightning.svg'
import orangeLightningIcon from 'assets/img/ai-journey/orange-lightning.svg'

import css from './AnalyticsCard.less'

type AnalyticsCardProps = {
    status: 'live' | 'paused'
}

export const AnalyticsCard = ({ status }: AnalyticsCardProps) => {
    const statusIcon =
        status === 'live' ? greenLightningIcon : orangeLightningIcon

    const statusBadgeClass = classNames(css.statusBadge, {
        [css['statusBadge--live']]: status === 'live',
        [css['statusBadge--paused']]: status === 'paused',
    })

    return (
        <div className={css.analyticsCard}>
            <div className={css.status}>
                <img src={statusIcon} alt="sphere-icon" />
                <span>Abandoned Cart</span>
                <div className={statusBadgeClass}>{status.toUpperCase()}</div>
            </div>
            <DiscountCard />
        </div>
    )
}
