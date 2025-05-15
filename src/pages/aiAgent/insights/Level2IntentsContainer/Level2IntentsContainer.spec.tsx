// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { toImmutable } from 'common/utils'
import { account } from 'fixtures/account'
import { OPTIMIZE } from 'pages/aiAgent/constants'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore, renderWithRouter } from 'utils/testing'

import { Level2IntentsContainer } from './Level2IntentsContainer'

jest.mock('pages/aiAgent/hooks/useAiAgentEnabled', () => ({
    useAiAgentEnabled: jest.fn().mockReturnValue(true),
}))

jest.mock('pages/stats/common/drill-down/DrillDownModal', () => ({
    DrillDownModal: jest.fn(() => <></>),
}))

jest.mock(
    'pages/aiAgent/insights/widgets/AdjustedPeriodFilter/AdjustedPeriodFilter',
    () => ({
        AdjustedPeriodFilter: jest.fn(() => <></>),
    }),
)

jest.mock('../Level2IntentsPerformance/Level2IntentsPerformance', () => ({
    Level2IntentsPerformance: jest.fn(() => <></>),
}))

jest.mock('pages/aiAgent/insights/IntentTableWidget/IntentTableWidget', () => ({
    IntentTableWidget: jest.fn(() => <></>),
}))

jest.mock('pages/aiAgent/hooks/useAccountStoreConfiguration', () => ({
    useAccountStoreConfiguration: jest.fn(() => ({
        aiAgentTicketViewId: 1,
    })),
}))
const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush,
    }),
}))

const SHOP_NAME = 'shopify-store'
const SHOP_TYPE = 'shopify'

const defaultStore = mockStore({
    currentAccount: fromJS({
        ...account,
    }),
    billing: toImmutable({
        products: [],
    }),
    integrations: toImmutable({
        integrations: [],
    }),
})

const renderComponent = () =>
    renderWithRouter(
        <Provider store={defaultStore}>
            <QueryClientProvider client={mockQueryClient()}>
                <Level2IntentsContainer />
            </QueryClientProvider>
        </Provider>,
        {
            path: `/:shopType/:shopName/ai-agent/optimize/intentId`,
            route: `/${SHOP_TYPE}/${SHOP_NAME}/ai-agent/optimize/intentId`,
        },
    )

describe('Level2IntentsContainer', () => {
    it('renders the component', () => {
        renderComponent()

        expect(
            screen.getByText('Back to AI Agent performance'),
        ).toBeInTheDocument()
        expect(screen.getAllByText(OPTIMIZE).length).toBeGreaterThan(0)
    })

    it('calls history.push with the correct route on BackLink click', () => {
        renderComponent()

        const backLink = screen.getByText('Back to AI Agent performance')
        fireEvent.click(backLink)

        expect(mockHistoryPush).toHaveBeenCalledWith(
            `/app/ai-agent/${SHOP_TYPE}/${SHOP_NAME}/optimize`,
        )
    })
})
