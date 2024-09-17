import {UseQueryResult} from '@tanstack/react-query'
import {screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {
    FILTER_DROPDOWN_ICON,
    FILTER_VALUE_PLACEHOLDER,
} from 'pages/stats/common/components/Filter/constants'
import {ticketFieldDefinitions} from 'fixtures/customField'
import {useCustomFieldDefinitions} from 'hooks/customField/useCustomFieldDefinitions'
import {ApiListResponseCursorPagination} from 'models/api/types'
import {CustomField} from 'models/customField/types'
import {
    CUSTOM_FIELD_FILTER_NAME,
    CustomFieldFilter,
} from 'pages/stats/common/filters/CustomFieldFilter'
import {RootState} from 'state/types'
import {
    initialState,
    setSelectedCustomField,
    ticketInsightsSlice,
} from 'state/ui/stats/ticketInsightsSlice'
import {assumeMock, renderWithStore} from 'utils/testing'
import {SegmentEvent, logEvent} from 'common/segment'

jest.mock('hooks/customField/useCustomFieldDefinitions')
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {StatFilterSelected: 'stat-filter-selected'},
}))

describe('CustomFieldFilter', () => {
    const defaultState = {
        ui: {
            [ticketInsightsSlice.name]: initialState,
        },
    } as unknown as RootState

    beforeEach(() => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: {data: ticketFieldDefinitions},
            isLoading: false,
        } as unknown as UseQueryResult<ApiListResponseCursorPagination<CustomField[]>>)
    })

    it('should render CustomFieldFilter component', () => {
        renderWithStore(<CustomFieldFilter />, defaultState)

        expect(screen.getByText(CUSTOM_FIELD_FILTER_NAME)).toBeInTheDocument()
    })

    it('should render CustomFieldFilter component when the fields are loading', () => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: {data: ticketFieldDefinitions},
            isLoading: true,
        } as unknown as UseQueryResult<ApiListResponseCursorPagination<CustomField[]>>)

        renderWithStore(<CustomFieldFilter />, defaultState)

        expect(screen.getByText(CUSTOM_FIELD_FILTER_NAME)).toBeInTheDocument()
    })

    it('should render CustomFieldFilter component when the fields are not available - no data in response', () => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: {data: undefined},
            isLoading: false,
        } as unknown as UseQueryResult<ApiListResponseCursorPagination<CustomField[]>>)

        renderWithStore(<CustomFieldFilter />, defaultState)

        expect(screen.getByText(CUSTOM_FIELD_FILTER_NAME)).toBeInTheDocument()
    })

    it('should render CustomFieldFilter component when the fields are not available - empty response', () => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: undefined,
            isLoading: false,
        } as unknown as UseQueryResult<ApiListResponseCursorPagination<CustomField[]>>)

        renderWithStore(<CustomFieldFilter />, defaultState)

        expect(screen.getByText(CUSTOM_FIELD_FILTER_NAME)).toBeInTheDocument()
    })

    it('should render CustomFieldFilter options - Dropdown Custom Fields', () => {
        renderWithStore(<CustomFieldFilter />, defaultState)

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        expect(
            screen.getByText(ticketFieldDefinitions[1].label)
        ).toBeInTheDocument()
    })

    it('should render CustomFieldFilter selected options - Dropdown Custom Fields', () => {
        const state = {
            ui: {
                [ticketInsightsSlice.name]: {
                    ...initialState,
                    selectedCustomField: {
                        id: ticketFieldDefinitions[1].id,
                        label: ticketFieldDefinitions[1].label,
                        isLoading: false,
                    },
                },
            },
        } as unknown as RootState

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
        const {store} = renderWithStore(<CustomFieldFilter />, defaultState)

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(ticketFieldDefinitions[1].label))

        expect(store.getActions()).toContainEqual(
            setSelectedCustomField({
                id: ticketFieldDefinitions[1].id,
                label: ticketFieldDefinitions[1].label,
                isLoading: false,
            })
        )
    })

    it('should call segment analytics log event on filter dropdown close', () => {
        const {rerenderComponent} = renderWithStore(
            <CustomFieldFilter />,
            defaultState
        )

        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))
        userEvent.click(screen.getByText(FILTER_VALUE_PLACEHOLDER))

        rerenderComponent(defaultState, <CustomFieldFilter />)

        expect(logEvent).toHaveBeenCalledWith(SegmentEvent.StatFilterSelected, {
            name: `tf_${CUSTOM_FIELD_FILTER_NAME}`,
            logical_operator: null,
        })
    })
})
