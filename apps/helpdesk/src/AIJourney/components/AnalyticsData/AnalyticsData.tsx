import TrendBadge from 'domains/reporting/pages/common/components/TrendBadge'

import { AnalyticsBarChart } from '../AnalyticsBarChart/AnalyticsBarChart'

import css from './AnalyticsData.less'

type AnalyticsDataProps = {
    data: any[]
}

export const AnalyticsData = ({ data }: AnalyticsDataProps) => {
    function getRandomInt(min: number, max: number): number {
        const minCeiled = Math.ceil(min)
        const maxFloored = Math.floor(max)
        return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled)
    }

    function getLast5DayRanges(): string[] {
        const ranges: string[] = []
        const today = new Date()

        for (let i = 0; i < 5; i++) {
            const end = new Date(today)
            end.setDate(today.getDate() - i * 5)
            const start = new Date(end)
            start.setDate(end.getDate() - 4)

            const format = (date: Date) =>
                date.toLocaleString('en-US', { month: 'short', day: 'numeric' })

            ranges.push(`${format(start)} - ${format(end)}`)
        }

        return ranges.reverse()
    }

    const barValues = () =>
        getLast5DayRanges().map((dateRange) => ({
            dateRange,
            value: getRandomInt(1, 30),
        }))

    return (
        <div className={css.journeyData}>
            {data?.map((metric, index) => (
                <div className={css.metric} key={index}>
                    <span>{metric.label}</span>
                    <div className={css.metricInformation}>
                        <div className={css.metricValue}>
                            <b>{metric.value}</b>
                        </div>
                        <AnalyticsBarChart dataArray={barValues()} />
                    </div>
                    <TrendBadge
                        value={metric.value}
                        prevValue={metric.prevValue}
                        metricFormat={metric.metricFormat}
                        currency={metric.currency}
                        interpretAs="more-is-better"
                    />
                </div>
            ))}
        </div>
    )
}
