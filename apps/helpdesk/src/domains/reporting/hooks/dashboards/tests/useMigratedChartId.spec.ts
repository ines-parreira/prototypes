import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'
import { assumeMock, renderHook } from '@repo/testing'

import { useMigratedChartId } from 'domains/reporting/hooks/dashboards/useMigratedChartId'
import { AutomateOverviewChart } from 'domains/reporting/pages/automate/overview/AutomateOverviewReportConfig'
import { LEGACY_AI_AGENT_CHART_MIGRATION_MAP } from 'domains/reporting/pages/dashboards/legacyAiAgentChartMigration'
import { AnalyticsOverviewChart } from 'pages/aiAgent/analyticsOverview/AnalyticsOverviewReportConfig'

jest.mock('@repo/feature-flags')
const useFlagWithLoadingMock = assumeMock(useFlagWithLoading)

const enableBothFlags = () => {
    useFlagWithLoadingMock.mockImplementation((flag: FeatureFlagKey) => {
        if (flag === FeatureFlagKey.AiAgentAnalyticsDashboardsNewScreens)
            return { value: true, isLoading: false }
        if (flag === FeatureFlagKey.AiAgentAnalyticsDisableLegacyReports)
            return { value: true, isLoading: false }
        return { value: false, isLoading: false }
    })
}

const disableBothFlags = () => {
    useFlagWithLoadingMock.mockReturnValue({ value: false, isLoading: false })
}

describe('useMigratedChartId', () => {
    describe('when both flags are off', () => {
        beforeEach(disableBothFlags)

        it('returns the original chart id unchanged', () => {
            const { result } = renderHook(() =>
                useMigratedChartId(
                    AutomateOverviewChart.AutomationRateKPIChart,
                ),
            )
            expect(result.current).toBe(
                AutomateOverviewChart.AutomationRateKPIChart,
            )
        })

        it('returns a non-legacy chart id unchanged', () => {
            const { result } = renderHook(() =>
                useMigratedChartId('some_non_legacy_chart'),
            )
            expect(result.current).toBe('some_non_legacy_chart')
        })
    })

    describe('when only AiAgentAnalyticsDashboardsNewScreens is on', () => {
        beforeEach(() => {
            useFlagWithLoadingMock.mockImplementation(
                (flag: FeatureFlagKey) => {
                    if (
                        flag ===
                        FeatureFlagKey.AiAgentAnalyticsDashboardsNewScreens
                    )
                        return { value: true, isLoading: false }
                    return { value: false, isLoading: false }
                },
            )
        })

        it('returns the original chart id unchanged', () => {
            const { result } = renderHook(() =>
                useMigratedChartId(
                    AutomateOverviewChart.AutomationRateKPIChart,
                ),
            )
            expect(result.current).toBe(
                AutomateOverviewChart.AutomationRateKPIChart,
            )
        })
    })

    describe('when only AiAgentAnalyticsDisableLegacyReports is on', () => {
        beforeEach(() => {
            useFlagWithLoadingMock.mockImplementation(
                (flag: FeatureFlagKey) => {
                    if (
                        flag ===
                        FeatureFlagKey.AiAgentAnalyticsDisableLegacyReports
                    )
                        return { value: true, isLoading: false }
                    return { value: false, isLoading: false }
                },
            )
        })

        it('returns the original chart id unchanged', () => {
            const { result } = renderHook(() =>
                useMigratedChartId(
                    AutomateOverviewChart.AutomationRateKPIChart,
                ),
            )
            expect(result.current).toBe(
                AutomateOverviewChart.AutomationRateKPIChart,
            )
        })
    })

    describe('when both flags are on', () => {
        beforeEach(enableBothFlags)

        it('returns the mapped new chart id for a legacy chart', () => {
            const { result } = renderHook(() =>
                useMigratedChartId(
                    AutomateOverviewChart.AutomationRateKPIChart,
                ),
            )
            expect(result.current).toBe(
                AnalyticsOverviewChart.AutomationRateCard,
            )
        })

        it('returns null for a legacy chart with no new counterpart', () => {
            const { result } = renderHook(() =>
                useMigratedChartId('aiSalesRoiRate'),
            )
            expect(result.current).toBeNull()
        })

        it('returns the original id for a non-legacy chart', () => {
            const { result } = renderHook(() =>
                useMigratedChartId('some_non_legacy_chart'),
            )
            expect(result.current).toBe('some_non_legacy_chart')
        })

        it('covers all entries in the migration map', () => {
            Object.entries(LEGACY_AI_AGENT_CHART_MIGRATION_MAP).forEach(
                ([legacyId, newId]) => {
                    const { result } = renderHook(() =>
                        useMigratedChartId(legacyId),
                    )
                    expect(result.current).toBe(newId)
                },
            )
        })
    })
})
