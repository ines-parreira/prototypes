import _get from 'lodash/get'
import React from 'react'

import {SearchBar} from 'pages/common/components/SearchBar/SearchBar'
import {REPORTS_MODAL_CONFIG} from 'pages/stats/custom-reports/config'
import {
    ReportConfig,
    ReportsModalConfig,
} from 'pages/stats/custom-reports/types'
import {getSearchConfig} from 'pages/stats/custom-reports/utils'

const placeholder = 'Select a maximum of 20 charts to add'

type Props = {
    setConfig: (config: ReportsModalConfig | null) => void
    setSelectedReport: (report: ReportConfig<string> | null) => void
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
