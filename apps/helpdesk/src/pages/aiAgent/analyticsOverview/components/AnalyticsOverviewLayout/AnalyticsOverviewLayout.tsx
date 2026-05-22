import { useMemo, useRef } from 'react'

import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { useEffectOnce } from '@repo/hooks'
import { getPreviousUrl } from '@repo/routing'

import { Box } from '@gorgias/axiom'

import { DashboardExportButton } from '@repo/reporting'
import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { FiltersPanelWrapper } from 'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import {
    isPeriodBeforeDate,
    STORES_FILTER_AVAILABILITY_DATE,
} from 'domains/reporting/pages/common/filters/utils'
import { AnalyticsPage } from 'domains/reporting/pages/common/layout/AnalyticsPage'
import { AnalyticsOverviewReportConfig } from 'pages/aiAgent/analyticsOverview/AnalyticsOverviewReportConfig'
import { AiAgentDashboardLayoutRenderer } from 'pages/aiAgent/analyticsOverview/components/AiAgentDashboardLayoutRenderer'
import { DEFAULT_ANALYTICS_OVERVIEW_LAYOUT } from 'pages/aiAgent/analyticsOverview/config/defaultLayoutConfig'
import { useExportAnalyticsOverviewToCSV } from 'pages/aiAgent/analyticsOverview/hooks/useExportAnalyticsOverviewToCSV'
import {
    ManagedDashboardId,
    ManagedDashboardsTabId,
} from 'pages/aiAgent/analyticsOverview/types/layoutConfig'
import { useAiAgentAnalyticsDashboardTracking } from 'pages/aiAgent/hooks/useAiAgentAnalyticsDashboardTracking'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { STATS_ROUTES } from 'routes/constants'

export const AnalyticsOverviewLayout = () => {
    useCleanStatsFilters()
    const contentRef = useRef<HTMLDivElement>(null)
    const { onAnalyticsReportViewed, onExport } =
        useAiAgentAnalyticsDashboardTracking()

    useEffectOnce(() => {
        const previousUrl = getPreviousUrl()
        const previousReport = previousUrl?.split('/app/')[1] ?? '-'

        onAnalyticsReportViewed({
            reportName: STATS_ROUTES.ANALYTICS_OVERVIEW,
            previousReport,
        })
    })

    const { value: isFiltersEnabled, isLoading: isFiltersFFLoading } =
        useFlagWithLoading(FeatureFlagKey.AiAgentAnalyticsFilters)

    const optionalFilters = useMemo(
        () =>
            !isFiltersFFLoading && isFiltersEnabled
                ? AnalyticsOverviewReportConfig.reportFilters.optional
                : [],
        [isFiltersEnabled, isFiltersFFLoading],
    )

    const { statsFilters } = useAiAgentStatsFilters()
    const isStoresComingSoon = isPeriodBeforeDate({
        period: statsFilters.period,
        date: STORES_FILTER_AVAILABILITY_DATE,
    })

    return (
        <AnalyticsPage
            ref={contentRef}
            title="Overview"
            titleExtra={
                <DashboardExportButton
                    contentRef={contentRef}
                    useCsvExport={useExportAnalyticsOverviewToCSV}
                    onExport={(format) =>
                        onExport({
                            format,
                        })
                    }
                />
            }
            filtersSlot={
                <Box padding="lg" paddingBottom="0px">
                    <FiltersPanelWrapper
                        persistentFilters={
                            AnalyticsOverviewReportConfig.reportFilters
                                .persistent
                        }
                        withSavedFilters={false}
                        optionalFilters={optionalFilters}
                        filterSettingsOverrides={{
                            [FilterKey.Period]: {
                                initialSettings: {
                                    maxSpan: 365,
                                },
                            },
                            ...(isStoresComingSoon && {
                                [FilterKey.Stores]: {
                                    isDisabled: true,
                                    warningMessage:
                                        'The store filter will be available in AI Agent Overview starting August 1, 2025.',
                                },
                            }),
                        }}
                        compact
                    />
                </Box>
            }
        >
            <AiAgentDashboardLayoutRenderer
                defaultLayoutConfig={DEFAULT_ANALYTICS_OVERVIEW_LAYOUT}
                reportConfig={AnalyticsOverviewReportConfig}
                dashboardId={ManagedDashboardId.AiAgentOverview}
                tabId={ManagedDashboardsTabId.Overview}
                tabName="Overview"
            />
        </AnalyticsPage>
    )
}
