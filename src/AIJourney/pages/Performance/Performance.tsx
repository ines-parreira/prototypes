import { DigestCard } from 'AIJourney/components'

import css from './Performance.less'

const digestContent = (
    <>
        In the <b>last 30 days</b>, revenue is <b>up 14%</b>, driven primarily
        by your Abandoned Cart Journey converting at 12%. To{' '}
        <b>unlock an extra $5k</b>, your biggest opportunity is to{' '}
        <b>enable the Discount Code skill</b>.
    </>
)

const digestMetrics = [
    { label: 'Total Revenue', value: '$123,273', variation: '+14%' },
    { label: 'Total Orders', value: '7,289', variation: '+90%' },
    { label: 'Conversion Rate', value: '19%', variation: '0%' },
    { label: 'Global Sentiment', value: 'Positive', variation: '-30%' },
]

export const Performance = () => {
    return (
        <div className={css.container}>
            <DigestCard content={digestContent} metrics={digestMetrics} />
        </div>
    )
}
