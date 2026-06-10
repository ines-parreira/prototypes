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
    PERFORMANCE_CHANNELS_VOICE_TAB_NAME,
    PerformanceChannelsContent,
    PerformanceChannelsQueryParams,
} from 'domains/reporting/pages/performance/channels/constants'
import { ChannelsEmailReportConfig } from 'domains/reporting/pages/performance/channels/email/ChannelsEmailReportConfig'
import { DEFAULT_PERFORMANCE_CHANNELS_EMAIL_LAYOUT } from 'domains/reporting/pages/performance/channels/email/config/defaultLayoutConfig'
import { useExportPerformanceChannelsEmailToCSV } from 'domains/reporting/pages/performance/channels/email/hooks/useExportPerformanceChannelsEmailToCSV'
import { ChannelsVoiceReportConfig } from 'domains/reporting/pages/performance/channels/voice/ChannelsVoiceReportConfig'
import { DEFAULT_PERFORMANCE_CHANNELS_VOICE_LAYOUT } from 'domains/reporting/pages/performance/channels/voice/config/defaultLayoutConfig'
import { useExportPerformanceChannelsVoiceToCSV } from 'domains/reporting/pages/performance/channels/voice/hooks/useExportPerformanceChannelsVoiceToCSV'
import VoicePaywall from 'domains/reporting/pages/voice/VoicePaywall'
import useAppSelector from 'hooks/useAppSelector'
import { useSearchParam } from 'hooks/useSearchParam'
import { ProductType } from 'models/billing/types'
import { currentAccountHasProduct } from 'state/billing/selectors'

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
    const isVoiceTab = activeTab === PerformanceChannelsQueryParams.Voice

    const hasVoiceProduct = useAppSelector<boolean>(
        currentAccountHasProduct(ProductType.Voice),
    )

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
                    />
                )
            case PerformanceChannelsQueryParams.Voice:
                return hasVoiceProduct ? (
                    <DashboardLayoutRenderer
                        defaultLayoutConfig={
                            DEFAULT_PERFORMANCE_CHANNELS_VOICE_LAYOUT
                        }
                        reportConfig={ChannelsVoiceReportConfig}
                        dashboardId={PERFORMANCE_CHANNELS_DASHBOARD_ID}
                        tabId={PerformanceChannelsQueryParams.Voice}
                        tabName={PERFORMANCE_CHANNELS_VOICE_TAB_NAME}
                        DashboardComponent={DashboardComponent}
                    />
                ) : (
                    <VoicePaywall showPageHeader={false} />
                )
            default:
                return null
        }
    }, [activeTab, hasVoiceProduct])

    const { persistentFilters, optionalFilters } = useMemo(() => {
        const noFilters = {
            persistentFilters: null,
            optionalFilters: null,
        }
        switch (activeTab) {
            case PerformanceChannelsQueryParams.Email:
                return {
                    persistentFilters:
                        ChannelsEmailReportConfig.reportFilters.persistent,
                    optionalFilters:
                        ChannelsEmailReportConfig.reportFilters.optional,
                }
            case PerformanceChannelsQueryParams.Voice:
                return hasVoiceProduct
                    ? {
                          persistentFilters:
                              ChannelsVoiceReportConfig.reportFilters
                                  .persistent,
                          optionalFilters:
                              ChannelsVoiceReportConfig.reportFilters.optional,
                      }
                    : noFilters
            default:
                return noFilters
        }
    }, [activeTab, hasVoiceProduct])

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
                ) : isVoiceTab && hasVoiceProduct ? (
                    <DashboardExportButton
                        key={activeTab}
                        contentRef={contentRef}
                        useCsvExport={useExportPerformanceChannelsVoiceToCSV}
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
                ) : null
            }
        >
            {renderDashboard}
        </AnalyticsPage>
    )
}
