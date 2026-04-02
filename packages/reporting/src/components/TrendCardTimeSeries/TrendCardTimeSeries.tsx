import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

import { Loader, Text } from '@gorgias/axiom'
import colors from '@gorgias/axiom/tokens/colors/semantic/light.json'

import type { TimeSeriesDataItem } from '../ChartCard'
import { renderTimeSeriesTooltipContent } from '../TimeSeriesChart/TimeSeriesChart'

import css from './TrendCardTimeSeries.less'

const CHART_HEIGHT = 26
const DEFAULT_COLOR = colors['Dataviz-purple'].$value
const GRADIENT_ID = `trendCardLineGradient-${DEFAULT_COLOR.replace('#', '')}`

export type TrendCardTimeSeriesProps = {
    comingSoon?: boolean
    useChartData?: () => { data: TimeSeriesDataItem[]; isLoading: boolean }
    valueFormatter?: (value: number) => string
    dateFormatter?: (date: string) => string
}

export const TrendCardTimeSeries = ({
    comingSoon,
    useChartData,
    valueFormatter,
    dateFormatter,
}: TrendCardTimeSeriesProps) => {
    if (comingSoon || !useChartData) {
        return (
            <>
                <hr className={css.divider} />
                <div className={css.comingSoon}>
                    <Text
                        size="xs"
                        variant="bold"
                        color={'content-neutral-tertiary'}
                    >
                        Trend view coming soon
                    </Text>
                </div>
            </>
        )
    }

    return (
        <TrendCardTimeSeriesContent
            useChartData={useChartData}
            valueFormatter={valueFormatter}
            dateFormatter={dateFormatter}
        />
    )
}

type TrendCardTimeSeriesContentProps = Omit<
    Pick<
        TrendCardTimeSeriesProps,
        'useChartData' | 'valueFormatter' | 'dateFormatter'
    >,
    'useChartData'
> & { useChartData: NonNullable<TrendCardTimeSeriesProps['useChartData']> }

const TrendCardTimeSeriesContent = ({
    useChartData,
    valueFormatter,
    dateFormatter,
}: TrendCardTimeSeriesContentProps) => {
    const { data, isLoading } = useChartData()

    if (isLoading) {
        return (
            <div className={css.loadingWrapper}>
                <Loader size="sm" />
            </div>
        )
    }

    return (
        <div className={css.chartWrapper}>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <AreaChart
                    data={data}
                    margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
                >
                    <defs>
                        <linearGradient
                            id={GRADIENT_ID}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor={DEFAULT_COLOR}
                                stopOpacity={0.2}
                            />
                            <stop
                                offset="100%"
                                stopColor={DEFAULT_COLOR}
                                stopOpacity={0}
                            />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="date" hide />
                    <YAxis hide />
                    <Tooltip
                        content={renderTimeSeriesTooltipContent(
                            valueFormatter,
                            dateFormatter,
                        )}
                        cursor={false}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke={DEFAULT_COLOR}
                        strokeWidth={1.2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fillOpacity={1}
                        fill={`url(#${GRADIENT_ID})`}
                        isAnimationActive={true}
                        animationDuration={1000}
                        animationEasing="ease-in-out"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
