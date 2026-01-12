import type { ChartType } from '@repo/reporting'

import { ButtonGroup, ButtonGroupItem, Icon } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

interface ChartTypeToggleProps {
    chartType: ChartType
    onChartTypeChange: (chartType: ChartType) => void
    firstButtonIcon?: IconName
    secondButtonIcon?: IconName
}

export const ChartTypeToggle = ({
    chartType,
    onChartTypeChange,
    firstButtonIcon,
    secondButtonIcon,
}: ChartTypeToggleProps) => {
    return (
        <ButtonGroup
            selectedKey={chartType}
            onSelectionChange={(selectedKey) =>
                onChartTypeChange(selectedKey as ChartType)
            }
        >
            <ButtonGroupItem id="donut" aria-label="Show donut chart">
                <Icon name={firstButtonIcon || 'chart-pie'} />
            </ButtonGroupItem>
            <ButtonGroupItem id="bar" aria-label="Show bar chart">
                <Icon name={secondButtonIcon || 'chart-bar-vertical'} />
            </ButtonGroupItem>
        </ButtonGroup>
    )
}
