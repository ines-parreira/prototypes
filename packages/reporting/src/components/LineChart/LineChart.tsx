import {
    CartesianGrid,
    Line,
    LineChart as LineChartRecharts,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

import { Skeleton } from '@gorgias/axiom'

import { TwoDimensionalDataItem } from '../../types'
import { renderTickLabelAsNumber } from '../../utils/helpers'
import { ChartTooltip } from '../ChartTooltip/ChartTooltip'
import { toLineChartData } from './utils'

type LineChartProps = {
    data: TwoDimensionalDataItem[]
    isLoading?: boolean
    skeletonHeight?: number
    isCurvedLine?: boolean
    renderYTickLabel?: (value: number | string) => string
}
export const LineChart = ({
    data,
    isCurvedLine = true,
    isLoading = false,
    skeletonHeight = 250,
    renderYTickLabel = renderTickLabelAsNumber,
}: LineChartProps) => {
    if (isLoading) {
        return <Skeleton height={skeletonHeight} />
    }

    const transformedData = toLineChartData(data)

    return (
        <LineChartRecharts
            style={{
                width: '100%',
                height: '100%',
            }}
            responsive
            data={transformedData}
        >
            <CartesianGrid strokeDasharray="1.5 3" vertical={false} />
            <XAxis dataKey="name" interval="preserveStartEnd" />
            <YAxis width="auto" tickFormatter={renderYTickLabel} />
            <Tooltip
                cursor={{
                    strokeDasharray: '1.5 3',
                    strokeWidth: '1px',
                    stroke: '#1E242E',
                }}
                content={ChartTooltip}
                formatter={renderYTickLabel}
            />
            {data.map((series) => (
                <Line
                    key={series.label}
                    type={isCurvedLine ? 'monotone' : 'linear'}
                    dataKey={series.label}
                    dot={false}
                    color="#0D6CF2"
                />
            ))}
        </LineChartRecharts>
    )
}
