import {QueryClientProvider} from '@tanstack/react-query'
import {screen} from '@testing-library/react'
import moment from 'moment'
import React from 'react'
import {Provider} from 'react-redux'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock, mockStore, renderWithRouter} from 'utils/testing'

import {
    AdjustedPeriodFilter,
    subtractsPeriodWithoutData,
    subtractsPeriodWithoutDataIfNeeded,
} from './AdjustedPeriodFilter'

jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('pages/stats/common/filters/PeriodFilter', () => ({
    PeriodFilter: jest.fn(() => <>Date</>),
}))

const useAppSelectorMock = assumeMock(useAppSelector)

jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = assumeMock(useAppDispatch)
const dispatchMock = jest.fn()
useAppDispatchMock.mockReturnValue(dispatchMock)

const SHOP_NAME = 'shopify-store'
const SHOP_TYPE = 'shopify'

jest.mock('moment', () => {
    const actualMoment = jest.requireActual<typeof moment>('moment')
    return jest.fn((params) => {
        if (params) {
            return actualMoment(params)
        }

        return actualMoment('2024-01-01T12:00:00.000Z')
    })
})

const defaultStore = {
    stats: {
        filters: {
            period: {
                start_datetime: null,
                end_datetime: null,
            },
        },
    },
}

const renderComponent = () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-12-20T00:00:00Z'))

    renderWithRouter(
        <Provider store={mockStore(defaultStore)}>
            <QueryClientProvider client={mockQueryClient()}>
                <AdjustedPeriodFilter />
            </QueryClientProvider>
        </Provider>,
        {
            path: `/:shopType/:shopName/ai-agent/optimize`,
            route: `/${SHOP_TYPE}/${SHOP_NAME}/ai-agent/optimize`,
        }
    )
}

describe('subtractsPeriodWithoutData', () => {
    it('should subtract 72 hours from the given date', () => {
        const date = moment('2025-01-01T00:00:00Z')
        const result = subtractsPeriodWithoutData(date)
        expect(result.toISOString()).toBe('2024-12-29T00:00:00.000Z')
    })
})

describe('subtractsPeriodWithoutDataIfNeeded', () => {
    it('should subtract 72 hours if the date is within the last 72 hours', () => {
        const recentDate = moment().subtract(48, 'hours')
        const result = subtractsPeriodWithoutDataIfNeeded(recentDate.clone())
        expect(result.toISOString()).toBe(
            recentDate.subtract(72, 'hours').toISOString()
        )
    })

    it('should not subtract if the date is beyond the last 72 hours', () => {
        const oldDate = moment().subtract(100, 'hours')
        const result = subtractsPeriodWithoutDataIfNeeded(oldDate.clone())
        expect(result.toISOString()).toBe(oldDate.toISOString())
    })
})

describe('AdjustedPeriodFilter Component', () => {
    it('should render the PeriodFilter when isPeriodFilterSet is true', () => {
        useAppSelectorMock.mockReturnValue({
            period: {
                start_datetime: '2024-12-13T00:00:00Z',
                end_datetime: '2024-12-20T00:00:00Z',
            },
        })

        renderComponent()

        expect(screen.getByText('Date')).toBeInTheDocument()
    })

    it('should call dispatch inside useEffectOnce', () => {
        useAppSelectorMock.mockReturnValue({
            period: {
                start_datetime: '1970-01-01T00:00:00+00:00',
                end_datetime: '1970-01-01T00:00:00+00:00',
            },
        })
        renderComponent()

        expect(useAppDispatchMock).toHaveBeenCalledTimes(2)
    })
})
