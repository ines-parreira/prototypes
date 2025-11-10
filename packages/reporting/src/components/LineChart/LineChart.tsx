import { useRef } from 'react'

import {
    CartesianGrid,
    Line,
    LineChart as LineChartRecharts,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

import {
    Box,
    Button,
    Card,
    Icon,
    ListItem,
    Select,
    Skeleton,
} from '@gorgias/axiom'

import { TwoDimensionalDataItem } from '../../types'
import { renderTickLabelAsNumber } from '../../utils/helpers'
import { ChartTooltip } from '../ChartTooltip/ChartTooltip'
import { toChartData } from './utils'

import '@gorgias/axiom/tokens/typography.css'

type LineChartProps = {
    containerHeight?: number
    containerWidth?: number
    data: TwoDimensionalDataItem[]
    isCurvedLine?: boolean
    isLoading?: boolean
    metrics?: { id: string; label: string }[]
    onMetricChange?: (metric: string) => void
    renderYTickLabel?: (value: number | string) => string
    skeletonHeight?: number
    title: string
}
export const LineChart = ({
    containerHeight,
    containerWidth,
    data,
    isCurvedLine = true,
    isLoading = false,
    metrics,
    onMetricChange,
    renderYTickLabel = renderTickLabelAsNumber,
    skeletonHeight = 250,
    title,
}: LineChartProps) => {
    const titleRef = useRef<HTMLDivElement>(null)
    if (isLoading) {
        return <Skeleton height={skeletonHeight} />
    }

    const transformedData = toChartData(data)

    return (
        <Card>
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
                    <div className="typography-heading-md" ref={titleRef}>
                        {title}
                    </div>
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
                                triggerRef={titleRef}
                                trigger={({ isOpen }) => (
                                    <Button
                                        slot="button"
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
            </Box>
        </Card>
    )
}
