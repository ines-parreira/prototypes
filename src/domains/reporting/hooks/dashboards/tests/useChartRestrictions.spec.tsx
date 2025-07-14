import React from 'react'

import { fromJS } from 'immutable'
import { mockFlags } from 'jest-launchdarkly-mock'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { FeatureFlagKey } from 'config/featureFlags'
import { UserRole } from 'config/types/user'
import { useIsChartRestricted } from 'domains/reporting/hooks/dashboards/useReportRestrictions'
import { HelpCenterReportConfig } from 'domains/reporting/pages/help-center/components/HelpCenterReport/HelpCenterReportConfig'
import { SatisfactionReportConfig } from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionReportConfig'
import { AutoQAChart } from 'domains/reporting/pages/support-performance/auto-qa/AutoQAReportConfig'
import { automationSubscriptionProductPrices } from 'fixtures/account'
import * as billingFixtures from 'fixtures/billing'
import { initialState } from 'state/billing/reducers'
import { RootState } from 'state/types'
import { renderHook } from 'utils/testing/renderHook'

const mockStore = configureMockStore<RootState>([])

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
                mockFlags({
                    [FeatureFlagKey.HelpCenterAnalytics]: true,
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
                mockFlags({
                    [FeatureFlagKey.NewSatisfactionReport]: true,
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
