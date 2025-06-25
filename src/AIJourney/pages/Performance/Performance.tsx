import { PerformanceBadge } from 'AIJourney/components'

import css from './Performance.less'

const DigestCard = () => {
    return (
        <div className={css.digestCard}>
            <div className={css.digestHeader}>
                <PerformanceBadge />
                In the <b>last 30 days</b>, revenue is <b>up 14%</b>, driven
                primarily by your Abandoned Cart Journey converting at 12%.To{' '}
                <b>unlock an extra $5k</b>, your biggest opportunity is to{' '}
                <b>enable the Discount Code skill</b>.
            </div>
            <div className={css.digestMetrics}>
                <div>
                    <span>Total Revenue</span>
                    <div>
                        <b>$123,273</b>
                    </div>
                </div>
                <div>
                    <span>Total Orders</span>
                    <div>
                        <b>7,289</b>
                    </div>
                </div>
                <div>
                    <span>Conversion Rate</span>
                    <div>
                        <b>19%</b>
                    </div>
                </div>
                <div>
                    <span>Global Sentiment</span>
                    <div>
                        <b>Positive</b>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const Performance = () => {
    return (
        <div className={css.container}>
            <DigestCard />
        </div>
    )
}
