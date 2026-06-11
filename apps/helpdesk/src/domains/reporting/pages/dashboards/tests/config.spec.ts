import {
    AutomateAiAgentsChart,
    AutomateAiAgentsReportConfig,
} from 'domains/reporting/pages/automate/ai-agent/AutomateAiAgentsReportConfig'
import { STATS_ROUTE_PREFIX } from 'domains/reporting/pages/common/components/constants'
import {
    getComponentConfig,
    getMetricOriginPath,
    getReportConfig,
    getReportConfigFromPath,
} from 'domains/reporting/pages/dashboards/config'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import {
    ChannelsEmailReportConfig,
    PerformanceChannelsEmailChart,
} from 'domains/reporting/pages/performance/channels/email/ChannelsEmailReportConfig'
import {
    ChannelsVoiceReportConfig,
    PerformanceChannelsVoiceChart,
} from 'domains/reporting/pages/performance/channels/voice/ChannelsVoiceReportConfig'
import {
    PerformanceOverviewChart,
    PerformanceOverviewReportConfig,
} from 'domains/reporting/pages/performance/overview/PerformanceOverviewReportConfig'
import {
    SatisfactionChart,
    SatisfactionReportConfig,
} from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionReportConfig'
import {
    AnalyticsAiAgentAllAgentsChart,
    AnalyticsAiAgentAllAgentsReportConfig,
} from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentAllAgentsReportConfig'
import { AnalyticsAiAgentShoppingAssistantChart } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentShoppingAssistantReportConfig'
import { AnalyticsAiAgentSupportAgentChart } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentSupportAgentReportConfig'

describe('getComponentConfig', () => {
    it('finds a chart from REPORTS_CONFIG', () => {
        const { reportConfig, chartConfig } = getComponentConfig(
            SatisfactionChart.SatisfactionScoreTrendCard,
        )

        expect(reportConfig).toBe(SatisfactionReportConfig)
        expect(chartConfig).toBeDefined()
    })

    it('finds a chart from REVAMPED_REPORTS_CONFIG using AllAgents chart ID', () => {
        const { reportConfig, chartConfig } = getComponentConfig(
            AnalyticsAiAgentAllAgentsChart.AutomationRateCard,
        )

        expect(reportConfig).toMatchObject({
            id: ReportsIDs.AiAgentAnalyticsAllAgents,
        })
        expect(chartConfig).toBeDefined()
    })

    it('finds a chart from REVAMPED_REPORTS_CONFIG using ShoppingAssistant chart ID', () => {
        const { reportConfig, chartConfig } = getComponentConfig(
            AnalyticsAiAgentShoppingAssistantChart.OrdersInfluencedCard,
        )

        expect(reportConfig).toMatchObject({
            id: ReportsIDs.AiAgentAnalyticsShoppingAssistant,
        })
        expect(chartConfig).toBeDefined()
    })

    it('finds a chart from REVAMPED_REPORTS_CONFIG using SupportAgent chart ID', () => {
        const { reportConfig, chartConfig } = getComponentConfig(
            AnalyticsAiAgentSupportAgentChart.SupportInteractionsCard,
        )

        expect(reportConfig).toMatchObject({
            id: ReportsIDs.AiAgentAnalyticsSupportAgent,
        })
        expect(chartConfig).toBeDefined()
    })

    it('finds an overview chart from PERFORMANCE_REPORTS_CONFIG', () => {
        const { reportConfig, chartConfig, category } = getComponentConfig(
            PerformanceOverviewChart.ConfigurableBarGraph,
        )

        expect(reportConfig).toBe(PerformanceOverviewReportConfig)
        expect(chartConfig).toBeDefined()
        expect(category).toBe('Performance')
    })

    it('finds a channels chart from PERFORMANCE_REPORTS_CONFIG', () => {
        const { reportConfig, chartConfig, category } = getComponentConfig(
            PerformanceChannelsEmailChart.AverageCSATCard,
        )

        expect(reportConfig).toBe(ChannelsEmailReportConfig)
        expect(chartConfig).toBeDefined()
        expect(category).toBe('Performance')
    })

    it('finds a voice channels chart from PERFORMANCE_REPORTS_CONFIG', () => {
        const { reportConfig, chartConfig, category } = getComponentConfig(
            PerformanceChannelsVoiceChart.TotalCallsCard,
        )

        expect(reportConfig).toBe(ChannelsVoiceReportConfig)
        expect(chartConfig).toBeDefined()
        expect(category).toBe('Performance')
    })

    it('finds a legacy chart when withLegacyReports is true', () => {
        const { reportConfig } = getComponentConfig(
            AutomateAiAgentsChart.AiAgentTable,
            true,
        )

        expect(reportConfig).toBe(AutomateAiAgentsReportConfig)
    })

    it('returns null for an unknown chart ID', () => {
        const { reportConfig, chartConfig } =
            getComponentConfig('unknown_chart')

        expect(reportConfig).toBeNull()
        expect(chartConfig).toBeNull()
    })
})

describe('getReportConfig', () => {
    it('finds a report from REPORTS_CONFIG by ID', () => {
        const config = getReportConfig(ReportsIDs.SatisfactionReportConfig)

        expect(config).toBe(SatisfactionReportConfig)
    })

    it('finds AllAgents report from REVAMPED_REPORTS_CONFIG', () => {
        const config = getReportConfig(ReportsIDs.AiAgentAnalyticsAllAgents)

        expect(config).toMatchObject({
            id: ReportsIDs.AiAgentAnalyticsAllAgents,
        })
    })

    it('finds ShoppingAssistant report from REVAMPED_REPORTS_CONFIG', () => {
        const config = getReportConfig(
            ReportsIDs.AiAgentAnalyticsShoppingAssistant,
        )

        expect(config).toMatchObject({
            id: ReportsIDs.AiAgentAnalyticsShoppingAssistant,
        })
    })

    it('finds SupportAgent report from REVAMPED_REPORTS_CONFIG', () => {
        const config = getReportConfig(ReportsIDs.AiAgentAnalyticsSupportAgent)

        expect(config).toMatchObject({
            id: ReportsIDs.AiAgentAnalyticsSupportAgent,
        })
    })

    it('finds the overview report from PERFORMANCE_REPORTS_CONFIG by ID', () => {
        const config = getReportConfig(
            ReportsIDs.PerformanceOverviewReportConfig,
        )

        expect(config).toBe(PerformanceOverviewReportConfig)
    })

    it('finds the channels report from PERFORMANCE_REPORTS_CONFIG by ID', () => {
        const config = getReportConfig(
            ReportsIDs.PerformanceChannelsEmailReportConfig,
        )

        expect(config).toBe(ChannelsEmailReportConfig)
    })

    it('finds the voice channels report from PERFORMANCE_REPORTS_CONFIG by ID', () => {
        const config = getReportConfig(
            ReportsIDs.PerformanceChannelsVoiceReportConfig,
        )

        expect(config).toBe(ChannelsVoiceReportConfig)
    })

    it('finds a legacy report when withLegacyReports is true', () => {
        const config = getReportConfig(
            ReportsIDs.AutomateAiAgentsReportConfig,
            true,
        )

        expect(config).toBe(AutomateAiAgentsReportConfig)
    })

    it('returns null for an unknown report ID', () => {
        const config = getReportConfig('unknown_report_id')

        expect(config).toBeNull()
    })
})

describe('getReportConfigFromPath', () => {
    it('finds a report from REPORTS_CONFIG by path', () => {
        const path = `${STATS_ROUTE_PREFIX}${SatisfactionReportConfig.reportPath}`
        const config = getReportConfigFromPath(path)

        expect(config).toBe(SatisfactionReportConfig)
    })

    it('finds the first matching report from REVAMPED_REPORTS_CONFIG for the shared AI agent path', () => {
        const path = `${STATS_ROUTE_PREFIX}${AnalyticsAiAgentAllAgentsReportConfig.reportPath}`
        const config = getReportConfigFromPath(path)

        expect(config).not.toBeNull()
    })

    it('finds the overview report from PERFORMANCE_REPORTS_CONFIG by path', () => {
        const path = `${STATS_ROUTE_PREFIX}${PerformanceOverviewReportConfig.reportPath}`
        const config = getReportConfigFromPath(path)

        expect(config).toBe(PerformanceOverviewReportConfig)
    })

    it('finds the channels report from PERFORMANCE_REPORTS_CONFIG by path', () => {
        const path = `${STATS_ROUTE_PREFIX}${ChannelsEmailReportConfig.reportPath}`
        const config = getReportConfigFromPath(path)

        expect(config).toBe(ChannelsEmailReportConfig)
    })

    it('finds a legacy report by path', () => {
        const path = `${STATS_ROUTE_PREFIX}${AutomateAiAgentsReportConfig.reportPath}`
        const config = getReportConfigFromPath(path)

        expect(config).toBe(AutomateAiAgentsReportConfig)
    })

    it('returns null for an unknown path', () => {
        const config = getReportConfigFromPath('/app/stats/unknown-path')

        expect(config).toBeNull()
    })
})

describe('getMetricOriginPath', () => {
    it('returns null for an unknown chart ID', () => {
        const path = getMetricOriginPath('unknown_chart_id')

        expect(path).toBeNull()
    })

    it('returns "AI Agent > All Agents" for revamped All Agents charts', () => {
        const path = getMetricOriginPath(
            AnalyticsAiAgentAllAgentsChart.AutomationRateCard,
        )

        expect(path).toEqual({ prefix: 'AI Agent', suffix: 'All Agents' })
    })

    it('returns "AI Agent > Shopping Assistant" for Shopping Assistant charts', () => {
        const path = getMetricOriginPath(
            AnalyticsAiAgentShoppingAssistantChart.OrdersInfluencedCard,
        )

        expect(path).toEqual({
            prefix: 'AI Agent',
            suffix: 'Shopping Assistant',
        })
    })

    it('returns the Performance category for overview charts', () => {
        const path = getMetricOriginPath(
            PerformanceOverviewChart.ConfigurableBarGraph,
        )

        expect(path).toEqual({
            prefix: 'Performance',
            suffix: PerformanceOverviewReportConfig.reportName,
        })
    })

    it('returns the Performance category for channels charts', () => {
        const path = getMetricOriginPath(
            PerformanceChannelsEmailChart.AverageCSATCard,
        )

        expect(path).toEqual({
            prefix: 'Performance',
            suffix: ChannelsEmailReportConfig.reportName,
        })
    })

    it('returns the Performance category for voice channels charts', () => {
        const path = getMetricOriginPath(
            PerformanceChannelsVoiceChart.TotalCallsCard,
        )

        expect(path).toEqual({
            prefix: 'Performance',
            suffix: ChannelsVoiceReportConfig.reportName,
        })
    })

    it('returns "category > reportName" for standard charts', () => {
        const path = getMetricOriginPath(
            SatisfactionChart.SatisfactionScoreTrendCard,
        )

        expect(path).toEqual({
            prefix: 'Quality management',
            suffix: 'Satisfaction',
        })
    })

    it('returns null for a legacy chart when withLegacyReports is not set', () => {
        const path = getMetricOriginPath(AutomateAiAgentsChart.AiAgentTable)

        expect(path).toBeNull()
    })

    it('returns "AI Agent > AI Agents" for a legacy chart when withLegacyReports is true', () => {
        const path = getMetricOriginPath(
            AutomateAiAgentsChart.AiAgentTable,
            true,
        )

        expect(path).toEqual({ prefix: 'AI Agent', suffix: 'AI Agents' })
    })
})
