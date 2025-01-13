import _get from 'lodash/get'
import React from 'react'

import {SearchBar} from 'pages/common/components/SearchBar/SearchBar'
import {REPORTS_MODAL_CONFIG} from 'pages/stats/custom-reports/config'
import {
    ChartConfig,
    ReportChildrenConfig,
    ReportConfig,
    ReportsModalConfig,
} from 'pages/stats/custom-reports/types'

const placeholder = 'Select a maximum of 20 charts to add'

type Props = {
    setConfig: (config: ReportsModalConfig | null) => void
    setSelectedReport: (report: ReportConfig<string> | null) => void
}

export const getSearchConfig = (value: string): ReportsModalConfig | null => {
    const searchValue = value.toLowerCase()

    const config: ReportsModalConfig = []

    REPORTS_MODAL_CONFIG.forEach((reportConfig) => {
        const filteredChildren: ReportChildrenConfig = []

        for (const report of reportConfig.children) {
            const filteredCharts: Record<string, ChartConfig> = {}

            for (const [chartId, chart] of Object.entries(
                report.config.charts
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
                })
            }
        }

        if (filteredChildren.length > 0) {
            config.push({
                category: reportConfig.category,
                children: filteredChildren,
            })
        }
    })

    return config.length ? config : null
}

export const ModalSearchBar = ({setConfig, setSelectedReport}: Props) => {
    const onSearchValue = (value: string) => {
        const config = getSearchConfig(value)

        setConfig(config)
        setSelectedReport(_get(config, '0.children.0.config') || null)
    }

    const onClearSearch = () => {
        setSelectedReport(null)
        setConfig(REPORTS_MODAL_CONFIG)
    }

    return (
        <SearchBar
            handleClearSearch={onClearSearch}
            handleSearchValue={onSearchValue}
            placeholder={placeholder}
        />
    )
}
