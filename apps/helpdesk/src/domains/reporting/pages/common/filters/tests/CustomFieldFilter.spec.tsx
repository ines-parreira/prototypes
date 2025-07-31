import { userEvent } from '@repo/testing'
import { screen } from '@testing-library/react'

import { logEvent, SegmentEvent } from 'common/segment'
import { useCustomFieldDefinitions } from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {
    CUSTOM_FIELD_FILTER_NAME,
    CustomFieldFilter,
} from 'domains/reporting/pages/common/filters/CustomFieldFilter'
import {
    initialState,
    setSelectedCustomField,
    ticketInsightsSlice,
} from 'domains/reporting/state/ui/stats/ticketInsightsSlice'
import { ticketFieldDefinitions } from 'fixtures/customField'
import {
    FILTER_DROPDOWN_ICON,
    FILTER_VALUE_PLACEHOLDER,
} from 'pages/common/forms/FilterInput/constants'
import { RootState } from 'state/types'
import { assumeMock, renderWithStore } from 'utils/testing'

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: { StatFilterSelected: 'stat-filter-selected' },
}))

describe('CustomFieldFilter', () => {
    const defaultState = {
        ui: {
            stats: { [ticketInsightsSlice.name]: initialState },
        },
    } as RootState

    beforeEach(() => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: { data: ticketFieldDefinitions },
            isLoading: false,
        } as ReturnType<typeof useCustomFieldDefinitions>)
    })

    it('should render CustomFieldFilter component', () => {
        renderWithStore(<CustomFieldFilter />, defaultState)

        expect(screen.getByText(CUSTOM_FIELD_FILTER_NAME)).toBeInTheDocument()
    })

    it('should render CustomFieldFilter component when the fields are loading', () => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: { data: ticketFieldDefinitions },
            isLoading: true as false,
        } as ReturnType<typeof useCustomFieldDefinitions>)

        renderWithStore(<CustomFieldFilter />, defaultState)

        expect(screen.getByText(CUSTOM_FIELD_FILTER_NAME)).toBeInTheDocument()
    })

    it('should render CustomFieldFilter component when the fields are not available - empty response', () => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: undefined,
            isLoading: false,
        } as ReturnType<typeof useCustomFieldDefinitions>)

        renderWithStore(<CustomFieldFilter />, defaultState)

        expect(screen.getByText(CUSTOM_FIELD_FILTER_NAME)).toBeInTheDocument()
    })

    it('should render CustomFieldFilter options - Dropdown Custom Fields', () => {
        renderWithStore(<CustomFieldFilter />, defaultState)

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(
            screen.getByText(ticketFieldDefinitions[1].label),
        ).toBeInTheDocument()
    })

    it('should render CustomFieldFilter selected options - Dropdown Custom Fields', () => {
        const state = {
            ui: {
                stats: {
                    [ticketInsightsSlice.name]: {
                        ...initialState,
                        selectedCustomField: {
                            id: ticketFieldDefinitions[1].id,
                            label: ticketFieldDefinitions[1].label,
                            isLoading: false,
                        },
                    },
                },
            },
        } as RootState

        renderWithStore(<CustomFieldFilter />, state)

        userEvent.click(screen.getByText(FILTER_DROPDOWN_ICON))
        const option = screen.getByRole('option', {
            name: new RegExp(ticketFieldDefinitions[1].label),
        })
        const selectedOption = screen.getByText('done')

        expect(option).toBeInTheDocument()
        expect(selectedOption).toBeInTheDocument()
    })

    it('should dispatch mergeStatsFiltersWithLogicalOperator action on selecting channel', () => {
        const { store } = renderWithStore(<CustomFieldFilter />, defaultState)

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(ticketFieldDefinitions[1].label))

        expect(store.getActions()).toContainEqual(
            setSelectedCustomField({
                id: ticketFieldDefinitions[1].id,
                label: ticketFieldDefinitions[1].label,
                isLoading: false,
            }),
        )
    })

    it('should call segment analytics log event on filter dropdown close', () => {
        const { rerenderComponent } = renderWithStore(
            <CustomFieldFilter />,
            defaultState,
        )

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        rerenderComponent(<CustomFieldFilter />, defaultState)

        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.StatFilterSelected, {
            name: `tf_${CUSTOM_FIELD_FILTER_NAME}`,
            logical_operator: null,
        })
    })
})
