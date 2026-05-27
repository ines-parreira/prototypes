import classNames from 'classnames'
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
const COMPACT_CHART_HEIGHT = 24
const DEFAULT_COLOR = colors['Dataviz-purple'].$value
const GRADIENT_ID = `trendCardLineGradient-${DEFAULT_COLOR.replace('#', '')}`

export type TrendCardTimeSeriesProps = {
    comingSoon?: boolean
    useChartData?: () => { data: TimeSeriesDataItem[]; isLoading: boolean }
    valueFormatter?: (value: number) => string
    dateFormatter?: (date: string) => string
}

type TrendCardTimeSeriesInternalProps = TrendCardTimeSeriesProps & {
    compact?: boolean
}

export const TrendCardTimeSeries = ({
    comingSoon,
    useChartData,
    valueFormatter,
    dateFormatter,
    compact = false,
}: TrendCardTimeSeriesInternalProps) => {
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
            compact={compact}
        />
    )
}

type TrendCardTimeSeriesContentProps = Omit<
    Pick<
        TrendCardTimeSeriesInternalProps,
        'useChartData' | 'valueFormatter' | 'dateFormatter' | 'compact'
    >,
    'useChartData'
> & { useChartData: NonNullable<TrendCardTimeSeriesProps['useChartData']> }

const TrendCardTimeSeriesContent = ({
    useChartData,
    valueFormatter,
    dateFormatter,
    compact,
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
        <div
            className={classNames(css.chartWrapper, {
                [css.chartWrapperCompact]: compact,
            })}
        >
            <ResponsiveContainer
                width="100%"
                height={compact ? COMPACT_CHART_HEIGHT : CHART_HEIGHT}
            >
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
