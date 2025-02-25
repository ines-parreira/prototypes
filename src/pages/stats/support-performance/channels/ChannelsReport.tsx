import React from 'react'

import { useFlags } from 'launchdarkly-react-client-sdk'

import { FeatureFlagKey } from 'config/featureFlags'
import { useGridSize } from 'hooks/useGridSize'
import { FilterKey } from 'models/stat/types'
import { AnalyticsFooter } from 'pages/stats/AnalyticsFooter'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import { CustomReportComponent } from 'pages/stats/custom-reports/CustomReportComponent'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import StatsPage from 'pages/stats/StatsPage'
import { ChannelsDownloadDataButton } from 'pages/stats/support-performance/channels/ChannelsDownloadDataButton'
import {
    CHANNEL_REPORT_OPTIONAL_FILTERS,
    ChannelsChart,
    ChannelsReportConfig,
} from 'pages/stats/support-performance/channels/ChannelsReportConfig'
import { SupportPerformanceFilters } from 'pages/stats/support-performance/SupportPerformanceFilters'

export function ChannelsReport() {
    const getGridCellSize = useGridSize()

    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFilters]

    return (
        <div className="full-width">
            <StatsPage
                title={ChannelsReportConfig.reportName}
                titleExtra={
                    <>
                        <SupportPerformanceFilters
                            hidden={isAnalyticsNewFilters}
                        />
                        <ChannelsDownloadDataButton />
                    </>
                }
            >
                {isAnalyticsNewFilters && (
                    <DashboardSection>
                        <DashboardGridCell
                            size={getGridCellSize(12)}
                            className="pb-0"
                        >
                            <FiltersPanelWrapper
                                persistentFilters={[FilterKey.Period]}
                                optionalFilters={
                                    CHANNEL_REPORT_OPTIONAL_FILTERS
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
                )}
                <DashboardSection>
                    <DashboardGridCell size={getGridCellSize(12)}>
                        <CustomReportComponent
                            chart={ChannelsChart.ChannelsPerformanceTable}
                            config={ChannelsReportConfig}
                        />
                    </DashboardGridCell>
                </DashboardSection>
                <AnalyticsFooter />
            </StatsPage>
        </div>
    )
}
