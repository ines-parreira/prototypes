import { useRef } from 'react'

import { Box, Heading } from '@gorgias/axiom'

import { FilterKey } from 'domains/reporting/models/stat/types'
import { FiltersPanelWrapper } from 'domains/reporting/pages/common/filters/FiltersPanelWrapper/FiltersPanelWrapper'

import { AnalyticsOverviewReportConfig } from '../../AnalyticsOverviewReportConfig'
import { DEFAULT_ANALYTICS_OVERVIEW_LAYOUT } from '../../config/defaultLayoutConfig'
import { AnalyticsOverviewDownloadButton } from '../AnalyticsOverviewDownloadButton/AnalyticsOverviewDownloadButton'
import { DashboardLayoutRenderer } from '../DashboardLayoutRenderer/DashboardLayoutRenderer'

export const AnalyticsOverviewLayout = () => {
    const dashboardRef = useRef<HTMLDivElement>(null)

    return (
        <Box flexDirection="column" flex={1}>
            <Box
                flexDirection="column"
                justifyContent="space-between"
                padding="lg"
                paddingBottom="0px"
                gap="lg"
            >
                <Box
                    flexDirection="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Heading size="lg">Overview</Heading>
                    <AnalyticsOverviewDownloadButton
                        dashboardRef={dashboardRef}
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
                />
            </Box>
            <Box ref={dashboardRef} flexDirection="column" flex={1}>
                <DashboardLayoutRenderer
                    layoutConfig={DEFAULT_ANALYTICS_OVERVIEW_LAYOUT}
                />
            </Box>
        </Box>
    )
}
