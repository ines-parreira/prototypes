import { screen } from '@testing-library/dom'
import { fromJS } from 'immutable'

import { UserRole } from 'config/types/user'
import { ProductInsightsEditColumns } from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsEditColumns'
import { ProductInsightsTable } from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsTable'
import {
    PRODUCT_INSIGHTS_TABLE_TITLE,
    ProductInsightsTableChart,
} from 'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsTableChart'
import { RootState } from 'state/types'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock(
    'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsEditColumns',
)
jest.mock(
    'pages/stats/voice-of-customer/product-insights/components/ProductInsightsTableChart/ProductInsightsTable',
)

const ProductInsightsEditColumnsMock = assumeMock(ProductInsightsEditColumns)
const ProductInsightsTableMock = assumeMock(ProductInsightsTable)

describe('ProductInsightsTableChart', () => {
    const mockAdminUser = {
        role: { name: UserRole.Admin },
    }

    const mockNonAdminUser = {
        role: { name: UserRole.Agent },
    }

    beforeEach(() => {
        ProductInsightsEditColumnsMock.mockImplementation(() => (
            <div>Edit Columns</div>
        ))
        ProductInsightsTableMock.mockImplementation(() => <div>Table</div>)
    })

    it('should render the chart card with title', () => {
        const state: Partial<RootState> = {
            currentUser: fromJS(mockNonAdminUser),
        }

        renderWithStore(<ProductInsightsTableChart />, state)

        expect(
            screen.getByText(PRODUCT_INSIGHTS_TABLE_TITLE),
        ).toBeInTheDocument()
    })

    it('should render edit columns for admin users', () => {
        const state: Partial<RootState> = {
            currentUser: fromJS(mockAdminUser),
        }

        renderWithStore(<ProductInsightsTableChart />, state)

        expect(ProductInsightsEditColumnsMock).toHaveBeenCalled()
    })

    it('should not render edit columns for non-admin users', () => {
        const state: Partial<RootState> = {
            currentUser: fromJS(mockNonAdminUser),
        }

        renderWithStore(<ProductInsightsTableChart />, state)

        expect(ProductInsightsEditColumnsMock).not.toHaveBeenCalled()
    })

    it('should render the product insights table', () => {
        const state: Partial<RootState> = {
            currentUser: fromJS(mockNonAdminUser),
        }

        renderWithStore(<ProductInsightsTableChart />, state)

        expect(ProductInsightsTableMock).toHaveBeenCalled()
    })
})
