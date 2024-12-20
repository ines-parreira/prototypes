import {QueryClientProvider} from '@tanstack/react-query'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'

import {account} from 'fixtures/account'

import {PeriodFilter} from 'pages/stats/common/filters/PeriodFilter'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {mockStore, renderWithRouter} from 'utils/testing'

import {IntentTableWidget} from '../IntentTableWidget/IntentTableWidget'
import {Level1IntentsPerformance} from '../widgets/Level1IntentsPerformance/Level1IntentsPerformance'
import {OptimizeContainer} from './OptimizeContainer'

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
    })
)

jest.mock('pages/automate/aiAgent/hooks/useAiAgentEnabled', () => ({
    useAiAgentEnabled: jest.fn().mockReturnValue(true),
}))

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
        }
    )
}

describe('OptimizeContainer', () => {
    it('renders the component correctly', () => {
        renderComponent()

        expect(PeriodFilter).toHaveBeenCalled()
        expect(Level1IntentsPerformance).toHaveBeenCalled()
        expect(IntentTableWidget).toHaveBeenCalled()
    })
})
