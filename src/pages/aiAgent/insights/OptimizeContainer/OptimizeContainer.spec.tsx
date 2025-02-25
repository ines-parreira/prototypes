import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fromJS } from 'immutable'
import moment, { Moment } from 'moment/moment'
import { Provider } from 'react-redux'

import { account } from 'fixtures/account'
import { PeriodFilter } from 'pages/stats/common/filters/PeriodFilter'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore, renderWithRouter } from 'utils/testing'

import { IntentTableWidget } from '../IntentTableWidget/IntentTableWidget'
import { Level1IntentsPerformance } from '../widgets/Level1IntentsPerformance/Level1IntentsPerformance'
import {
    OptimizeContainer,
    subtractsPeriodWithoutData,
    subtractsPeriodWithoutDataIfNeeded,
} from './OptimizeContainer'

jest.mock('pages/stats/common/filters/PeriodFilter', () => ({
    PeriodFilter: jest.fn(() => <></>),
}))

jest.mock('../IntentTableWidget/IntentTableWidget', () => ({
    IntentTableWidget: jest.fn(() => <></>),
}))

jest.mock(
    '../widgets/Level1IntentsPerformance/Level1IntentsPerformance',
    () => ({
        Level1IntentsPerformance: jest.fn(() => <></>),
    }),
)

jest.mock('pages/aiAgent/hooks/useAiAgentEnabled', () => ({
    useAiAgentEnabled: jest.fn().mockReturnValue(true),
}))

jest.mock('pages/aiAgent/insights/IntentTableWidget/IntentTableWidget', () => ({
    IntentTableWidget: jest.fn(() => <div>IntentTableWidget</div>),
}))

jest.mock('pages/stats/DrillDownModal', () => ({
    DrillDownModal: jest.fn(() => <></>),
}))

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
    currentAccount: fromJS({
        ...account,
    }),
    stats: {
        filters: {
            period: {
                start_datetime: null,
                end_datetime: null,
            },
        },
    },
}
const SHOP_NAME = 'shopify-store'
const SHOP_TYPE = 'shopify'

const renderComponent = () => {
    jest.useFakeTimers().setSystemTime(new Date('2024-12-20T00:00:00Z'))

    renderWithRouter(
        <Provider store={mockStore(defaultStore)}>
            <QueryClientProvider client={mockQueryClient()}>
                <OptimizeContainer />
            </QueryClientProvider>
        </Provider>,
        {
            path: `/:shopType/:shopName/ai-agent/optimize`,
            route: `/${SHOP_TYPE}/${SHOP_NAME}/ai-agent/optimize`,
        },
    )
}

describe('OptimizeContainer', () => {
    it('renders the component correctly', () => {
        renderComponent()

        expect(PeriodFilter).toHaveBeenCalled()
        expect(Level1IntentsPerformance).toHaveBeenCalled()
        expect(IntentTableWidget).toHaveBeenCalled()
    })

    it('passes correct props to PeriodFilter', () => {
        renderComponent()

        const mockedPeriodFilter = jest.mocked(PeriodFilter)

        expect(mockedPeriodFilter).toHaveBeenCalledWith(
            expect.objectContaining({
                value: {
                    start_datetime: null,
                    end_datetime: null,
                },
                initialSettings: {
                    maxDate: expect.any(Object),
                },
                tooltipMessageForPreviousPeriod:
                    'There is no data available on this date yet.',
                initialV2Props: {
                    dateRanges: expect.any(Object),
                },
            }),
            {},
        )
    })

    describe('subtractsPeriodWithoutData', () => {
        it('should subtract 72 hours from the given moment date', () => {
            const inputDate: Moment = moment('2024-01-01T12:00:00.000Z')
            const expectedDate: Moment = moment('2023-12-29T12:00:00.000Z') // Subtract 72 hours

            const result = subtractsPeriodWithoutData(inputDate)

            expect(result.isSame(expectedDate)).toBe(true)
        })
    })

    describe('subtractsPeriodWithoutDataIfNeeded', () => {
        it('should subtract 72 hours if the date is after the threshold', () => {
            const inputDate: Moment = moment('2024-12-27T12:00:00.000Z')
            const expectedDate: Moment = moment('2024-12-24T12:00:00.000Z') // Subtract 72 hours

            const result = subtractsPeriodWithoutDataIfNeeded(inputDate)

            expect(result.isSame(expectedDate)).toBe(true)
        })

        it('should return the same date if the date is before the threshold', () => {
            const inputDate: Moment = moment('2023-12-28T12:00:00.000Z') // Before the threshold (72 hours before current time)

            const result = subtractsPeriodWithoutDataIfNeeded(inputDate)

            expect(result.isSame(inputDate)).toBe(true)
        })
    })
})
