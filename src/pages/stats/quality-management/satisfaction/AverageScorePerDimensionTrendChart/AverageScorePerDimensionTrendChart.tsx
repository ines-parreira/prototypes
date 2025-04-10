import React, { useCallback, useMemo, useRef, useState } from 'react'

import { TicketDimension } from 'models/reporting/cubes/TicketCube'
import { TicketMessagesDimension } from 'models/reporting/cubes/TicketMessagesCube'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import ChartCard from 'pages/stats/common/components/ChartCard'
import { DashboardChartProps } from 'pages/stats/dashboards/types'
import { AverageScorePerAssigneeMetric } from 'pages/stats/quality-management/satisfaction/AverageScorePerDimensionTrendChart/AverageScorePerAssigneeMetric'
import { AverageScorePerChannelMetric } from 'pages/stats/quality-management/satisfaction/AverageScorePerDimensionTrendChart/AverageScorePerChannelMetric'
import css from 'pages/stats/quality-management/satisfaction/AverageScorePerDimensionTrendChart/AverageScorePerDimensionTrendChart.less'
import { AverageScorePerIntegrationMetric } from 'pages/stats/quality-management/satisfaction/AverageScorePerDimensionTrendChart/AverageScorePerIntegrationMetric'

type CSATDimension = {
    label: string
    value: string
}

const AVAILABLE_DIMENSIONS: CSATDimension[] = [
    { label: 'Per assignee', value: TicketDimension.AssigneeUserId },
    { label: 'Per channel', value: TicketDimension.Channel },
    { label: 'Per integration', value: TicketMessagesDimension.Integration },
]

const DEFAULT_DIMENSION = AVAILABLE_DIMENSIONS[1]

export const AverageScorePerDimensionTrendChart = (
    props: DashboardChartProps,
) => {
    const [selectedDimension, setSelectedDimension] =
        useState(DEFAULT_DIMENSION)

    const [isSelectOpen, setIsSelectOpen] = useState(false)
    const floatingRef = useRef<HTMLDivElement>(null)
    const selectRef = useRef<HTMLDivElement>(null)

    const handleSelectBoxClick = useCallback((v: boolean) => {
        setIsSelectOpen(v)
    }, [])

    const SelectComponent = useMemo(() => {
        return (
            <SelectInputBox
                onToggle={handleSelectBoxClick}
                floating={floatingRef}
                ref={selectRef}
                label={selectedDimension.label}
                className={css.extraTitleDropdown}
            >
                <SelectInputBoxContext.Consumer>
                    {(context) => (
                        <Dropdown
                            isOpen={isSelectOpen}
                            onToggle={() => context!.onBlur()}
                            ref={floatingRef}
                            target={selectRef}
                            value={selectedDimension.value}
                        >
                            <DropdownBody>
                                {AVAILABLE_DIMENSIONS.map((opt) => (
                                    <DropdownItem
                                        key={opt.value}
                                        option={{
                                            label: opt.label,
                                            value: opt.value.toString(),
                                        }}
                                        onClick={(e) => {
                                            const selectedValue = e
                                            const selectedLabel =
                                                AVAILABLE_DIMENSIONS.find(
                                                    (dim) =>
                                                        dim.value ===
                                                        selectedValue,
                                                )?.label || ''
                                            setSelectedDimension({
                                                label: selectedLabel,
                                                value: selectedValue,
                                            })
                                        }}
                                        shouldCloseOnSelect
                                    />
                                ))}
                            </DropdownBody>
                        </Dropdown>
                    )}
                </SelectInputBoxContext.Consumer>
            </SelectInputBox>
        )
    }, [
        handleSelectBoxClick,
        isSelectOpen,
        selectedDimension.label,
        selectedDimension.value,
    ])

    const TimelineComponent = useMemo(() => {
        switch (selectedDimension.value) {
            case TicketDimension.Channel:
                return <AverageScorePerChannelMetric />
            case TicketDimension.AssigneeUserId:
                return <AverageScorePerAssigneeMetric />
            case TicketMessagesDimension.Integration:
                return <AverageScorePerIntegrationMetric />
            default:
                return null
        }
    }, [selectedDimension.value])

    return (
        <ChartCard
            title="Average CSAT over time"
            hint={{
                title: 'Overall average CSAT, as well as average CSAT score per dimensions over the period.',
            }}
            titleExtra={SelectComponent}
            {...props}
        >
            {TimelineComponent}
        </ChartCard>
    )
}
