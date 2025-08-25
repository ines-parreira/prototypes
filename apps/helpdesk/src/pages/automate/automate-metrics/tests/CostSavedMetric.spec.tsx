import React from 'react'

import { screen } from '@testing-library/dom'
import { fromJS } from 'immutable'

import { MetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import { products } from 'fixtures/productPrices'
import { COST_SAVED } from 'pages/automate/automate-metrics/constants'
import { CostSavedMetric } from 'pages/automate/automate-metrics/CostSavedMetric'
import { initialState } from 'state/billing/reducers'
import { RootState } from 'state/types'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

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
        renderWithStoreAndQueryClientProvider(
            <CostSavedMetric trend={trend} />,
            mockState,
        )

        expect(screen.getByText(COST_SAVED)).toBeInTheDocument()
    })

    it('should render the correct value', () => {
        renderWithStoreAndQueryClientProvider(
            <CostSavedMetric trend={trend} />,
            mockState,
        )

        expect(screen.getByText('$300')).toBeInTheDocument()
    })

    it('should render a loading state', () => {
        renderWithStoreAndQueryClientProvider(
            <CostSavedMetric trend={{ ...trend, isFetching: true }} />,
            mockState,
        )

        expect(screen.queryByText('$300')).not.toBeInTheDocument()
    })
})
