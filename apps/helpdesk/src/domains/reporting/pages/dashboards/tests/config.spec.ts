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
