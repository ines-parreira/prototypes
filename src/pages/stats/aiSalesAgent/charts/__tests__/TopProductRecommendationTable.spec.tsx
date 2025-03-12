import React from 'react'

import { render, screen } from '@testing-library/react'
import moment from 'moment/moment'
import { Provider } from 'react-redux'

import { ProductTableKeys } from 'pages/stats/aiSalesAgent/constants'
import { useProductRecommendations } from 'pages/stats/aiSalesAgent/metrics/useProductRecommendations'
import { RootState } from 'state/types'
import { initialState as uiFiltersInitialState } from 'state/ui/stats/filtersSlice'
import { assumeMock, mockStore } from 'utils/testing'

import TopProductRecommendationTable from '../TopProductRecommendationTable'

jest.mock('pages/stats/aiSalesAgent/metrics/useProductRecommendations')
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
                <TopProductRecommendationTable />
            </Provider>,
        )

        expect(screen.getByText('Top Products Recommended')).toBeInTheDocument()
        expect(screen.getByText('Product name')).toBeInTheDocument()
        expect(screen.getByText('# times recommended')).toBeInTheDocument()
        expect(screen.getByText('Click Rate')).toBeInTheDocument()
        expect(screen.getByText('Buy Rate')).toBeInTheDocument()
    })

    it('navigates pages correctly', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <TopProductRecommendationTable />
            </Provider>,
        )

        // Check initial state
        expect(screen.getByText('Product 20')).toBeInTheDocument()
        expect(screen.queryByText('Product 1')).not.toBeInTheDocument()

        // Navigate to next page
        screen.getByText('keyboard_arrow_right').click()
        expect(screen.getByText('Product 1')).toBeInTheDocument()
        expect(screen.queryByText('Product 20')).not.toBeInTheDocument()

        // Navigate back to previous page
        screen.getByText('keyboard_arrow_left').click()
        expect(screen.getByText('Product 20')).toBeInTheDocument()
        expect(screen.queryByText('Product 1')).not.toBeInTheDocument()
    })

    it('sorts columns correctly', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <TopProductRecommendationTable />
            </Provider>,
        )

        // Check initial state
        expect(screen.getByText('Product 20')).toBeInTheDocument()
        expect(screen.getByText('Product 19')).toBeInTheDocument()

        // Sort by CTR
        screen.getByText('Click Rate').click()
        expect(screen.getByText('Product 20')).toBeInTheDocument()
        expect(screen.getByText('Product 19')).toBeInTheDocument()

        // Sort by Number of Recommendations
        screen.getByText('# times recommended').click()
        expect(screen.getByText('Product 1')).toBeInTheDocument()
        expect(screen.getByText('Product 2')).toBeInTheDocument()

        // Sort by BTR
        screen.getByText('Buy Rate').click()
        expect(screen.getByText('Product 1')).toBeInTheDocument()
        expect(screen.getByText('Product 2')).toBeInTheDocument()
        screen.getByText('Buy Rate').click()
        expect(screen.getByText('Product 20')).toBeInTheDocument()
        expect(screen.getByText('Product 19')).toBeInTheDocument()
    })
})
