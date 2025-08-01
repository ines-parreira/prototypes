import { assumeMock } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'

import {
    ProductInsightsHeaderCellContent,
    SORTABLE_COLUMNS,
} from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductInsightsHeaderCellContent'
import { ProductInsightsTableLabels } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductInsightsTableConfig'
import { sortingSet } from 'domains/reporting/state/ui/stats/productInsightsSlice'
import { ProductInsightsTableColumns } from 'domains/reporting/state/ui/stats/types'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { OrderDirection } from 'models/api/types'
import { renderWithStore } from 'utils/testing'

jest.mock('hooks/useAppDispatch', () => jest.fn())
const mockUseAppSelector = assumeMock(useAppSelector)

jest.mock('hooks/useAppSelector', () => jest.fn())
const mockUseAppDispatch = assumeMock(useAppDispatch)
const mockDispatch = jest.fn()

describe('ProductInsightsHeaderCellContent', () => {
    const sortingQueryHook = jest.fn().mockReturnValue({
        data: { allData: [] },
        isFetching: false,
    })

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAppDispatch.mockReturnValue(mockDispatch)
        mockUseAppSelector.mockReturnValue({
            field: ProductInsightsTableColumns.Product,
            direction: OrderDirection.Desc,
            isLoading: false,
        })
    })

    it('renders without crashing', () => {
        renderWithStore(
            <table>
                <thead>
                    <tr>
                        <ProductInsightsHeaderCellContent
                            column={ProductInsightsTableColumns.Product}
                            useSortingQuery={sortingQueryHook}
                        />
                    </tr>
                </thead>
            </table>,
            {},
        )
    })

    it('displays the correct title for the column', () => {
        renderWithStore(
            <ProductInsightsHeaderCellContent
                column={ProductInsightsTableColumns.Product}
                useSortingQuery={sortingQueryHook}
            />,
            {},
        )

        expect(
            screen.getByText(
                ProductInsightsTableLabels[ProductInsightsTableColumns.Product],
            ),
        ).toBeInTheDocument()
    })

    it('dispatches setSorting action when clicked', () => {
        renderWithStore(
            <table>
                <thead>
                    <tr>
                        <ProductInsightsHeaderCellContent
                            column={ProductInsightsTableColumns.Product}
                            useSortingQuery={sortingQueryHook}
                        />
                    </tr>
                </thead>
            </table>,
            {},
        )

        fireEvent.click(
            screen.getByText(
                ProductInsightsTableLabels[ProductInsightsTableColumns.Product],
            ),
        )

        expect(mockDispatch).toHaveBeenCalledWith(
            sortingSet({
                field: ProductInsightsTableColumns.Product,
                direction: OrderDirection.Asc,
            }),
        )
    })

    it('dispatches setSorting with current direction when column changes', () => {
        mockUseAppSelector.mockReturnValue({
            field: ProductInsightsTableColumns.TicketsVolume,
            direction: OrderDirection.Desc,
            isLoading: false,
        })

        renderWithStore(
            <table>
                <thead>
                    <tr>
                        <ProductInsightsHeaderCellContent
                            column={ProductInsightsTableColumns.Product}
                            useSortingQuery={sortingQueryHook}
                        />
                    </tr>
                </thead>
            </table>,
            {},
        )

        fireEvent.click(
            screen.getByText(
                ProductInsightsTableLabels[ProductInsightsTableColumns.Product],
            ),
        )

        expect(mockDispatch).toHaveBeenCalledWith(
            sortingSet({
                field: ProductInsightsTableColumns.Product,
                direction: OrderDirection.Desc,
            }),
        )
    })

    it('should not dispatch setSorting on not sortable columns', () => {
        mockUseAppSelector.mockReturnValue({
            field: ProductInsightsTableColumns.TicketsVolume,
            direction: OrderDirection.Desc,
            isLoading: false,
        })
        const nonSortableColumn =
            ProductInsightsTableColumns.PositiveSentimentDelta

        renderWithStore(
            <table>
                <thead>
                    <tr>
                        <ProductInsightsHeaderCellContent
                            column={nonSortableColumn}
                            useSortingQuery={sortingQueryHook}
                        />
                    </tr>
                </thead>
            </table>,
            {},
        )

        fireEvent.click(
            screen.getByText(ProductInsightsTableLabels[nonSortableColumn]),
        )

        expect(SORTABLE_COLUMNS).not.toContainEqual(nonSortableColumn)
        expect(mockDispatch).not.toHaveBeenCalledWith(
            sortingSet({
                field: ProductInsightsTableColumns.Product,
                direction: OrderDirection.Desc,
            }),
        )
    })
})
