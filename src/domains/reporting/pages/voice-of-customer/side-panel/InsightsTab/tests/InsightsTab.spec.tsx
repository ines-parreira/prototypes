import { fireEvent, screen, waitFor } from '@testing-library/react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { useTicketCountPerIntentForProduct } from 'domains/reporting/hooks/voice-of-customer/metricsPerProductAndIntent'
import { INTENT_DIMENSION } from 'domains/reporting/models/queryFactories/voice-of-customer/ticketCountPerIntent'
import { L3IntentCard } from 'domains/reporting/pages/voice-of-customer/components/L3IntentCard'
import {
    DATA_MISSING_MESSAGE,
    InsightsTab,
    NUMBER_PLACEHOLDER_ITEMS,
    sortingOptions,
} from 'domains/reporting/pages/voice-of-customer/side-panel/InsightsTab/InsightsTab'
import { useGetCustomTicketsFieldsDefinitionData } from 'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock('domains/reporting/hooks/support-performance/useStatsFilters')
const useStatsFiltersMock = assumeMock(useStatsFilters)

jest.mock(
    'domains/reporting/hooks/voice-of-customer/metricsPerProductAndIntent',
)
const useTicketCountPerIntentForProductMock = assumeMock(
    useTicketCountPerIntentForProduct,
)

jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
)
const useGetCustomTicketsFieldsDefinitionDataMock = assumeMock(
    useGetCustomTicketsFieldsDefinitionData,
)

jest.mock('domains/reporting/pages/voice-of-customer/components/L3IntentCard')
const L3IntentCardMock = assumeMock(L3IntentCard)

describe('InsightsTab', () => {
    const cleanStatsFilters = {
        period: {
            start_datetime: '2024-09-14T00:00:00+00:00',
            end_datetime: '2024-09-20T23:59:59+00:00',
        },
    }
    const userTimezone = 'UTC'
    const intentCustomFieldId = 123
    const product = { id: '456', name: 'product name' }
    const defaultState = {
        ui: {
            stats: {
                sidePanel: {
                    product,
                },
            },
        },
    } as any

    const intent1 = 'intent1'
    const intent2 = 'intent2'

    const allData = [
        { [INTENT_DIMENSION]: intent1 },
        { [INTENT_DIMENSION]: intent2 },
    ]

    beforeEach(() => {
        useStatsFiltersMock.mockReturnValue({
            cleanStatsFilters,
            userTimezone,
        } as any)

        useGetCustomTicketsFieldsDefinitionDataMock.mockReturnValue({
            intentCustomFieldId,
        } as any)

        useTicketCountPerIntentForProductMock.mockReturnValue({
            isError: false,
            isFetching: false,
            data: { allData },
        } as any)

        L3IntentCardMock.mockImplementation(() => <div />)
    })

    it('should not render anything if product is missing', () => {
        const state = JSON.parse(JSON.stringify(defaultState))
        state.ui.stats.sidePanel.product = null
        const { container } = renderWithStore(<InsightsTab />, state)

        expect(container.firstChild).toBeNull()
    })

    it('should not render anything if intentCustomFieldId is missing', () => {
        useGetCustomTicketsFieldsDefinitionDataMock.mockReturnValue({
            intentCustomFieldId: -1,
        } as any)

        const { container } = renderWithStore(<InsightsTab />, defaultState)

        expect(container.firstChild).toBeNull()
    })

    it('renders a list of intents for product', () => {
        renderWithStore(<InsightsTab />, defaultState)

        const listitems = screen.getAllByRole('listitem')

        expect(listitems.length).toBe(allData.length)
        expect(L3IntentCardMock).toHaveBeenCalledTimes(allData.length)
    })

    it('returns null if intent is missing', () => {
        const withInvalidEntries = [
            { [INTENT_DIMENSION]: intent1 },
            { missingIntent: 123 },
        ]
        useTicketCountPerIntentForProductMock.mockReturnValue({
            isError: false,
            isFetching: false,
            data: { allData: withInvalidEntries },
        } as any)

        renderWithStore(<InsightsTab />, defaultState)

        const listitems = screen.getAllByRole('listitem')

        expect(listitems.length).toBe(1)
        expect(L3IntentCardMock).toHaveBeenCalledTimes(1)
    })

    it('renders empty fallback if data is an empty array', () => {
        useTicketCountPerIntentForProductMock.mockReturnValue({
            isError: false,
            isFetching: false,
            data: { allData: [] },
        } as any)

        renderWithStore(<InsightsTab />, defaultState)

        const noDataFallback = screen.getByText(DATA_MISSING_MESSAGE)

        expect(noDataFallback).toBeInTheDocument()
    })

    it('renders empty fallback if data is missing', () => {
        useTicketCountPerIntentForProductMock.mockReturnValue({
            isError: false,
            isFetching: false,
            data: { allData: null },
        } as any)

        renderWithStore(<InsightsTab />, defaultState)

        const noDataFallback = screen.getByText(DATA_MISSING_MESSAGE)

        expect(noDataFallback).toBeInTheDocument()
    })

    it('renders loading fallback while fetching the data', () => {
        useTicketCountPerIntentForProductMock.mockReturnValue({
            isError: false,
            isFetching: true,
            data: { allData },
        } as any)

        renderWithStore(<InsightsTab />, defaultState)

        const listitems = screen.getAllByRole('listitem')

        expect(listitems.length).toBe(NUMBER_PLACEHOLDER_ITEMS)
        expect(L3IntentCardMock).not.toHaveBeenCalled()
    })

    it('applies sorting', async () => {
        renderWithStore(<InsightsTab />, defaultState)

        const select = screen.getByRole('button')

        for (let i = 0; i < sortingOptions.length; i++) {
            fireEvent.click(select)

            const options = screen.getAllByRole('option')
            expect(options).toHaveLength(4)

            fireEvent.click(options[i])

            await waitFor(() => {
                expect(
                    useTicketCountPerIntentForProductMock,
                ).toHaveBeenCalledWith(
                    cleanStatsFilters,
                    userTimezone,
                    intentCustomFieldId,
                    product.id,
                    sortingOptions[i].direction,
                    undefined,
                    sortingOptions[i].field,
                )
            })

            useTicketCountPerIntentForProductMock.mockClear()
        }
    })
})
