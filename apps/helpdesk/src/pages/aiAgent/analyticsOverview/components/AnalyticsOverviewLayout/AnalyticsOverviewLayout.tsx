import { useRef } from 'react'

import { getPreviousUrl } from '@repo/routing'
import { useEffectOnce, useLocalStorage } from '@gorgias/toolkit-react'

import { DashboardExportButton } from '@repo/reporting'
import moment from 'moment'
import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { FiltersPanelWrapper } from 'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import {
    isPeriodBeforeDate,
    STORES_FILTER_AVAILABILITY_DATE,
} from 'domains/reporting/pages/common/filters/utils'
import { AnalyticsPage } from 'domains/reporting/pages/common/layout/AnalyticsPage'
import { AiAgentDataDelayBanner } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentDataDelayBanner'
import {
    DATA_FILTERING_WARNING_MESSAGE,
    DISMISSED_FILTERING_MESSAGE_BANNER,
} from 'pages/aiAgent/analyticsAiAgent/constants'
import { getAiAgentDateTooltip } from 'pages/aiAgent/analyticsAiAgent/utils/getAiAgentDateTooltip'
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

    const { statsFilters } = useAiAgentStatsFilters()

    const isStoresComingSoon = isPeriodBeforeDate({
        period: statsFilters.period,
        date: STORES_FILTER_AVAILABILITY_DATE,
    })

    const [isDataFilteringBannerDismissed] = useLocalStorage(
        DISMISSED_FILTERING_MESSAGE_BANNER,
        false,
    )

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
            banner={
                !isDataFilteringBannerDismissed && <AiAgentDataDelayBanner />
            }
            filtersSlot={
                <FiltersPanelWrapper
                    persistentFilters={
                        AnalyticsOverviewReportConfig.reportFilters.persistent
                    }
                    optionalFilters={
                        AnalyticsOverviewReportConfig.reportFilters.optional
                    }
                    filterSettingsOverrides={{
                        [FilterKey.Period]: {
                            initialSettings: {
                                maxSpan: 365,
                                maxDate: moment().subtract(3, 'days').toDate(),
                            },
                            warningMessage: isDataFilteringBannerDismissed
                                ? DATA_FILTERING_WARNING_MESSAGE
                                : undefined,
                            getDateTooltip: getAiAgentDateTooltip,
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
