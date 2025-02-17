import React from 'react'

import {useGridSize} from 'hooks/useGridSize'
import {FilterKey} from 'models/stat/types'

import AiSalesAgentOverviewDownloadButton from 'pages/stats/aiSalesAgent/AiSalesAgentOverviewDownloadButton'
import {AiSalesAgentReportConfig} from 'pages/stats/aiSalesAgent/AiSalesAgentReportConfig'
import {PAGE_TITLE_AI_SALES_AGENT_SALES_OVERVIEW} from 'pages/stats/aiSalesAgent/constants'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'

import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import StatsPage from 'pages/stats/StatsPage'

const AiSalesAgentSalesOverview = () => {
    const getGridCellSize = useGridSize()

    return (
        <StatsPage
            title={PAGE_TITLE_AI_SALES_AGENT_SALES_OVERVIEW}
            titleExtra={<AiSalesAgentOverviewDownloadButton />}
        >
            <DashboardSection>
                <DashboardGridCell size={getGridCellSize(12)} className="pb-0">
                    <FiltersPanelWrapper
                        persistentFilters={
                            AiSalesAgentReportConfig.reportFilters.persistent
                        }
                        filterSettingsOverrides={{
                            [FilterKey.Period]: {
                                initialSettings: {
                                    maxSpan: 365,
                                },
                            },
                        }}
                    />
                </DashboardGridCell>
            </DashboardSection>

            <DashboardSection title="Main Metrics">
                Main Metrics
            </DashboardSection>

            <AnalyticsFooter />
        </StatsPage>
    )
}

export default AiSalesAgentSalesOverview
