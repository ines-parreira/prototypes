import {useFlags} from 'launchdarkly-react-client-sdk'

import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import {useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters} from 'hooks/reporting/common/useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters'
import {useGridSize} from 'hooks/useGridSize'
import {FilterKey} from 'models/stat/types'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import StatsPage from 'pages/stats/StatsPage'
import {SupportPerformanceFilters} from 'pages/stats/support-performance/SupportPerformanceFilters'

export const SATISFACTION_TITLE = 'Satisfaction'
export const SATISFACTION_OPTIONAL_FILTERS = [
    FilterKey.Agents,
    FilterKey.Channels,
    FilterKey.Integrations,
    FilterKey.CustomFields,
]

export default function Satisfaction() {
    const satisfactionOptionalFilters =
        useOptionalFiltersWithSatisfactionScoreFilterAndAutoQaFilters(
            SATISFACTION_OPTIONAL_FILTERS
        )
    const getGridCellSize = useGridSize()
    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFilters]

    return (
        <div className="full-width">
            <StatsPage
                title={SATISFACTION_TITLE}
                titleExtra={
                    <>
                        <SupportPerformanceFilters
                            hidden={isAnalyticsNewFilters}
                        />
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
                                optionalFilters={satisfactionOptionalFilters}
                                filterSettingsOverrides={{
                                    [FilterKey.Period]: {
                                        initialSettings: {
                                            maxSpan: 365,
                                        },
                                    },
                                }}
                                persistentFilters={[FilterKey.Period]}
                            />
                        </DashboardGridCell>
                    </DashboardSection>
                )}
                <AnalyticsFooter />
            </StatsPage>
        </div>
    )
}
