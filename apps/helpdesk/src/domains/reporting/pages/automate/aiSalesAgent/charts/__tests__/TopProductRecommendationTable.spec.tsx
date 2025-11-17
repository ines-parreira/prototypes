import { assumeMock } from '@repo/testing'
import { render, screen, waitFor } from '@testing-library/react'
import moment from 'moment/moment'
import { Provider } from 'react-redux'

import TopProductRecommendationTable from 'domains/reporting/pages/automate/aiSalesAgent/charts/TopProductRecommendationTable'
import { WarningBannerProvider } from 'domains/reporting/pages/automate/aiSalesAgent/components/WarningBannerProvider'
import { ProductTableKeys } from 'domains/reporting/pages/automate/aiSalesAgent/constants'
import { useProductRecommendations } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useProductRecommendations'
import { initialState as uiFiltersInitialState } from 'domains/reporting/state/ui/stats/filtersSlice'
import type { RootState } from 'state/types'
import { mockStore } from 'utils/testing'

jest.mock(
    'domains/reporting/pages/automate/aiSalesAgent/metrics/useProductRecommendations',
)
const useProductRecommendationsMock = assumeMock(useProductRecommendations)

describe('<TopProductRecommendationTable />', () => {
    const defaultState = {
        stats: {
            filters: {
                period: {
                    end_datetime: moment().toISOString(),
                    start_datetime: moment().toISOString(),
                },
            },
        },
        ui: {
            stats: { filters: uiFiltersInitialState },
        },
    } as RootState

    beforeAll(() => {
        useProductRecommendationsMock.mockReturnValue({
            isError: false,
            isFetching: false,
            data: Array.from({ length: 20 }, (_, index) => ({
                product: {
                    id: index + 1,
                    title: `Product ${index + 1}`,
                    handle: `product-${index + 1}`,
                    image: null,
                    created_at: new Date().toISOString(),
                    variants: [],
                    images: [],
                    options: [],
                },
                metrics: {
                    [ProductTableKeys.NumberOfRecommendations]: index,
                    [ProductTableKeys.CTR]: (100 - index) / 100,
                    [ProductTableKeys.BTR]: (index + 1) / 100,
                },
            })),
        })
    })

    it('renders', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <WarningBannerProvider isBannerVisible={false}>
                    <TopProductRecommendationTable />
                </WarningBannerProvider>
            </Provider>,
        )

        expect(screen.getByText('Top products recommended')).toBeInTheDocument()
        expect(screen.getByText('Product name')).toBeInTheDocument()
        expect(screen.getByText('Times recommended')).toBeInTheDocument()
        expect(screen.getByText('Click rate')).toBeInTheDocument()
        expect(screen.getByText('Buy rate')).toBeInTheDocument()
    })

    it('does not render data if banner is visible', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <WarningBannerProvider isBannerVisible>
                    <TopProductRecommendationTable />
                </WarningBannerProvider>
            </Provider>,
        )

        expect(screen.getByText('No data available')).toBeInTheDocument()
    })

    it('navigates pages correctly', async () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <WarningBannerProvider isBannerVisible={false}>
                    <TopProductRecommendationTable />
                </WarningBannerProvider>
            </Provider>,
        )

        // Check initial state
        expect(screen.getByText('Product 20')).toBeInTheDocument()
        expect(screen.queryByText('Product 1')).not.toBeInTheDocument()

        // Navigate to next page
        screen.getByText('keyboard_arrow_right').click()

        await waitFor(() => {
            expect(screen.getByText('Product 1')).toBeInTheDocument()
            expect(screen.queryByText('Product 20')).not.toBeInTheDocument()
        })

        // Navigate back to previous page
        screen.getByText('keyboard_arrow_left').click()

        await waitFor(() => {
            expect(screen.getByText('Product 20')).toBeInTheDocument()
            expect(screen.queryByText('Product 1')).not.toBeInTheDocument()
        })
    })

    it('sorts columns correctly', async () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <WarningBannerProvider isBannerVisible={false}>
                    <TopProductRecommendationTable />
                </WarningBannerProvider>
            </Provider>,
        )

        // Check initial state
        expect(screen.getByText('Product 20')).toBeInTheDocument()
        expect(screen.getByText('Product 19')).toBeInTheDocument()

        // Sort by CTR
        screen.getByText('Click rate').click()

        await waitFor(() => {
            expect(screen.getByText('Product 20')).toBeInTheDocument()
            expect(screen.getByText('Product 19')).toBeInTheDocument()
        })

        // Sort by Number of Recommendations
        screen.getByText('Times recommended').click()

        await waitFor(() => {
            expect(screen.getByText('Product 1')).toBeInTheDocument()
            expect(screen.getByText('Product 2')).toBeInTheDocument()
        })

        // Sort by BTR
        screen.getByText('Buy rate').click()

        await waitFor(() => {
            expect(screen.getByText('Product 1')).toBeInTheDocument()
            expect(screen.getByText('Product 2')).toBeInTheDocument()
        })

        screen.getByText('Buy rate').click()

        await waitFor(() => {
            expect(screen.getByText('Product 20')).toBeInTheDocument()
            expect(screen.getByText('Product 19')).toBeInTheDocument()
        })
    })
})
