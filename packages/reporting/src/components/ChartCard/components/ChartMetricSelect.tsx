import {
    Box,
    Icon,
    ListItem,
    Select,
    SelectTrigger,
    Text,
} from '@gorgias/axiom'

import css from '../ChartCard.less'

type MetricOption = {
    id: string
    label: string
}

type ChartMetricSelectProps = {
    metrics: MetricOption[]
    selectedMetric: string
    onMetricChange: (metric: string) => void
}

export const ChartMetricSelect = ({
    metrics,
    selectedMetric,
    onMetricChange,
}: ChartMetricSelectProps) => {
    const selectedItem = metrics.find((m) => m.label === selectedMetric)

    return (
        <Select
            aria-label={'chart-metric-select'}
            selectedItem={selectedItem}
            onSelect={(item) => onMetricChange(item.label)}
            items={metrics}
            trigger={({ isOpen, ...props }) => (
                <SelectTrigger {...props}>
                    <Box
                        alignItems="center"
                        gap="xxxs"
                        className={css.selectTrigger}
                    >
                        <Text size="md" variant="bold">
                            {selectedMetric}
                        </Text>
                        <span
                            className={css.chevronIcon}
                            data-state={isOpen ? 'open' : 'closed'}
                        >
                            <Icon name="arrow-chevron-down" size="xs" />
                        </span>
                    </Box>
                </SelectTrigger>
            )}
        >
            {(option) => <ListItem id={option.id} label={option.label} />}
        </Select>
    )
}
