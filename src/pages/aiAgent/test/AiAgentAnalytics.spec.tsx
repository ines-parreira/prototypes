// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { Provider } from 'react-redux'

import { toImmutable } from 'common/utils'
import { initialState as statsInitialState } from 'domains/reporting/state/stats/statsSlice'
import { initialState as filtersInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore, renderWithRouter } from 'utils/testing'

import { AiAgentAnalytics } from '../AiAgentAnalytics'

jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/components/SalesOverview',
    () => () => <div>Sales Overview</div>,
)

jest.mock('domains/reporting/pages/DefaultStatsFilters', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

const queryClient = mockQueryClient()

const renderComponent = () =>
    renderWithRouter(
        <Provider
            store={mockStore({
                stats: {
                    filters: statsInitialState.filters,
                },
                ui: {
                    stats: {
                        drillDown: {
                            isOpen: false,
                        },
                        filters: filtersInitialState,
                    },
                },
                integrations: toImmutable({
                    integrations: [],
                }),
                billing: toImmutable({
                    products: [],
                }),
            })}
        >
            <QueryClientProvider client={queryClient}>
                <AiAgentAnalytics />
            </QueryClientProvider>
        </Provider>,
    )

describe('<AiAgentAnalytics />', () => {
    it('should render the analytics', () => {
        renderComponent()
        expect(screen.getByText('Sales Overview')).toBeInTheDocument()
    })
})
