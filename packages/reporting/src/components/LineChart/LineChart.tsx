import {
    CartesianGrid,
    Line,
    LineChart as LineChartRecharts,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

import type { SizeValue } from '@gorgias/axiom'
import {
    Box,
    Button,
    Card,
    Heading,
    Icon,
    ListItem,
    Select,
    Skeleton,
} from '@gorgias/axiom'

import type { MetricTrendFormat, TwoDimensionalDataItem } from '../../types'
import { formatMetricValueOrString } from '../../utils/helpers'
import { ChartTooltip } from '../ChartTooltip/ChartTooltip'
import { toChartData } from './utils'

type LineChartProps = {
    containerHeight?: SizeValue
    containerWidth?: SizeValue
    currency?: string
    data: TwoDimensionalDataItem[]
    isCurvedLine?: boolean
    isLoading?: boolean
    metrics?: { id: string; label: string }[]
    metricFormat?: MetricTrendFormat
    onMetricChange?: (metric: string) => void
    skeletonHeight?: number
    title: string
}
export const LineChart = ({
    containerHeight,
    containerWidth,
    currency,
    data,
    isCurvedLine = true,
    isLoading = false,
    metrics,
    metricFormat,
    onMetricChange,
    skeletonHeight = 250,
    title,
}: LineChartProps) => {
    const formatter = formatMetricValueOrString({ metricFormat, currency })
    if (isLoading) {
        return <Skeleton height={skeletonHeight} />
    }

    const transformedData = toChartData(data)

    return (
        <Card elevation="mid">
            <Box
                flexDirection="column"
                width={containerWidth}
                height={containerHeight}
                paddingTop={22}
                paddingBottom={22}
                paddingLeft="lg"
                paddingRight="lg"
                gap="lg"
            >
                <Box alignItems="center">
                    <Heading>{title}</Heading>
                    {!!metrics && metrics.length > 1 && (
                        <div>
                            <Select
                                selectedItem={metrics.find(
                                    (it) => it.label === title,
                                )}
                                onSelect={(item) => {
                                    onMetricChange?.(item.label)
                                }}
                                items={metrics}
                                trigger={({ isOpen }) => (
                                    <Button
                                        size="sm"
                                        variant="tertiary"
                                        icon={
                                            isOpen ? (
                                                <Icon
                                                    color="var(--content-neutral-default)"
                                                    name="arrow-chevron-up"
                                                    size="sm"
                                                />
                                            ) : (
                                                <Icon
                                                    color="var(--content-neutral-default)"
                                                    name="arrow-chevron-down"
                                                    size="sm"
                                                />
                                            )
                                        }
                                    />
                                )}
                            >
                                {(option) => <ListItem label={option.label} />}
                            </Select>
                        </div>
                    )}
                </Box>
                <LineChartRecharts
                    style={{
                        height: 'calc(100% - 20px)',
                        flex: '1',
                        aspectRatio: 1,
                    }}
                    responsive
                    data={transformedData}
                >
                    <CartesianGrid strokeDasharray="1.5 3" vertical={false} />
                    <XAxis dataKey="name" interval="preserveStartEnd" />
                    <YAxis width="auto" tickFormatter={formatter} />
                    <Tooltip
                        cursor={{
                            strokeDasharray: '1.5 3',
                            strokeWidth: '1px',
                            stroke: '#1E242E',
                        }}
                        content={ChartTooltip}
                        formatter={formatter}
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
            </Box>
        </Card>
    )
}
