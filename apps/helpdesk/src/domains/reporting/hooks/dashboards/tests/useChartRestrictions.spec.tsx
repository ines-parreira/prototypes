import type React from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { assumeMock, renderHook } from '@repo/testing'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { UserRole } from 'config/types/user'
import { useIsChartRestricted } from 'domains/reporting/hooks/dashboards/useReportRestrictions'
import { HelpCenterReportConfig } from 'domains/reporting/pages/help-center/components/HelpCenterReport/HelpCenterReportConfig'
import { SatisfactionReportConfig } from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionReportConfig'
import { AutoQAChart } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAReportConfig'
import { automationSubscriptionProductPrices } from 'fixtures/account'
import * as billingFixtures from 'fixtures/billing'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { initialState } from 'state/billing/reducers'
import type { RootState } from 'state/types'

const mockStore = configureMockStore<RootState>([])

jest.mock('@repo/feature-flags')
const useFlagMock = assumeMock(useFlag)

jest.mock('hooks/aiAgent/useAiAgentAccess')
const useAiAgentAccessMock = assumeMock(useAiAgentAccess)

describe('useReportRestrictions', () => {
    const defaultState = {
        billing: initialState.mergeDeep(billingFixtures.billingState),
        currentUser: fromJS({ role: { name: UserRole.Admin } }),
        currentAccount: fromJS({
            current_subscription: {
                products: automationSubscriptionProductPrices,
            },
        }),
    } as RootState

    beforeEach(() => {
        useAiAgentAccessMock.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
    })

    it('should allow unknown Chart', () => {
        const unknownChartId = 'unknownChartId'
        const { result } = renderHook(
            () => useIsChartRestricted(unknownChartId),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        {children}
                    </Provider>
                ),
            },
        )

        expect(result.current).toEqual(false)
    })

    describe('HelpCenter', () => {
        it.each(Object.keys(HelpCenterReportConfig.charts))(
            'should restrict Help Center charts when the flag is off',
            (chartId: string) => {
                const { result } = renderHook(
                    () => useIsChartRestricted(chartId),
                    {
                        wrapper: ({
                            children,
                        }: {
                            children?: React.ReactNode
                        }) => (
                            <Provider store={mockStore(defaultState)}>
                                {children}
                            </Provider>
                        ),
                    },
                )

                expect(result.current).toEqual(true)
            },
        )

        it.each(Object.keys(HelpCenterReportConfig.charts))(
            'should allow Help Center charts when the flag is on',
            (chartId: string) => {
                useFlagMock.mockImplementation((flag) => {
                    if (flag === FeatureFlagKey.HelpCenterAnalytics) return true
                    return false
                })
                const { result } = renderHook(
                    () => useIsChartRestricted(chartId),
                    {
                        wrapper: ({
                            children,
                        }: {
                            children?: React.ReactNode
                        }) => (
                            <Provider store={mockStore(defaultState)}>
                                {children}
                            </Provider>
                        ),
                    },
                )

                expect(result.current).toEqual(false)
            },
        )
    })

    describe('Satisfaction', () => {
        it.each(Object.keys(SatisfactionReportConfig.charts))(
            'should restrict Satisfaction charts when the flag is off',
            (chartId: string) => {
                const { result } = renderHook(
                    () => useIsChartRestricted(chartId),
                    {
                        wrapper: ({
                            children,
                        }: {
                            children?: React.ReactNode
                        }) => (
                            <Provider store={mockStore(defaultState)}>
                                {children}
                            </Provider>
                        ),
                    },
                )

                expect(result.current).toEqual(true)
            },
        )

        it.each(Object.keys(SatisfactionReportConfig.charts))(
            'should allow Satisfaction charts when the flag is on',
            (chartId: string) => {
                useFlagMock.mockImplementation((flag) => {
                    if (flag === FeatureFlagKey.NewSatisfactionReport)
                        return true
                    return false
                })
                const { result } = renderHook(
                    () => useIsChartRestricted(chartId),
                    {
                        wrapper: ({
                            children,
                        }: {
                            children?: React.ReactNode
                        }) => (
                            <Provider store={mockStore(defaultState)}>
                                {children}
                            </Provider>
                        ),
                    },
                )

                expect(result.current).toEqual(false)
            },
        )
    })

    describe('AutoQA', () => {
        it.each([
            UserRole.LiteAgent,
            UserRole.BasicAgent,
            UserRole.ObserverAgent,
            UserRole.Bot,
        ])(
            'should restrict AutoQA charts when the user is not a Team Lead or Admin',
            (role: UserRole) => {
                const chartId = AutoQAChart.ReviewedClosedTickets
                const state = {
                    ...defaultState,
                    currentUser: fromJS({ role: { name: role } }),
                } as RootState

                const { result } = renderHook(
                    () => useIsChartRestricted(chartId),
                    {
                        wrapper: ({
                            children,
                        }: {
                            children?: React.ReactNode
                        }) => (
                            <Provider store={mockStore(state)}>
                                {children}
                            </Provider>
                        ),
                    },
                )

                expect(result.current).toEqual(true)
            },
        )

        it.each([UserRole.Admin, UserRole.Agent])(
            'should allow AutoQA charts when the user is not a Team Lead or Admin',
            (role: UserRole) => {
                const chartId = AutoQAChart.ReviewedClosedTickets
                const state = {
                    ...defaultState,
                    currentUser: fromJS({ role: { name: role } }),
                } as RootState

                const { result } = renderHook(
                    () => useIsChartRestricted(chartId),
                    {
                        wrapper: ({
                            children,
                        }: {
                            children?: React.ReactNode
                        }) => (
                            <Provider store={mockStore(state)}>
                                {children}
                            </Provider>
                        ),
                    },
                )

                expect(result.current).toEqual(false)
            },
        )
    })
})
