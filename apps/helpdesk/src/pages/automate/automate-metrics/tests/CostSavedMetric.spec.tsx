import React from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/dom'
import { fromJS } from 'immutable'

import type { MetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import { products } from 'fixtures/plans'
import { COST_SAVED } from 'pages/automate/automate-metrics/constants'
import { CostSavedMetric } from 'pages/automate/automate-metrics/CostSavedMetric'
import { initialState } from 'state/billing/reducers'
import type { RootState } from 'state/types'

const trend: MetricTrend = {
    isFetching: false,
    isError: false,
    data: {
        value: 300,
        prevValue: 0,
    },
}

const mockState: Partial<RootState> = {
    billing: initialState.mergeDeep(
        fromJS({
            products,
        }),
    ),
    currentAccount: fromJS({
        current_subscription: {
            products: {},
        },
    }),
    integrations: fromJS({
        integrations: [],
    }),
}

describe('CostSavedMetric', () => {
    it('should render correctly', () => {
        render(<CostSavedMetric trend={trend} />, { storeState: mockState })

        expect(screen.getByText(COST_SAVED)).toBeInTheDocument()
    })

    it('should render the correct value', () => {
        render(<CostSavedMetric trend={trend} />, { storeState: mockState })

        expect(screen.getByText('$300')).toBeInTheDocument()
    })

    it('should render a loading state', () => {
        render(<CostSavedMetric trend={{ ...trend, isFetching: true }} />, {
            storeState: mockState,
        })

        expect(screen.queryByText('$300')).not.toBeInTheDocument()
    })
})
