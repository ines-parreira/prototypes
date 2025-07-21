import moment from 'moment'

import { PaywallConfig, paywallConfigs } from 'config/paywalls'
import { useCleanStatsFilters } from 'domains/reporting/hooks/useCleanStatsFilters'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { AnalyticsFooter } from 'domains/reporting/pages/common/AnalyticsFooter'
import FiltersPanelWrapper from 'domains/reporting/pages/common/filters/FiltersPanelWrapper'
import DashboardGridCell from 'domains/reporting/pages/common/layout/DashboardGridCell'
import DashboardSection from 'domains/reporting/pages/common/layout/DashboardSection'
import StatsPage from 'domains/reporting/pages/common/layout/StatsPage'
import { DashboardComponent } from 'domains/reporting/pages/dashboards/DashboardComponent'
import { VoiceAgentsDownloadDataButton } from 'domains/reporting/pages/voice/components/VoiceAgentsDownloadDataButton/VoiceAgentsDownloadDataButton'
import { MIN_DATE_FOR_ADVANCED_VOICE_STATS } from 'domains/reporting/pages/voice/constants/voiceOverview'
import {
    VoiceAgentsChart,
    VoiceAgentsReportConfig,
} from 'domains/reporting/pages/voice/pages/VoiceAgentsReportConfig'
import VoicePaywall from 'domains/reporting/pages/voice/VoicePaywall'
import { useGridSize } from 'hooks/useGridSize'
import { ProductType } from 'models/billing/types'
import withProductEnabledPaywall from 'pages/common/utils/withProductEnabledPaywall'
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
