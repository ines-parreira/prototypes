import { useRef } from 'react'

import { useEffectOnce } from '@repo/hooks'
import { getPreviousUrl } from '@repo/routing'

import { Box, Heading } from '@gorgias/axiom'

import { FilterKey } from 'domains/reporting/models/stat/types'
import { FiltersPanelWrapper } from 'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'
import { useAiAgentAnalyticsDashboardTracking } from 'pages/aiAgent/hooks/useAiAgentAnalyticsDashboardTracking'
import { STATS_ROUTES } from 'routes/constants'

import { AnalyticsOverviewReportConfig } from '../../AnalyticsOverviewReportConfig'
import { DEFAULT_ANALYTICS_OVERVIEW_LAYOUT } from '../../config/defaultLayoutConfig'
import { useExportAnalyticsOverviewToCSV } from '../../hooks/useExportAnalyticsOverviewToCSV'
import { AnalyticsOverviewDownloadButton } from '../AnalyticsOverviewDownloadButton/AnalyticsOverviewDownloadButton'
import { DashboardLayoutRenderer } from '../DashboardLayoutRenderer/DashboardLayoutRenderer'

import css from './AnalyticsOverviewLayout.less'

export const AnalyticsOverviewLayout = () => {
    const contentRef = useRef<HTMLDivElement>(null)
    const { onAnalyticsReportViewed } = useAiAgentAnalyticsDashboardTracking()

    useEffectOnce(() => {
        const previousUrl = getPreviousUrl()
        const previousReport = previousUrl?.split('/app/')[1] ?? '-'

        onAnalyticsReportViewed({
            reportName: STATS_ROUTES.ANALYTICS_OVERVIEW,
            previousReport,
        })
    })

    return (
        <Box
            ref={contentRef}
            display="flex"
            flexDirection="column"
            flex={1}
            minWidth="0px"
        >
            <Box
                flexDirection="column"
                justifyContent="space-between"
                padding="lg"
                paddingBottom="0px"
                gap="lg"
                className={css.stickyHeader}
            >
                <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Heading size="lg">Overview</Heading>
                    <AnalyticsOverviewDownloadButton
                        contentRef={contentRef}
                        useCsvExport={useExportAnalyticsOverviewToCSV}
                    />
                </Box>
                <FiltersPanelWrapper
                    persistentFilters={
                        AnalyticsOverviewReportConfig.reportFilters.persistent
                    }
                    withSavedFilters={false}
                    optionalFilters={[]}
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
            <Box display="flex" flexDirection="column" flex={1} minWidth="0px">
                <DashboardLayoutRenderer
                    layoutConfig={DEFAULT_ANALYTICS_OVERVIEW_LAYOUT}
                    reportConfig={AnalyticsOverviewReportConfig}
                />
            </Box>
        </Box>
    )
}
