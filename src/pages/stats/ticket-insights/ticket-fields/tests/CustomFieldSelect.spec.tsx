import {UseQueryResult} from '@tanstack/react-query'
import {act, render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {useCustomFieldDefinitions} from 'custom-fields/hooks/queries/useCustomFieldDefinitions'
import {CustomField} from 'custom-fields/types'
import {ticketFieldDefinitions} from 'fixtures/customField'

import {ApiListResponseCursorPagination} from 'models/api/types'
import {
    CustomFieldSelect,
    SELECT_FIELD_LABEL,
    selectDropdownTextFields,
    TOOLTIP_CONTENT,
} from 'pages/stats/ticket-insights/ticket-fields/CustomFieldSelect'
import {RootState} from 'state/types'
import {
    initialState,
    setSelectedCustomField,
    ticketInsightsSlice,
} from 'state/ui/stats/ticketInsightsSlice'
import {assumeMock} from 'utils/testing'

jest.mock('custom-fields/hooks/queries/useCustomFieldDefinitions')
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)

const mockStore = configureMockStore([thunk])

describe('<CustomFieldSelect />', () => {
    const defaultState = {
        ui: {
            stats: {
                [ticketInsightsSlice.name]: initialState,
            },
        },
    } as RootState

    const dropdownField = ticketFieldDefinitions[1]

    useCustomFieldDefinitionsMock.mockReturnValue({
        data: {data: ticketFieldDefinitions},
        isLoading: false,
    } as unknown as UseQueryResult<
        ApiListResponseCursorPagination<CustomField[]>
    >)

    it('should render loading Skeleton when CustomFields loading', () => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: {data: ticketFieldDefinitions},
            isLoading: true,
        } as unknown as UseQueryResult<
            ApiListResponseCursorPagination<CustomField[]>
        >)

        const store = mockStore(defaultState)

        render(
            <Provider store={store}>
                <CustomFieldSelect />
            </Provider>
        )

        expect(store.getActions()).toContainEqual(
            setSelectedCustomField({
                id: dropdownField.id,
                label: dropdownField.label,
                isLoading: true,
            })
        )
        expect(
            document.querySelector('.react-loading-skeleton')
        ).toBeInTheDocument()
    })

    it('should select first of the active fields ', () => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: {data: ticketFieldDefinitions},
            isLoading: false,
        } as unknown as UseQueryResult<
            ApiListResponseCursorPagination<CustomField[]>
        >)

        const store = mockStore(defaultState)

        render(
            <Provider store={store}>
                <CustomFieldSelect />
            </Provider>
        )

        expect(store.getActions()).toContainEqual(
            setSelectedCustomField({
                id: dropdownField.id,
                label: dropdownField.label,
                isLoading: false,
            })
        )
        expect(screen.getByText(SELECT_FIELD_LABEL)).toBeInTheDocument()
    })

    it.each([{data: undefined}, undefined])(
        'should render if empty response %#',
        (response) => {
            const selectedCustomFieldId = dropdownField.id
            const state = {
                ui: {
                    stats: {
                        [ticketInsightsSlice.name]: {
                            selectedCustomField: {id: selectedCustomFieldId},
                        },
                    },
                },
            } as RootState
            useCustomFieldDefinitionsMock.mockReturnValue({
                data: response,
                isLoading: false,
            } as unknown as UseQueryResult<
                ApiListResponseCursorPagination<CustomField[]>
            >)

            render(
                <Provider store={mockStore(state)}>
                    <CustomFieldSelect />
                </Provider>
            )

            expect(screen.getByText(SELECT_FIELD_LABEL)).toBeInTheDocument()
        }
    )

    it('should render Button with currently selected field Label', () => {
        const selectedCustomFieldId = dropdownField.id
        const state = {
            ui: {
                stats: {
                    [ticketInsightsSlice.name]: {
                        selectedCustomField: {id: selectedCustomFieldId},
                    },
                },
            },
        } as RootState
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: {data: ticketFieldDefinitions},
            isLoading: false,
        } as unknown as UseQueryResult<
            ApiListResponseCursorPagination<CustomField[]>
        >)

        render(
            <Provider store={mockStore(state)}>
                <CustomFieldSelect />
            </Provider>
        )

        expect(screen.getByText(dropdownField.label)).toBeInTheDocument()
    })

    it('should list all available Dropdown-Text Custom Fields and dispatch selection', () => {
        const state = {
            ui: {
                stats: {[ticketInsightsSlice.name]: initialState},
            },
        } as RootState
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: {data: ticketFieldDefinitions},
            isLoading: false,
        } as unknown as UseQueryResult<
            ApiListResponseCursorPagination<CustomField[]>
        >)
        const selectField = ticketFieldDefinitions[1]
        const store = mockStore(state)

        render(
            <Provider store={store}>
                <CustomFieldSelect />
            </Provider>
        )
        act(() => {
            userEvent.click(screen.getByRole('button'))
        })

        ticketFieldDefinitions
            .filter(selectDropdownTextFields)
            .forEach((field) => {
                expect(screen.getByText(field.label)).toBeInTheDocument()
            })

        act(() => {
            userEvent.click(
                screen.getByRole('option', {name: selectField.label})
            )
        })

        expect(store.getActions()).toContainEqual(
            setSelectedCustomField({
                id: selectField.id,
                label: selectField.label,
                isLoading: false,
            })
        )
    })

    it('should render a Tooltip', async () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <CustomFieldSelect />
            </Provider>
        )

        act(() => {
            userEvent.hover(screen.getByText('info'))
        })

        await waitFor(() => {
            expect(screen.getByText(TOOLTIP_CONTENT)).toBeInTheDocument()
        })
    })
})
