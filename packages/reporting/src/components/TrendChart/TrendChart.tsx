import { Area, AreaChart as AreaChartRecharts } from 'recharts'
import { CartesianChartProps } from 'recharts/types/util/types'

import { TrendColor, TwoDimensionalDataItem } from '../../types'
import { toChartData } from '../LineChart/utils'

export type AreaChartProps = {
    data: TwoDimensionalDataItem[]
    isStrokeSolid?: boolean
    areaChartProps?: CartesianChartProps & React.RefAttributes<SVGSVGElement>
    trendColor: TrendColor
}

export const TrendChart = ({
    areaChartProps,
    data,
    isStrokeSolid = false,
    trendColor,
}: AreaChartProps) => {
    const transformedData = toChartData(data)

    const trendColorValue = {
        neutral: '#5C6370',
        unchanged: '#5C6370',
        positive: '#0EAA77',
        negative: '#FF425D',
    }

    return (
        <AreaChartRecharts
            data={transformedData}
            margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
            {...areaChartProps}
        >
            <defs>
                <linearGradient id="colorUv" x1="0" y1="1" x2="1" y2="1">
                    <stop
                        offset="0%"
                        stopColor={trendColorValue[trendColor]}
                        stopOpacity={0.02}
                    />
                    <stop
                        offset="50%"
                        stopColor={trendColorValue[trendColor]}
                        stopOpacity={0.05}
                    />
                    <stop
                        offset="75%"
                        stopColor={trendColorValue[trendColor]}
                        stopOpacity={0.07}
                    />
                    <stop
                        offset="100%"
                        stopColor={trendColorValue[trendColor]}
                        stopOpacity={0.1}
                    />
                </linearGradient>
                {!isStrokeSolid && (
                    <linearGradient
                        id="strokeGradient"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                    >
                        <stop
                            offset="0%"
                            stopColor={trendColorValue[trendColor]}
                            stopOpacity={0.05}
                        />
                        <stop
                            offset="25%"
                            stopColor={trendColorValue[trendColor]}
                            stopOpacity={0.05}
                        />
                        <stop
                            offset="50%"
                            stopColor={trendColorValue[trendColor]}
                            stopOpacity={0.35}
                        />
                        <stop
                            offset="75%"
                            stopColor={trendColorValue[trendColor]}
                            stopOpacity={0.5}
                        />
                        <stop
                            offset="100%"
                            stopColor={trendColorValue[trendColor]}
                            stopOpacity={1}
                        />
                    </linearGradient>
                )}
            </defs>
            {data.map((series) => (
                <Area
                    type="monotone"
                    dataKey={series.label}
                    stroke={
                        isStrokeSolid
                            ? trendColorValue[trendColor]
                            : 'url(#strokeGradient)'
                    }
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#colorUv)"
                    isAnimationActive={true}
                    activeDot={false}
                    key={series.label}
                />
            ))}
        </AreaChartRecharts>
    )
}
