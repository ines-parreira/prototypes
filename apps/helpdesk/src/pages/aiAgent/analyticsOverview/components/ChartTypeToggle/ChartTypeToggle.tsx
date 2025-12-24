import type { ChartType } from '@repo/reporting'

import { ButtonGroup, ButtonGroupItem, Icon } from '@gorgias/axiom'

interface ChartTypeToggleProps {
    chartType: ChartType
    onChartTypeChange: (chartType: ChartType) => void
}

export const ChartTypeToggle = ({
    chartType,
    onChartTypeChange,
}: ChartTypeToggleProps) => {
    return (
        <ButtonGroup
            selectedKey={chartType}
            onSelectionChange={(selectedKey) =>
                onChartTypeChange(selectedKey as ChartType)
            }
        >
            <ButtonGroupItem id="donut" aria-label="Show donut chart">
                <Icon name="chart-pie" />
            </ButtonGroupItem>
            <ButtonGroupItem id="bar" aria-label="Show bar chart">
                <Icon name="chart-bar-vertical" />
            </ButtonGroupItem>
        </ButtonGroup>
    )
}
