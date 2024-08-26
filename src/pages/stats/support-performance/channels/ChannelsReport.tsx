import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {ChannelsDownloadDataButton} from 'pages/stats/support-performance/channels/ChannelsDownloadDataButton'
import {ChannelsCardExtra} from 'pages/stats/support-performance/channels/ChannelsCardExtra'
import DashboardSection from 'pages/stats/DashboardSection'
import {useGridSize} from 'hooks/useGridSize'
import {ChannelsTable} from 'pages/stats/support-performance/channels/ChannelsTable'
import ChartCard from 'pages/stats/ChartCard'
import DashboardGridCell from 'pages/stats/DashboardGridCell'

import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'

import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import StatsPage from 'pages/stats/StatsPage'
import {FeatureFlagKey} from 'config/featureFlags'
import {FiltersPanel} from 'pages/stats/common/filters/FiltersPanel'
import {FilterKey} from 'models/stat/types'

export const CHANNELS_REPORT_PAGE_TITLE = 'Channels'
export const CHANNEL_PERFORMANCE_TABLE_TITLE = 'Channel performance'

export function ChannelsReport() {
    const getGridCellSize = useGridSize()

    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFilters]

    return (
        <div className="full-width">
            <StatsPage
                title={CHANNELS_REPORT_PAGE_TITLE}
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
                            <FiltersPanel
                                persistentFilters={[FilterKey.Period]}
                                optionalFilters={[
                                    FilterKey.Channels,
                                    FilterKey.Integrations,
                                    FilterKey.Tags,
                                    FilterKey.Agents,
                                ]}
                            />
                        </DashboardGridCell>
                    </DashboardSection>
                )}
                <DashboardSection>
                    <DashboardGridCell size={getGridCellSize(12)}>
                        <ChartCard
                            title={CHANNEL_PERFORMANCE_TABLE_TITLE}
                            noPadding
                            titleExtra={<ChannelsCardExtra />}
                        >
                            <ChannelsTable />
                        </ChartCard>
                    </DashboardGridCell>
                </DashboardSection>
                <AnalyticsFooter />
            </StatsPage>
        </div>
    )
}
