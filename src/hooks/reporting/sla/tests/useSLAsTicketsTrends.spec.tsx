import React from 'react'

import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    fetchSatisfiedOrBreachedTicketsInPolicyPerStatusTrend,
    useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend,
} from 'hooks/reporting/sla/useSatisfiedOrBreachedTicketsInPolicyPerStatus'
import {
    fetchBreachedSlaTicketsTrend,
    fetchSatisfiedSlaTicketsTrend,
    useBreachedSlaTicketsTrend,
    useSatisfiedSlaTicketsTrend,
} from 'hooks/reporting/sla/useSLAsTicketsTrends'
import { TicketSLAStatus } from 'models/reporting/cubes/sla/TicketSLACube'
import { RootState, StoreDispatch } from 'state/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('hooks/reporting/sla/useSatisfiedOrBreachedTicketsInPolicyPerStatus')
const useTicketsInPolicyPerStatusTrendMock = assumeMock(
    useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend,
)
const fetchTicketsInPolicyPerStatusTrendMock = assumeMock(
    fetchSatisfiedOrBreachedTicketsInPolicyPerStatusTrend,
)

describe('SLAsTicketsTrends', () => {
    const startDate = '2021-05-01T00:00:00+02:00'
    const endDate = '2021-05-04T23:59:59+02:00'
    const filters = {
        period: {
            start_datetime: startDate,
            end_datetime: endDate,
        },
    }
    const userTimezone = 'UTC'

    describe('useSLAsTicketsTrends', () => {
        it.each([
            {
                hook: useBreachedSlaTicketsTrend,
                expectedTicketStatus: TicketSLAStatus.Breached,
            },
            {
                hook: useSatisfiedSlaTicketsTrend,
                expectedTicketStatus: TicketSLAStatus.Satisfied,
            },
        ])(
            'should call $hook.name with correct ticket status $expectedTicketStatus',
            ({ hook, expectedTicketStatus }) => {
                renderHook(() => hook(filters, userTimezone), {
                    wrapper: ({ children }) => (
                        <Provider store={mockStore({})}>{children}</Provider>
                    ),
                })

                expect(
                    useTicketsInPolicyPerStatusTrendMock,
                ).toHaveBeenCalledWith(
                    filters,
                    userTimezone,
                    undefined,
                    expectedTicketStatus,
                )
            },
        )
    })

    describe('fetchSLAsTicketsTrends', () => {
        it.each([
            {
                fetch: fetchBreachedSlaTicketsTrend,
                expectedTicketStatus: TicketSLAStatus.Breached,
            },
            {
                fetch: fetchSatisfiedSlaTicketsTrend,
                expectedTicketStatus: TicketSLAStatus.Satisfied,
            },
        ])(
            'should call $hook.name with correct ticket status $expectedTicketStatus',
            async ({ fetch, expectedTicketStatus }) => {
                await fetch(filters, userTimezone)

                expect(
                    fetchTicketsInPolicyPerStatusTrendMock,
                ).toHaveBeenCalledWith(
                    filters,
                    userTimezone,
                    undefined,
                    expectedTicketStatus,
                )
            },
        )
    })
})
