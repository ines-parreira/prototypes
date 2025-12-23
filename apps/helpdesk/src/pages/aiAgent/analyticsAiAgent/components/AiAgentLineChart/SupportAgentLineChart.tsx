import { useState } from 'react'

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts'

import {
    Box,
    Card,
    Heading,
    Icon,
    ListItem,
    Select,
    SelectTrigger,
    Text,
} from '@gorgias/axiom'

import { renderTickLabelAsNumber } from 'domains/reporting/pages/utils'

import css from './AiAgentLineChart.less'

type MetricOption = {
    id: string
    label: string
}

const METRIC_OPTIONS: MetricOption[] = [
    { id: 'time-saved', label: 'Time saved by agents' },
    { id: 'cost-saved', label: 'Cost saved' },
    { id: 'support-interactions', label: 'Support interactions' },
    {
        id: 'decrease-in-resolution-time',
        label: 'Decrease in first resolution time',
    },
]

const CHART_DATA = [
    { date: 'Jun 1', value: 2000 },
    { date: 'Jun 2', value: 3500 },
    { date: 'Jun 3', value: 3000 },
    { date: 'Jun 4', value: 4000 },
    { date: 'Jun 5', value: 3000 },
    { date: 'Jun 6', value: 4500 },
    { date: 'Jun 7', value: 2500 },
]

type SupportAgentLineChartProps = {
    value?: string
    trend?: number
}

export const SupportAgentLineChart = ({
    value = '3,900',
    trend = 2,
}: SupportAgentLineChartProps) => {
    const [selectedMetric, setSelectedMetric] = useState<MetricOption>(
        METRIC_OPTIONS[0],
    )
    const isPositive = trend > 0
    const isNegative = trend < 0
    const trendIcon = isPositive ? 'trending-up' : 'trending-down'
    const trendTextColor = isPositive
        ? 'var(--content-success-primary)'
        : isNegative
          ? 'var(--content-error-primary)'
          : 'var(--content-neutral-secondary)'
    const trendTextClassName = isPositive
        ? css.trendTextPositive
        : isNegative
          ? css.trendTextNegative
          : css.trendTextNeutral

    return (
        <Card className={css.chartCard}>
            <Box className={css.header}>
                <Select
                    items={METRIC_OPTIONS}
                    selectedItem={selectedMetric}
                    onSelect={setSelectedMetric}
                    trigger={({
                        selectedText,
                        isPlaceholder,
                        isOpen,
                        ...props
                    }) => (
                        <SelectTrigger {...props}>
                            <Box
                                alignItems="center"
                                gap="xxxs"
                                className={css.selectTrigger}
                            >
                                <Text size="md" variant="bold">
                                    {isPlaceholder
                                        ? 'Time saved by agents'
                                        : selectedText}
                                </Text>
                                <Icon
                                    name={
                                        isOpen
                                            ? 'arrow-chevron-up'
                                            : 'arrow-chevron-down'
                                    }
                                    size="xs"
                                />
                            </Box>
                        </SelectTrigger>
                    )}
                >
                    {(option: MetricOption) => (
                        <ListItem key={option.id} label={option.label} />
                    )}
                </Select>
                <Box className={css.stats}>
                    <Heading size="xl" className={css.value}>
                        {value}
                    </Heading>
                    <div className={css.trend}>
                        <div className={css.trendIconWrapper}>
                            <Icon
                                name={trendIcon}
                                size="xs"
                                color={trendTextColor}
                            />
                        </div>
                        <Text
                            size="sm"
                            variant="medium"
                            className={trendTextClassName}
                        >
                            {Math.abs(trend)}%
                        </Text>
                    </div>
                </Box>
            </Box>
            <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={CHART_DATA}>
                    <defs>
                        <linearGradient
                            id="lineChartGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="0%"
                                stopColor="#A084E1"
                                stopOpacity={0.2}
                            />
                            <stop
                                offset="100%"
                                stopColor="#A084E1"
                                stopOpacity={0}
                            />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="0"
                        vertical={false}
                        stroke="var(--border-neutral-default)"
                    />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={{
                            stroke: 'var(--border-neutral-default)',
                        }}
                        tick={{
                            fill: 'var(--content-neutral-secondary)',
                            fontSize: 12,
                        }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                            fill: 'var(--content-neutral-secondary)',
                            fontSize: 12,
                        }}
                        tickFormatter={renderTickLabelAsNumber}
                    />
                    <Area
                        type="natural"
                        dataKey="value"
                        stroke="#A084E1"
                        strokeWidth={2}
                        fill="url(#lineChartGradient)"
                        dot={false}
                        isAnimationActive={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </Card>
    )
}
