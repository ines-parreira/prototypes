import classNames from 'classnames'
import { useParams } from 'react-router-dom'

import { AnalyticsData } from 'AIJourney/components/AnalyticsData/AnalyticsData'
import { DiscountCard } from 'AIJourney/components/DiscountCard/DiscountCard'
import greenLightningIcon from 'assets/img/ai-journey/green-lightning.svg'
import orangeLightningIcon from 'assets/img/ai-journey/orange-lightning.svg'

import { MoreOptions } from './components/MoreOptions'

import css from './AnalyticsCard.less'

type AnalyticsCardProps = {
    status: string
    analyticsData: any[]
}

export const AnalyticsCard = ({
    status,
    analyticsData,
}: AnalyticsCardProps) => {
    const { shopName } = useParams<{ shopName: string }>()

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
                <MoreOptions shopName={shopName} />
            </div>
            <AnalyticsData data={analyticsData} />
            <DiscountCard />
        </div>
    )
}
