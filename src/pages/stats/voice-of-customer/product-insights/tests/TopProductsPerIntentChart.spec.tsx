import { render, screen } from '@testing-library/react'

import {
    TICKET_FIELD_ID_NOT_AVAILABLE,
    useGetCustomTicketsFieldsDefinitionData,
} from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { NO_DATA_AVAILABLE_COMPONENT_TEXT } from 'pages/stats/common/components/NoDataAvailable'
import { TopProductsPerIntentChart } from 'pages/stats/voice-of-customer/product-insights/TopProductsPerIntentChart'
import { TopProductsPerIntentTable } from 'pages/stats/voice-of-customer/product-insights/TopProductsPerIntentTable'
import { assumeMock } from 'utils/testing'

jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
)
const useGetCustomTicketsFieldsDefinitionDataMock = assumeMock(
    useGetCustomTicketsFieldsDefinitionData,
)
jest.mock(
    'pages/stats/voice-of-customer/product-insights/TopProductsPerIntentTable',
)
const TopProductsPerIntentTableMock = assumeMock(TopProductsPerIntentTable)

describe('TopProductsPerIntentChart', () => {
    beforeEach(() => {
        TopProductsPerIntentTableMock.mockReturnValue(<div />)
    })
    it('should render no data available  until Intent Ticket Field loaded', () => {
        useGetCustomTicketsFieldsDefinitionDataMock.mockReturnValue({
            intentCustomFieldId: TICKET_FIELD_ID_NOT_AVAILABLE,
            outcomeCustomFieldId: TICKET_FIELD_ID_NOT_AVAILABLE,
            sentimentCustomFieldId: TICKET_FIELD_ID_NOT_AVAILABLE,
        })

        render(<TopProductsPerIntentChart />)

        expect(
            screen.getByText(NO_DATA_AVAILABLE_COMPONENT_TEXT),
        ).toBeInTheDocument()
    })

    it('should render TopProductsPerIntentTable  when Intent Ticket Field loaded', () => {
        const intentCustomFieldId = 123
        useGetCustomTicketsFieldsDefinitionDataMock.mockReturnValue({
            intentCustomFieldId,
            outcomeCustomFieldId: 456,
            sentimentCustomFieldId: 789,
        })

        render(<TopProductsPerIntentChart />)

        expect(TopProductsPerIntentTableMock).toHaveBeenCalledWith(
            { intentCustomFieldId: intentCustomFieldId },
            {},
        )
    })
})
