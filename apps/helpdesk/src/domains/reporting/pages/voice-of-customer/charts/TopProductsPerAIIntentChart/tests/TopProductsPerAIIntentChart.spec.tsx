import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { NO_DATA_AVAILABLE_COMPONENT_TEXT } from 'domains/reporting/pages/common/components/NoDataAvailable'
import { TopProductsPerAIIntentChart } from 'domains/reporting/pages/voice-of-customer/charts/TopProductsPerAIIntentChart/TopProductsPerAIIntentChart'
import { TopProductsPerIntentTable } from 'domains/reporting/pages/voice-of-customer/charts/TopProductsPerAIIntentChart/TopProductsPerIntentTable'
import {
    TICKET_FIELD_ID_NOT_AVAILABLE,
    useGetCustomTicketsFieldsDefinitionData,
} from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'

jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
)
const useGetCustomTicketsFieldsDefinitionDataMock = assumeMock(
    useGetCustomTicketsFieldsDefinitionData,
)
jest.mock(
    'domains/reporting/pages/voice-of-customer/charts/TopProductsPerAIIntentChart/TopProductsPerIntentTable',
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
            isLoading: false,
        })

        render(<TopProductsPerAIIntentChart />)

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
            isLoading: false,
        })

        render(<TopProductsPerAIIntentChart />)

        expect(TopProductsPerIntentTableMock).toHaveBeenCalledWith(
            { intentCustomFieldId: intentCustomFieldId },
            {},
        )
    })
})
