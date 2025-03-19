import moment from 'moment'

import { PaywallConfig, paywallConfigs } from 'config/paywalls'
import { useCleanStatsFilters } from 'hooks/reporting/useCleanStatsFilters'
import { useGridSize } from 'hooks/useGridSize'
import { ProductType } from 'models/billing/types'
import { FilterKey } from 'models/stat/types'
import withProductEnabledPaywall from 'pages/common/utils/withProductEnabledPaywall'
import { AnalyticsFooter } from 'pages/stats/AnalyticsFooter'
import FiltersPanelWrapper from 'pages/stats/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'pages/stats/DashboardGridCell'
import { DashboardComponent } from 'pages/stats/dashboards/DashboardComponent'
import DashboardSection from 'pages/stats/DashboardSection'
import StatsPage from 'pages/stats/StatsPage'
import { VoiceAgentsDownloadDataButton } from 'pages/stats/voice/components/VoiceAgentsDownloadDataButton/VoiceAgentsDownloadDataButton'
import { MIN_DATE_FOR_ADVANCED_VOICE_STATS } from 'pages/stats/voice/constants/voiceOverview'
import {
    VoiceAgentsChart,
    VoiceAgentsReportConfig,
} from 'pages/stats/voice/pages/VoiceAgentsReportConfig'
import VoicePaywall from 'pages/stats/voice/VoicePaywall'
import { AccountFeature } from 'state/currentAccount/types'

function VoiceAgents() {
    useCleanStatsFilters()

    const getGridCellSize = useGridSize()

    return (
        <StatsPage
            title={VoiceAgentsReportConfig.reportName}
            titleExtra={
                <>
                    <VoiceAgentsDownloadDataButton />
                </>
            }
        >
            <DashboardSection>
                <DashboardGridCell size={getGridCellSize(12)} className="pb-0">
                    <FiltersPanelWrapper
                        filterSettingsOverrides={{
                            [FilterKey.Period]: {
                                initialSettings: {
                                    minDate: moment(
                                        MIN_DATE_FOR_ADVANCED_VOICE_STATS,
                                        'YYYY-MM-DD',
                                    ).toDate(),
                                    maxSpan: 365,
                                },
                            },
                        }}
                        persistentFilters={
                            VoiceAgentsReportConfig.reportFilters.persistent
                        }
                        optionalFilters={
                            VoiceAgentsReportConfig.reportFilters.optional
                        }
                    />
                </DashboardGridCell>
            </DashboardSection>
            <DashboardSection>
                <DashboardGridCell>
                    <DashboardComponent
                        config={VoiceAgentsReportConfig}
                        chart={VoiceAgentsChart.VoiceAgentsTable}
                    />
                </DashboardGridCell>
            </DashboardSection>
            <AnalyticsFooter />
        </StatsPage>
    )
}

export default withProductEnabledPaywall(
    ProductType.Voice,
    AccountFeature.PhoneNumber,
    VoicePaywall,
    {
        [AccountFeature.PhoneNumber]: {
            ...paywallConfigs[AccountFeature.PhoneNumber],
            pageHeader: VoiceAgentsReportConfig.reportName,
        } as PaywallConfig,
    },
)(VoiceAgents)
