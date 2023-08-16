import React, {useState} from 'react'
import {Link} from 'react-router-dom'
import {useFlags} from 'launchdarkly-react-client-sdk'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import ChartCard from 'pages/stats/ChartCard'
import {useCleanStatsFilters} from 'hooks/reporting/useCleanStatsFilters'
import {AgentsTable} from 'pages/stats/AgentsTable'

import BannerNotification from 'pages/common/components/BannerNotifications/BannerNotification'
import {
    getStatsMessagingIntegrations,
    getPageStatsFilters,
} from 'state/stats/selectors'
import {TicketChannel} from 'business/types/ticket'
import useAppSelector from 'hooks/useAppSelector'
import {FeatureFlagKey} from 'config/featureFlags'

import AgentsStatsFilter from './AgentsStatsFilter'
import ChannelsStatsFilter from './ChannelsStatsFilter'
import IntegrationsStatsFilter from './IntegrationsStatsFilter'
import PeriodStatsFilter from './PeriodStatsFilter'
import TagsStatsFilter from './TagsStatsFilter'
import DashboardSection from './DashboardSection'
import StatsPage from './StatsPage'
import {LEARN_MORE_URL} from './SupportPerformanceOverview'
import {DownloadAgentsPerformanceDataButton} from './DownloadAgentsPerformanceDataButton'

export const AGENTS_PAGE_TITLE = 'Agents'
export const AGENT_PERFORMANCE_SECTION_TITLE = 'Agent Performance'
export const AGENT_PERFORMANCE_LEGACY_PATH =
    '/app/stats/support-performance-agents-legacy'

export default function SupportPerformanceAgents() {
    const [isVersionBannerVisible, setIsVersionBannerVisible] = useState(true)
    const hasFilterByTags: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsFilterByTags]
    const hasExportAgentsPerformance: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsExportAgentsPerformance]

    const messagingIntegrations = useAppSelector(getStatsMessagingIntegrations)
    const pageStatsFilters = useAppSelector(getPageStatsFilters)
    useCleanStatsFilters(pageStatsFilters)

    return (
        <div className="full-width">
            {isVersionBannerVisible ? (
                <BannerNotification
                    actionHTML={
                        <Link to={AGENT_PERFORMANCE_LEGACY_PATH}>
                            <i className="material-icons">refresh</i> Switch To
                            Old Version
                        </Link>
                    }
                    closable
                    dismissible={false}
                    message={
                        <span>
                            Welcome to the new Agents Performance beta! The
                            metrics are computed in a new way to represent your
                            performance more accurately.{' '}
                            <a href={LEARN_MORE_URL}>Learn more.</a>
                        </span>
                    }
                    onClose={() => setIsVersionBannerVisible(false)}
                />
            ) : null}
            <StatsPage
                title={AGENTS_PAGE_TITLE}
                filters={
                    <>
                        <IntegrationsStatsFilter
                            value={pageStatsFilters.integrations}
                            integrations={messagingIntegrations}
                            isMultiple
                            variant="ghost"
                        />
                        <ChannelsStatsFilter
                            value={pageStatsFilters.channels}
                            channels={Object.values(TicketChannel)}
                            variant="ghost"
                        />
                        <AgentsStatsFilter
                            value={pageStatsFilters.agents}
                            variant="ghost"
                        />
                        {hasFilterByTags && (
                            <TagsStatsFilter
                                value={pageStatsFilters.tags}
                                variant="ghost"
                            />
                        )}
                        <PeriodStatsFilter
                            initialSettings={{
                                maxSpan: 365,
                            }}
                            value={pageStatsFilters.period}
                            variant="ghost"
                        />
                        {hasExportAgentsPerformance && (
                            <DownloadAgentsPerformanceDataButton />
                        )}
                    </>
                }
            >
                <DashboardSection title="">
                    <DashboardGridCell size={12}>
                        <ChartCard
                            title={AGENT_PERFORMANCE_SECTION_TITLE}
                            noPadding
                        >
                            <AgentsTable />
                        </ChartCard>
                    </DashboardGridCell>
                </DashboardSection>
            </StatsPage>
        </div>
    )
}
