import {renderHook} from '@testing-library/react-hooks'
import {fromJS} from 'immutable'

import {UserRole} from 'config/types/user'
import {useReportRestrictions} from 'hooks/reporting/custom-reports/useReportRestrictions'
import useAppSelector from 'hooks/useAppSelector'
import {STATS_ROUTE_PREFIX} from 'pages/stats/common/components/constants'
import {getReportConfig} from 'pages/stats/custom-reports/config'
import {ReportsIDs} from 'pages/stats/custom-reports/constants'
import {HelpCenterChart} from 'pages/stats/help-center/components/HelpCenterReport/HelpCenterReportConfig'
import {SatisfactionChart} from 'pages/stats/quality-management/satisfaction/SatisfactionReportConfig'
import * as constants from 'pages/stats/report-chart-restrictions/config'
import {
    RestrictedComponentType,
    RestrictionsPerCustomer,
} from 'pages/stats/report-chart-restrictions/config'
import {
    getAccountRestrictions,
    getUserChartsRestrictions,
    getUserReportsRestrictions,
    useReportChartRestrictions,
} from 'pages/stats/report-chart-restrictions/useReportChartRestrictions'
import {AutoQAReportConfig} from 'pages/stats/support-performance/auto-qa/AutoQAReportConfig'
import {OverviewChart} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewReportConfig'
import {STATS_ROUTES} from 'routes/constants'
import {assumeMock} from 'utils/testing'

jest.mock('state/currentAccount/selectors')
jest.mock('state/currentUser/selectors')
jest.mock('hooks/useAppSelector')
const mockUseAppSelector = assumeMock(useAppSelector)
jest.mock('hooks/reporting/custom-reports/useReportRestrictions')
const useReportRestrictionsMock = assumeMock(useReportRestrictions)
jest.mock('pages/stats/report-chart-restrictions/config')

const permittedAccountId = 1
const restrictedAccountId = 123
const nonExistentChartIdAndPartOfRestrictedReport =
    OverviewChart.MedianResolutionTimeTrendCard
const strictlyRestrictedChartId = SatisfactionChart.SatisfactionScoreTrendCard

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
    ],
}

const currentConfig = RBAC_RESTRICTIONS_MOCK[restrictedAccountId]
const permittedUser = fromJS({
    id: permittedAccountId,
    name: 'John Doe',
    role: {name: UserRole.Admin},
})
const restrictedUser = fromJS({
    id: restrictedAccountId,
    name: 'John Doe',
    role: {name: UserRole.LiteAgent},
})

describe('getAccountRestrictions', () => {
    beforeEach(() => {
        jest.replaceProperty(
            constants,
            'RBAC_RESTRICTIONS',
            RBAC_RESTRICTIONS_MOCK as any
        )
    })

    it('should return an empty list for a permitted account', () => {
        expect(getAccountRestrictions(permittedAccountId)).toEqual([])
    })

    it('should return a configuration list for a restricted account', () => {
        expect(getAccountRestrictions(restrictedAccountId)).toEqual(
            RBAC_RESTRICTIONS_MOCK[restrictedAccountId]
        )
    })
})

describe('getUserReportsRestrictions', () => {
    beforeEach(() => {
        jest.replaceProperty(
            constants,
            'RBAC_RESTRICTIONS',
            RBAC_RESTRICTIONS_MOCK as any
        )
    })

    it('should return an empty list for a permitted account', () => {
        expect(
            getUserReportsRestrictions(
                permittedUser,
                getAccountRestrictions(permittedAccountId)
            )
        ).toEqual([])
    })

    it('should return a configuration list for a restricted account', () => {
        expect(
            getUserReportsRestrictions(
                restrictedUser,
                getAccountRestrictions(restrictedAccountId)
            )
        ).toEqual([currentConfig[1], currentConfig[2]])
    })
})

describe('getUserChartsRestrictions', () => {
    beforeEach(() => {
        jest.replaceProperty(
            constants,
            'RBAC_RESTRICTIONS',
            RBAC_RESTRICTIONS_MOCK as any
        )
    })

    it('should return an empty list for a permitted account', () => {
        expect(
            getUserChartsRestrictions(
                permittedUser,
                getAccountRestrictions(permittedAccountId)
            )
        ).toEqual([])
    })

    it('should return a configuration list for a restricted account', () => {
        expect(
            getUserChartsRestrictions(
                restrictedUser,
                getAccountRestrictions(restrictedAccountId)
            )
        ).toEqual([currentConfig[0], currentConfig[3]])
    })
})

describe('useReportChartRestrictions', () => {
    beforeEach(() => {
        jest.replaceProperty(
            constants,
            'RBAC_RESTRICTIONS',
            RBAC_RESTRICTIONS_MOCK as any
        )
        useReportRestrictionsMock.mockReturnValue({restrictionsMap: {}})
    })

    describe('isRouteRestrictedToCurrentUser', () => {
        beforeEach(() => {
            mockUseAppSelector
                .mockReturnValueOnce(restrictedAccountId)
                .mockReturnValueOnce(restrictedUser)
        })

        it('should return true for a restricted route', () => {
            const {result} = renderHook(() => useReportChartRestrictions())

            expect(
                result.current.isRouteRestrictedToCurrentUser(
                    `${STATS_ROUTE_PREFIX}${STATS_ROUTES.SUPPORT_PERFORMANCE_AGENTS}`
                )
            ).toEqual(true)
        })

        it('should return false for other routes', () => {
            const {result} = renderHook(() => useReportChartRestrictions())

            expect(
                result.current.isRouteRestrictedToCurrentUser(
                    'wrong-performance-path'
                )
            ).toEqual(false)

            expect(
                result.current.isRouteRestrictedToCurrentUser('support')
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

            const {result} = renderHook(() => useReportChartRestrictions())

            expect(
                result.current.isRouteRestrictedToCurrentUser(
                    STATS_ROUTES.SUPPORT_PERFORMANCE_AGENTS,
                    true
                )
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

            const {result} = renderHook(() => useReportChartRestrictions())

            expect(
                result.current.isChartRestrictedToCurrentUser(chartId)
            ).toEqual(true)
        })

        it('should return false for a permitted chart', () => {
            mockUseAppSelector
                .mockReturnValueOnce(restrictedAccountId)
                .mockReturnValueOnce(restrictedUser)

            const {result} = renderHook(() => useReportChartRestrictions())

            expect(
                result.current.isChartRestrictedToCurrentUser(permittedChartId)
            ).toEqual(false)
        })

        it('should return false for a non-existent chart id', () => {
            mockUseAppSelector
                .mockReturnValueOnce(restrictedAccountId)
                .mockReturnValueOnce(restrictedUser)

            const {result} = renderHook(() => useReportChartRestrictions())
            expect(
                result.current.isChartRestrictedToCurrentUser(
                    nonExistentChartId
                )
            ).toEqual(false)
        })

        it.each([
            nonExistentChartIdAndPartOfRestrictedReport,
            partOfRestrictedReportOnly,
            strictlyRestrictedChartId,
            permittedChartId,
        ])('should return true if path is restricted', (chartId) => {
            useReportRestrictionsMock.mockReturnValue({
                restrictionsMap: {
                    ['quality-management-satisfaction']: true,
                    [STATS_ROUTES.SUPPORT_PERFORMANCE_OVERVIEW]: true,
                    [STATS_ROUTES.SUPPORT_PERFORMANCE_AGENTS]: true,
                },
            })

            mockUseAppSelector
                .mockReturnValueOnce(restrictedAccountId)
                .mockReturnValueOnce(restrictedUser)

            const {result} = renderHook(() => useReportChartRestrictions())

            expect(
                result.current.isChartRestrictedToCurrentUser(chartId)
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
