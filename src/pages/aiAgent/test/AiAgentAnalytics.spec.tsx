// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import { QueryClientProvider } from '@tanstack/react-query'
import { screen } from '@testing-library/react'
import { Provider } from 'react-redux'

import { initialState as statsInitialState } from 'state/stats/statsSlice'
import { initialState as filtersInitialState } from 'state/ui/stats/filtersSlice'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { mockStore, renderWithRouter } from 'utils/testing'

import { AiAgentAnalytics } from '../AiAgentAnalytics'

jest.mock(
    'pages/stats/automate/aiSalesAgent/components/SalesOverview',
    () => () => <div>Sales Overview</div>,
)

jest.mock('pages/stats/DefaultStatsFilters', () => ({
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
