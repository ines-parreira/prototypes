import { useMemo, useRef } from 'react'

import { Box } from '@gorgias/axiom'

import { DashboardExportButton, DashboardLayoutRenderer } from '@repo/reporting'

import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { FiltersPanelWrapper } from 'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import { AnalyticsPage } from 'domains/reporting/pages/common/layout/AnalyticsPage'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import {
    CHANNELS_TAB_PARAM,
    PERFORMANCE_CHANNELS_DASHBOARD_ID,
    PERFORMANCE_CHANNELS_EMAIL_TAB_NAME,
    PerformanceChannelsContent,
    PerformanceChannelsQueryParams,
} from 'domains/reporting/pages/performance/channels/constants'
import { ChannelsEmailReportConfig } from 'domains/reporting/pages/performance/channels/email/ChannelsEmailReportConfig'
import { DEFAULT_PERFORMANCE_CHANNELS_EMAIL_LAYOUT } from 'domains/reporting/pages/performance/channels/email/config/defaultLayoutConfig'
import { useExportPerformanceChannelsEmailToCSV } from 'domains/reporting/pages/performance/channels/email/hooks/useExportPerformanceChannelsEmailToCSV'
import { useSearchParam } from 'hooks/useSearchParam'

const HEADER_NAVBAR_ITEMS = [
    {
        param: PerformanceChannelsQueryParams.Email,
        title: PerformanceChannelsContent.Email,
    },
    {
        param: PerformanceChannelsQueryParams.Voice,
        title: PerformanceChannelsContent.Voice,
    },
] as const

export const PerformanceChannelsReport = () => {
    useCleanStatsFilters()
    const contentRef = useRef<HTMLDivElement>(null)

    const [channelsTab] = useSearchParam(CHANNELS_TAB_PARAM)
    const activeTab = channelsTab || PerformanceChannelsQueryParams.Email
    const isEmailTab = activeTab === PerformanceChannelsQueryParams.Email

    const renderDashboard = useMemo(() => {
        switch (activeTab) {
            case PerformanceChannelsQueryParams.Email:
                return (
                    <DashboardLayoutRenderer
                        defaultLayoutConfig={
                            DEFAULT_PERFORMANCE_CHANNELS_EMAIL_LAYOUT
                        }
                        reportConfig={ChannelsEmailReportConfig}
                        dashboardId={PERFORMANCE_CHANNELS_DASHBOARD_ID}
                        tabId={PerformanceChannelsQueryParams.Email}
                        tabName={PERFORMANCE_CHANNELS_EMAIL_TAB_NAME}
                        DashboardComponent={DashboardComponent}
                        enableTrendCards
                    />
                )
            case PerformanceChannelsQueryParams.Voice:
            default:
                return null
        }
    }, [activeTab])

    const { persistentFilters, optionalFilters } = useMemo(() => {
        switch (activeTab) {
            case PerformanceChannelsQueryParams.Email:
                return {
                    persistentFilters:
                        ChannelsEmailReportConfig.reportFilters.persistent,
                    optionalFilters:
                        ChannelsEmailReportConfig.reportFilters.optional,
                }
            default:
                return {
                    persistentFilters: null,
                    optionalFilters: null,
                }
        }
    }, [activeTab])

    return (
        <AnalyticsPage
            ref={contentRef}
            title="Channels"
            titleExtra={
                isEmailTab ? (
                    <DashboardExportButton
                        key={activeTab}
                        contentRef={contentRef}
                        useCsvExport={useExportPerformanceChannelsEmailToCSV}
                    />
                ) : (
                    <Box height="32px" />
                )
            }
            tabs={HEADER_NAVBAR_ITEMS}
            tabParamName={CHANNELS_TAB_PARAM}
            activeTab={activeTab}
            defaultTab={PerformanceChannelsQueryParams.Email}
            filtersSlot={
                persistentFilters ? (
                    <Box padding="lg" paddingBottom="0px">
                        <FiltersPanelWrapper
                            persistentFilters={persistentFilters}
                            optionalFilters={optionalFilters}
                            filterSettingsOverrides={{
                                [FilterKey.Period]: {
                                    initialSettings: {
                                        maxSpan: 365,
                                    },
                                },
                            }}
                            compact
                        />
                    </Box>
                ) : null
            }
        >
            {renderDashboard}
        </AnalyticsPage>
    )
}
