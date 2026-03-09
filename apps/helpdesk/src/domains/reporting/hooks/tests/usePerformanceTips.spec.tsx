import React from 'react'

import { PlanName } from '@repo/billing-utils'
import { assumeMock, renderHook } from '@repo/testing'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { usePerformanceTips } from 'domains/reporting/hooks/usePerformanceTips'
import { MetricName } from 'domains/reporting/services/constants'
import * as tipProvider from 'domains/reporting/services/supportPerformanceTipService'
import useAppSelector from 'hooks/useAppSelector'
import type { RootState, StoreDispatch } from 'state/types'

const mockStore = configureMockStore<RootState, StoreDispatch>()
jest.mock('hooks/useAppSelector')
const appSelectorMock = assumeMock(useAppSelector)

jest.mock('domains/reporting/services/supportPerformanceTipService')

describe('usePerformanceTips', () => {
    const defaultState = {} as RootState
    const plan = PlanName.Advanced
    const lowerIsBetterMetric = MetricName.MessagesPerTicket
    const value = 5

    beforeEach(() => {
        appSelectorMock.mockReturnValue({
            name: plan,
        })
    })

    it('should use planName from state and tipProvider', () => {
        const mock = jest.spyOn(tipProvider, 'getPerformanceTip')
        renderHook(() => usePerformanceTips(lowerIsBetterMetric, value), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        expect(mock).toHaveBeenCalledWith(lowerIsBetterMetric, value, plan)
    })

    it('should call tip service with null plan when subscription missing', () => {
        appSelectorMock.mockReturnValue(undefined)

        const mock = jest.spyOn(tipProvider, 'getPerformanceTip')
        renderHook(() => usePerformanceTips(lowerIsBetterMetric, value), {
            wrapper: ({ children }) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        expect(mock).toHaveBeenCalledWith(lowerIsBetterMetric, value, null)
    })
})
