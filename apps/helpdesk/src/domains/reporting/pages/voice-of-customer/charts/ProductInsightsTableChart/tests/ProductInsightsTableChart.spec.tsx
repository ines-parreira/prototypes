import { assumeMock } from '@repo/testing'
import { screen } from '@testing-library/dom'
import { fromJS } from 'immutable'

import { UserRole } from 'config/types/user'
import {
    PRODUCT_INSIGHTS_TABLE_TITLE,
    ProductInsightsTableChart,
} from 'domains/reporting/pages/voice-of-customer/charts/ProductInsightsTableChart/ProductInsightsTableChart'
import { ProductInsightsEditColumns } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductInsightsEditColumns'
import { ProductInsightsTable } from 'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductInsightsTable'
import {
    TICKET_FIELD_ID_NOT_AVAILABLE,
    useGetCustomTicketsFieldsDefinitionData,
} from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import type { RootState } from 'state/types'
import { renderWithStore } from 'utils/testing'

jest.mock(
    'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductInsightsEditColumns',
)
const ProductInsightsEditColumnsMock = assumeMock(ProductInsightsEditColumns)
jest.mock(
    'domains/reporting/pages/voice-of-customer/components/ProductInsightsTable/ProductInsightsTable',
)
const ProductInsightsTableMock = assumeMock(ProductInsightsTable)
jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
)
const useGetCustomTicketsFieldsDefinitionDataMock = assumeMock(
    useGetCustomTicketsFieldsDefinitionData,
)

describe('ProductInsightsTableChart', () => {
    const mockAdminUser = {
        role: { name: UserRole.Admin },
    }

    const mockNonAdminUser = {
        role: { name: UserRole.Agent },
    }

    beforeEach(() => {
        useGetCustomTicketsFieldsDefinitionDataMock.mockReturnValue({
            sentimentCustomFieldId: 123,
            intentCustomFieldId: 456,
            outcomeCustomFieldId: 789,
            isLoading: false,
        })
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

    it('should not render the product insights table if intentCustomField is missing', () => {
        const state: Partial<RootState> = {
            currentUser: fromJS(mockNonAdminUser),
        }
        useGetCustomTicketsFieldsDefinitionDataMock.mockReturnValue({
            sentimentCustomFieldId: 123,
            intentCustomFieldId: TICKET_FIELD_ID_NOT_AVAILABLE,
            outcomeCustomFieldId: 789,
            isLoading: false,
        })

        renderWithStore(<ProductInsightsTableChart />, state)

        expect(ProductInsightsTableMock).not.toHaveBeenCalled()
    })

    it('should not render the product insights table if sentimentCustomFieldId is missing', () => {
        const state: Partial<RootState> = {
            currentUser: fromJS(mockNonAdminUser),
        }
        useGetCustomTicketsFieldsDefinitionDataMock.mockReturnValue({
            sentimentCustomFieldId: null,
            intentCustomFieldId: 123,
            outcomeCustomFieldId: 789,
            isLoading: false,
        })

        renderWithStore(<ProductInsightsTableChart />, state)

        expect(ProductInsightsTableMock).not.toHaveBeenCalled()
    })
})
