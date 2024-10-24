import {renderHook} from '@testing-library/react-hooks/dom'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {usePerformanceTips} from 'hooks/reporting/usePerformanceTips'
import useAppSelector from 'hooks/useAppSelector'
import {MetricName} from 'services/reporting/constants'
import * as tipProvider from 'services/supportPerformanceTipService'
import {RootState, StoreDispatch} from 'state/types'
import {PlanName} from 'utils/paywalls'
import {assumeMock} from 'utils/testing'

const mockStore = configureMockStore<RootState, StoreDispatch>()
jest.mock('hooks/useAppSelector')
const appSelectorMock = assumeMock(useAppSelector)

jest.mock('services/supportPerformanceTipService')

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
            wrapper: ({children}) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        expect(mock).toHaveBeenCalledWith(lowerIsBetterMetric, value, plan)
    })

    it('should call tip service with null plan when subscription missing', () => {
        appSelectorMock.mockReturnValue(undefined)

        const mock = jest.spyOn(tipProvider, 'getPerformanceTip')
        renderHook(() => usePerformanceTips(lowerIsBetterMetric, value), {
            wrapper: ({children}) => (
                <Provider store={mockStore(defaultState)}>{children}</Provider>
            ),
        })

        expect(mock).toHaveBeenCalledWith(lowerIsBetterMetric, value, null)
    })
})
