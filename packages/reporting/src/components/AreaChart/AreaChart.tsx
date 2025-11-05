import { Area, AreaChart as AreaChartRecharts } from 'recharts'

import { TwoDimensionalDataItem } from '../../types'
import { toChartData } from '../LineChart/utils'

export type AreaChartProps = {
    data: TwoDimensionalDataItem[]
    isStrokeSolid?: boolean
    areaColor?: string
    strokeColor?: string
    areaChartProps?: any
}

export const AreaChart = ({
    areaChartProps,
    data,
    isStrokeSolid = false,
    areaColor = '#0EAA77',
    strokeColor = '#0EAA77',
}: AreaChartProps) => {
    const transformedData = toChartData(data)

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
                        stopColor={areaColor}
                        stopOpacity={0.02}
                    />
                    <stop
                        offset="50%"
                        stopColor={areaColor}
                        stopOpacity={0.05}
                    />
                    <stop
                        offset="75%"
                        stopColor={areaColor}
                        stopOpacity={0.1}
                    />
                    <stop
                        offset="100%"
                        stopColor={areaColor}
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
                            stopColor={strokeColor}
                            stopOpacity={0.05}
                        />
                        <stop
                            offset="50%"
                            stopColor={strokeColor}
                            stopOpacity={0.5}
                        />
                        <stop
                            offset="100%"
                            stopColor={strokeColor}
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
                        isStrokeSolid ? strokeColor : 'url(#strokeGradient)'
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
