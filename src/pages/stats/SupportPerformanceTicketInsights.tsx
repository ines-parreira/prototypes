import React from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import {useGridSize} from 'hooks/useGridSize'
import {FilterComponentKey, FilterKey} from 'models/stat/types'
import {AnalyticsFooter} from 'pages/stats/AnalyticsFooter'
import {FiltersPanel} from 'pages/stats/common/filters/FiltersPanel'
import {CustomFieldSelect} from 'pages/stats/CustomFieldSelect'

import {CustomFieldsTicketCountBreakdownReport} from 'pages/stats/CustomFieldsTicketCountBreakdownReport'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import DashboardSection from 'pages/stats/DashboardSection'
import {DownloadTicketFieldsDataButton} from 'pages/stats/DownloadTicketFieldsDataButton'
import StatsPage from 'pages/stats/StatsPage'
import {SupportPerformanceFilters} from 'pages/stats/SupportPerformanceFilters'
import {TicketDistributionTable} from 'pages/stats/TicketDistributionTable'
import {TicketFieldsBlankState} from 'pages/stats/TicketFieldsBlankState'
import {TicketInsightsFieldTrend} from 'pages/stats/TicketInsightsFieldTrend'

import {getSelectedCustomField} from 'state/ui/stats/ticketInsightsSlice'

export const TICKET_INSIGHTS_PAGE_TITLE = 'Ticket Fields'

export function SupportPerformanceTicketInsights() {
    const isAnalyticsNewFilters =
        !!useFlags()[FeatureFlagKey.AnalyticsNewFilters]
    const selectedCustomField = useAppSelector(getSelectedCustomField)
    const getGridCellSize = useGridSize()

    if (!selectedCustomField.isLoading && selectedCustomField.id === null) {
        return (
            <StatsPage title={TICKET_INSIGHTS_PAGE_TITLE} titleExtra={null}>
                <TicketFieldsBlankState />
            </StatsPage>
        )
    }

    return (
        <StatsPage
            title={TICKET_INSIGHTS_PAGE_TITLE}
            titleExtra={
                selectedCustomField.id ? (
                    <>
                        <SupportPerformanceFilters
                            hidden={isAnalyticsNewFilters}
                        />
                        <DownloadTicketFieldsDataButton
                            selectedCustomFieldId={selectedCustomField.id}
                        />
                    </>
                ) : null
            }
        >
            {isAnalyticsNewFilters && (
                <DashboardSection>
                    <DashboardGridCell
                        size={getGridCellSize(12)}
                        className="pb-0"
                    >
                        <FiltersPanel
                            persistentFilters={[
                                FilterKey.Period,
                                FilterComponentKey.CustomField,
                                FilterKey.AggregationWindow,
                            ]}
                            optionalFilters={[
                                FilterKey.Channels,
                                FilterKey.Integrations,
                                FilterKey.Tags,
                                FilterKey.Agents,
                                FilterKey.CustomFields,
                            ]}
                        />
                    </DashboardGridCell>
                </DashboardSection>
            )}
            {!isAnalyticsNewFilters && (
                <DashboardSection className="pb-0">
                    <CustomFieldSelect />
                </DashboardSection>
            )}

            {selectedCustomField.id && (
                <DashboardSection>
                    <DashboardGridCell size={getGridCellSize(1)}>
                        <TicketDistributionTable
                            selectedCustomField={{
                                id: selectedCustomField.id,
                                label: selectedCustomField.label,
                            }}
                            isAnalyticsNewFilters={isAnalyticsNewFilters}
                        />
                    </DashboardGridCell>
                    <DashboardGridCell size={getGridCellSize(11)}>
                        <TicketInsightsFieldTrend />
                    </DashboardGridCell>
                    <DashboardGridCell>
                        <CustomFieldsTicketCountBreakdownReport />
                    </DashboardGridCell>
                </DashboardSection>
            )}
            <AnalyticsFooter />
        </StatsPage>
    )
}
