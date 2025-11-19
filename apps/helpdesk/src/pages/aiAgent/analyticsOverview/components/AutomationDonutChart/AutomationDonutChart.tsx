import { useState } from 'react'

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

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

import css from './AutomationDonutChart.less'

type MetricOption = {
    id: string
    label: string
}

const METRIC_OPTIONS: MetricOption[] = [
    { id: 'automation-rate', label: 'Overall automation rate' },
    { id: 'automation-interactions', label: 'Overall automation interactions' },
    { id: 'cost-saved', label: 'Overall cost saved' },
    { id: 'time-saved', label: 'Overall time saved by agents' },
]

type ChartDataItem = {
    name: string
    value: number
    percentage: string
    color: string
}

const AUTOMATION_RATE_DATA: ChartDataItem[] = [
    { name: 'AI Agent', value: 18, percentage: '18%', color: '#6366F1' },
    { name: 'Flows', value: 7, percentage: '7%', color: '#A78BFA' },
    {
        name: 'Article Recommendation',
        value: 4,
        percentage: '4%',
        color: '#C4B5FD',
    },
    { name: 'Order Management', value: 3, percentage: '3%', color: '#DDD6FE' },
]

const LEGEND_CONFIG = [
    { name: 'AI Agent', percentage: '18%', color: '#6366F1' },
    { name: 'Flows', percentage: '7%', color: '#A78BFA' },
    { name: 'Article Recommendation', percentage: '4%', color: '#C4B5FD' },
    { name: 'Order Management', percentage: '3%', color: '#DDD6FE' },
]

type AutomationDonutChartProps = {
    value?: string
    trend?: number
}

export const AutomationDonutChart = ({
    value = '32%',
    trend = 2,
}: AutomationDonutChartProps) => {
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
                                        ? 'Overall automation rate'
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
            <Box className={css.chartContainer}>
                <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                        <Pie
                            data={AUTOMATION_RATE_DATA}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            cornerRadius={4}
                        >
                            {AUTOMATION_RATE_DATA.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color}
                                />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </Box>
            <Box className={css.legend}>
                {LEGEND_CONFIG.map((item) => (
                    <Box key={item.name} className={css.legendItem}>
                        <Box className={css.legendLabel}>
                            <span
                                className={css.legendDot}
                                style={{ backgroundColor: item.color }}
                            />
                            <Text
                                size="sm"
                                variant="regular"
                                className={css.legendText}
                            >
                                {item.name}
                            </Text>
                        </Box>
                        <Text
                            size="sm"
                            variant="regular"
                            className={css.legendValue}
                        >
                            {item.percentage}
                        </Text>
                    </Box>
                ))}
            </Box>
        </Card>
    )
}
