import {
    CartesianGrid,
    Line,
    LineChart as LineChatRecharts,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

import { Skeleton } from '@gorgias/axiom'

import { TwoDimensionalDataItem } from '../../types'
import { toLineChartData } from './utils'

type LineChartProps = {
    data: TwoDimensionalDataItem[]
    isLoading?: boolean
    skeletonHeight?: number
    isCurvedLine?: boolean
}
export const LineChart = ({
    data,
    isCurvedLine = true,
    isLoading = false,
    skeletonHeight = 250,
}: LineChartProps) => {
    if (isLoading) {
        return <Skeleton height={skeletonHeight} />
    }

    const transformedData = toLineChartData(data)

    return (
        <LineChatRecharts
            style={{
                width: '100%',
                height: '100%',
            }}
            responsive
            data={transformedData}
        >
            <CartesianGrid strokeDasharray="1.5 3" vertical={false} />
            <XAxis dataKey="name" interval="preserveStartEnd" />
            <YAxis width="auto" />
            <Tooltip />
            {data.map((series) => (
                <Line
                    key={series.label}
                    type={isCurvedLine ? 'monotone' : 'linear'}
                    dataKey={series.label}
                    dot={false}
                    color="#0D6CF2"
                />
            ))}
        </LineChatRecharts>
    )
}
