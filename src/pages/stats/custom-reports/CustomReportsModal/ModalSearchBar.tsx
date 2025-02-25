import React from 'react'

import _get from 'lodash/get'

import { SearchBar } from 'pages/common/components/SearchBar/SearchBar'
import {
    ChartConfig,
    ReportChildrenConfig,
    ReportConfig,
    ReportsModalConfig,
} from 'pages/stats/custom-reports/types'

const placeholder = 'Select a maximum of 20 charts to add'

type Props = {
    config: ReportsModalConfig
    setConfig: (config: ReportsModalConfig | null) => void
    setSelectedReport: (report: ReportConfig<string> | null) => void
}

export const getSearchConfig = (
    config: ReportsModalConfig,
    value: string,
): ReportsModalConfig | null => {
    const searchValue = value.toLowerCase()

    const filteredConfig: ReportsModalConfig = []

    config.forEach((reportConfig) => {
        const filteredChildren: ReportChildrenConfig = []

        for (const report of reportConfig.children) {
            const filteredCharts: Record<string, ChartConfig> = {}

            for (const [chartId, chart] of Object.entries(
                report.config.charts,
            )) {
                if (String(chart.label).toLowerCase().includes(searchValue)) {
                    filteredCharts[chartId] = chart
                }
            }

            if (Object.keys(filteredCharts).length > 0) {
                filteredChildren.push({
                    type: report.type,
                    config: {
                        ...report.config,
                        charts: filteredCharts,
                    },
                    id: report.id,
                })
            }
        }

        if (filteredChildren.length > 0) {
            filteredConfig.push({
                category: reportConfig.category,
                children: filteredChildren,
            })
        }
    })

    return filteredConfig.length ? filteredConfig : null
}

export const ModalSearchBar = ({
    config,
    setConfig,
    setSelectedReport,
}: Props) => {
    const handleChange = (value: string) => {
        if (value) {
            const updatedConfig = getSearchConfig(config, value)
            setConfig(updatedConfig)
            setSelectedReport(
                _get(updatedConfig, '0.children.0.config') || null,
            )
        } else {
            setSelectedReport(null)
            setConfig(config)
        }
    }

    return (
        <SearchBar
            onChange={handleChange}
            placeholder={placeholder}
            label="Search charts"
        />
    )
}
