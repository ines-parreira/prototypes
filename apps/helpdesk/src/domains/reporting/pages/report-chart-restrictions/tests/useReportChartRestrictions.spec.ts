import { assumeMock, renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import { UserRole } from 'config/types/user'
import { useReportRestrictions } from 'domains/reporting/hooks/dashboards/useReportRestrictions'
import { STATS_ROUTE_PREFIX } from 'domains/reporting/pages/common/components/constants'
import { getReportConfig } from 'domains/reporting/pages/dashboards/config'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import {
    HelpCenterChart,
    HelpCenterReportConfig,
} from 'domains/reporting/pages/help-center/components/HelpCenterReport/HelpCenterReportConfig'
import {
    SatisfactionChart,
    SatisfactionReportConfig,
} from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionReportConfig'
import * as constants from 'domains/reporting/pages/report-chart-restrictions/config'
import type { RestrictionsPerCustomer } from 'domains/reporting/pages/report-chart-restrictions/config'
import { RestrictedComponentType } from 'domains/reporting/pages/report-chart-restrictions/config'
import {
    getAccountRestrictions,
    getUserChartsRestrictions,
    getUserModuleRestrictions,
    getUserReportsRestrictions,
    useReportChartRestrictions,
} from 'domains/reporting/pages/report-chart-restrictions/useReportChartRestrictions'
import { SupportPerformanceAgentsReportConfig } from 'domains/reporting/pages/support-performance/agents/SupportPerformanceAgentsReportConfig'
import { AutoQAReportConfig } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAReportConfig'
import {
    OverviewChart,
    SupportPerformanceOverviewReportConfig,
} from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewReportConfig'
import useAppSelector from 'hooks/useAppSelector'
import { STATS_ROUTES } from 'routes/constants'

jest.mock('state/currentAccount/selectors')
jest.mock('state/currentUser/selectors')
jest.mock('hooks/useAppSelector')
const mockUseAppSelector = assumeMock(useAppSelector)
jest.mock('domains/reporting/hooks/dashboards/useReportRestrictions')
const useReportRestrictionsMock = assumeMock(useReportRestrictions)
jest.mock('domains/reporting/pages/report-chart-restrictions/config')

const permittedAccountId = 1
const restrictedAccountId = 123
const nonExistentChartIdAndPartOfRestrictedReport =
    OverviewChart.MedianResolutionTimeTrendCard
const strictlyRestrictedChartId = SatisfactionChart.SatisfactionScoreTrendCard
const strictlyRestrictedNavigationUrl = 'some/test/url'

const RBAC_RESTRICTIONS_MOCK: RestrictionsPerCustomer = {
    [restrictedAccountId]: [
        {
            ids: [nonExistentChartIdAndPartOfRestrictedReport],
            type: RestrictedComponentType.Chart,
            role: UserRole.Agent,
        },
        {
            ids: [ReportsIDs.SupportPerformanceOverviewReportConfig],
            type: RestrictedComponentType.Report,
            role: UserRole.Agent,
        },
        {
            ids: [
                ReportsIDs.SupportPerformanceAgentsReportConfig,
                ReportsIDs.VoiceOverviewReportConfig,
            ],
            type: RestrictedComponentType.Report,
            role: UserRole.Agent,
        },
        {
            ids: [strictlyRestrictedChartId],
            type: RestrictedComponentType.Chart,
            role: UserRole.BasicAgent,
        },
        {
            ids: [strictlyRestrictedNavigationUrl],
            type: RestrictedComponentType.Module,
            role: UserRole.BasicAgent,
        },
    ],
}

const currentConfig = RBAC_RESTRICTIONS_MOCK[restrictedAccountId]
const permittedUser = fromJS({
    id: permittedAccountId,
    name: 'John Doe',
    role: { name: UserRole.Admin },
})
const restrictedUser = fromJS({
    id: restrictedAccountId,
    name: 'John Doe',
    role: { name: UserRole.LiteAgent },
})

describe('getAccountRestrictions', () => {
    beforeEach(() => {
        jest.replaceProperty(
            constants,
            'RBAC_RESTRICTIONS',
            RBAC_RESTRICTIONS_MOCK as any,
        )
    })

    it('should return an empty list for a permitted account', () => {
        expect(getAccountRestrictions(permittedAccountId)).toEqual([])
    })

    it('should return a configuration list for a restricted account', () => {
        expect(getAccountRestrictions(restrictedAccountId)).toEqual(
            RBAC_RESTRICTIONS_MOCK[restrictedAccountId],
        )
    })
})

describe('getUserModuleRestrictions', () => {
    beforeEach(() => {
        jest.replaceProperty(
            constants,
            'RBAC_RESTRICTIONS',
            RBAC_RESTRICTIONS_MOCK as any,
        )
    })

    it('should return an empty list for a permitted account', () => {
        expect(
            getUserModuleRestrictions(
                permittedUser,
                getAccountRestrictions(permittedAccountId),
            ),
        ).toEqual([])
    })

    it('should return a configuration list for a restricted account', () => {
        expect(
            getUserModuleRestrictions(
                restrictedUser,
                getAccountRestrictions(restrictedAccountId),
            ),
        ).toEqual([currentConfig[4]])
    })
})

describe('getUserReportsRestrictions', () => {
    beforeEach(() => {
        jest.replaceProperty(
            constants,
            'RBAC_RESTRICTIONS',
            RBAC_RESTRICTIONS_MOCK as any,
        )
    })

    it('should return an empty list for a permitted account', () => {
        expect(
            getUserReportsRestrictions(
                permittedUser,
                getAccountRestrictions(permittedAccountId),
            ),
        ).toEqual([])
    })

    it('should return a configuration list for a restricted account', () => {
        expect(
            getUserReportsRestrictions(
                restrictedUser,
                getAccountRestrictions(restrictedAccountId),
            ),
        ).toEqual([currentConfig[1], currentConfig[2]])
    })
})

describe('getUserChartsRestrictions', () => {
    beforeEach(() => {
        jest.replaceProperty(
            constants,
            'RBAC_RESTRICTIONS',
            RBAC_RESTRICTIONS_MOCK as any,
        )
    })

    it('should return an empty list for a permitted account', () => {
        expect(
            getUserChartsRestrictions(
                permittedUser,
                getAccountRestrictions(permittedAccountId),
            ),
        ).toEqual([])
    })

    it('should return a configuration list for a restricted account', () => {
        expect(
            getUserChartsRestrictions(
                restrictedUser,
                getAccountRestrictions(restrictedAccountId),
            ),
        ).toEqual([currentConfig[0], currentConfig[3]])
    })
})

describe('useReportChartRestrictions', () => {
    beforeEach(() => {
        jest.replaceProperty(
            constants,
            'RBAC_RESTRICTIONS',
            RBAC_RESTRICTIONS_MOCK as any,
        )
        useReportRestrictionsMock.mockReturnValue({
            reportRestrictionsMap: {},
            moduleRestrictionsMap: {},
        })
    })

    describe('isModuleRestrictedToCurrentUser', () => {
        it('should return true for a restricted route', () => {
            mockUseAppSelector
                .mockReturnValueOnce(restrictedAccountId)
                .mockReturnValueOnce(restrictedUser)

            const { result } = renderHook(() => useReportChartRestrictions())

            expect(
                result.current.isModuleRestrictedToCurrentUser(
                    strictlyRestrictedNavigationUrl,
                ),
            ).toEqual(true)
        })

        it('should return false for a non-restricted route', () => {
            mockUseAppSelector
                .mockReturnValueOnce(restrictedAccountId)
                .mockReturnValueOnce(restrictedUser)

            const { result } = renderHook(() => useReportChartRestrictions())

            expect(
                result.current.isModuleRestrictedToCurrentUser('any-other-url'),
            ).toEqual(false)
        })

        it('should return false for a permitted account', () => {
            mockUseAppSelector
                .mockReturnValueOnce(permittedAccountId)
                .mockReturnValueOnce(restrictedUser)

            const { result } = renderHook(() => useReportChartRestrictions())

            expect(
                result.current.isModuleRestrictedToCurrentUser(
                    strictlyRestrictedNavigationUrl,
                ),
            ).toEqual(false)
        })
    })

    describe('isRouteRestrictedToCurrentUser', () => {
        beforeEach(() => {
            mockUseAppSelector
                .mockReturnValueOnce(restrictedAccountId)
                .mockReturnValueOnce(restrictedUser)
        })

        it('should return true for a restricted route', () => {
            const { result } = renderHook(() => useReportChartRestrictions())

            expect(
                result.current.isRouteRestrictedToCurrentUser(
                    `${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_AGENTS}`,
                ),
            ).toEqual(true)
        })

        it('should return false for other routes', () => {
            const { result } = renderHook(() => useReportChartRestrictions())

            expect(
                result.current.isRouteRestrictedToCurrentUser(
                    'wrong-performance-path',
                ),
            ).toEqual(false)

            expect(
                result.current.isRouteRestrictedToCurrentUser('support'),
            ).toEqual(false)
        })

        it('should return false if report id is not found', () => {
            mockUseAppSelector
                .mockReturnValueOnce(restrictedAccountId)
                .mockReturnValueOnce(restrictedUser)

            jest.replaceProperty(constants, 'RBAC_RESTRICTIONS', {
                [restrictedAccountId]: [
                    {
                        ids: ['non-existent-report'],
                        type: RestrictedComponentType.Report,
                        role: UserRole.Agent,
                    },
                ],
            } as any)

            const { result } = renderHook(() => useReportChartRestrictions())

            expect(
                result.current.isRouteRestrictedToCurrentUser(
                    STATS_ROUTES.SUPPORT_PERFORMANCE_AGENTS,
                ),
            ).toEqual(false)
        })
    })

    describe('isReportRestrictedToCurrentUser', () => {
        beforeEach(() => {
            mockUseAppSelector
                .mockReturnValueOnce(restrictedAccountId)
                .mockReturnValueOnce(restrictedUser)
        })

        it('should return true for a restricted report', () => {
            const { result } = renderHook(() => useReportChartRestrictions())

            expect(
                result.current.isReportRestrictedToCurrentUser(
                    ReportsIDs.SupportPerformanceAgentsReportConfig,
                ),
            ).toEqual(true)
        })

        it('should return false for other reports', () => {
            const { result } = renderHook(() => useReportChartRestrictions())

            expect(
                result.current.isReportRestrictedToCurrentUser(
                    ReportsIDs.CampaignsReportConfig,
                ),
            ).toEqual(false)

            expect(
                result.current.isReportRestrictedToCurrentUser(
                    ReportsIDs.AutoQAReportConfig,
                ),
            ).toEqual(false)
        })

        it('should return false if report id is not found', () => {
            mockUseAppSelector
                .mockReturnValueOnce(restrictedAccountId)
                .mockReturnValueOnce(restrictedUser)

            jest.replaceProperty(constants, 'RBAC_RESTRICTIONS', {
                [restrictedAccountId]: [
                    {
                        ids: ['non-existent-report'],
                        type: RestrictedComponentType.Report,
                        role: UserRole.Agent,
                    },
                ],
            } as any)

            const { result } = renderHook(() => useReportChartRestrictions())

            expect(
                result.current.isReportRestrictedToCurrentUser(
                    ReportsIDs.CampaignsLegacyReportConfig,
                ),
            ).toEqual(false)
        })
    })

    describe('isChartRestrictedToCurrentUser', () => {
        const nonExistentChartId = 'test-chart-id'
        const partOfRestrictedReportOnly =
            OverviewChart.TicketHandleTimeTrendCard
        const permittedChartId = HelpCenterChart.SearchesTrendCard

        it.each([
            nonExistentChartIdAndPartOfRestrictedReport,
            partOfRestrictedReportOnly,
            strictlyRestrictedChartId,
        ])('should return true for every case possible', (chartId) => {
            mockUseAppSelector
                .mockReturnValueOnce(restrictedAccountId)
                .mockReturnValueOnce(restrictedUser)

            const { result } = renderHook(() => useReportChartRestrictions())

            expect(
                result.current.isChartRestrictedToCurrentUser(chartId),
            ).toEqual(true)
        })

        it('should return false for a permitted chart', () => {
            mockUseAppSelector
                .mockReturnValueOnce(restrictedAccountId)
                .mockReturnValueOnce(restrictedUser)

            const { result } = renderHook(() => useReportChartRestrictions())

            expect(
                result.current.isChartRestrictedToCurrentUser(permittedChartId),
            ).toEqual(false)
        })

        it('should return false for a non-existent chart id', () => {
            mockUseAppSelector
                .mockReturnValueOnce(restrictedAccountId)
                .mockReturnValueOnce(restrictedUser)

            const { result } = renderHook(() => useReportChartRestrictions())
            expect(
                result.current.isChartRestrictedToCurrentUser(
                    nonExistentChartId,
                ),
            ).toEqual(false)
        })

        it.each([
            nonExistentChartIdAndPartOfRestrictedReport,
            partOfRestrictedReportOnly,
            strictlyRestrictedChartId,
            permittedChartId,
        ])('should return true if path is restricted', (chartId) => {
            useReportRestrictionsMock.mockReturnValue({
                reportRestrictionsMap: {
                    [SatisfactionReportConfig.id]: true,
                    [SupportPerformanceOverviewReportConfig.id]: true,
                    [SupportPerformanceAgentsReportConfig.id]: true,
                    [HelpCenterReportConfig.id]: true,
                },
                moduleRestrictionsMap: {},
            })

            mockUseAppSelector
                .mockReturnValueOnce(restrictedAccountId)
                .mockReturnValueOnce(restrictedUser)

            const { result } = renderHook(() => useReportChartRestrictions())

            expect(
                result.current.isChartRestrictedToCurrentUser(chartId),
            ).toEqual(true)
        })
    })
})

describe('getReportConfig', () => {
    it('should return the report config', () => {
        const reportConfig = getReportConfig(ReportsIDs.AutoQAReportConfig)
        expect(reportConfig?.reportName).toEqual(AutoQAReportConfig.reportName)
    })

    it('should return an empty object when report config is not found', () => {
        const reportConfig = getReportConfig('unknown')
        expect(reportConfig).toEqual(null)
    })
})
