import {UseQueryResult} from '@tanstack/react-query'
import {act, render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {ticketFieldDefinitions} from 'fixtures/customField'

import {useCustomFieldDefinitions} from 'hooks/customField/useCustomFieldDefinitions'
import {ApiListResponseCursorPagination} from 'models/api/types'
import {CustomField} from 'models/customField/types'
import {
    CustomFieldSelect,
    SELECT_FIELD_LABEL,
    TOOLTIP_CONTENT,
} from 'pages/stats/CustomFieldSelect'
import {RootState} from 'state/types'
import {
    initialState,
    setSelectedCustomField,
    ticketInsightsSlice,
} from 'state/ui/stats/ticketInsightsSlice'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/customField/useCustomFieldDefinitions')
const useCustomFieldDefinitionsMock = assumeMock(useCustomFieldDefinitions)

const mockStore = configureMockStore([thunk])

describe('<CustomFieldSelect />', () => {
    const defaultState = {
        ui: {
            [ticketInsightsSlice.name]: initialState,
        },
    } as unknown as RootState

    useCustomFieldDefinitionsMock.mockReturnValue({
        data: {data: ticketFieldDefinitions},
        isLoading: false,
    } as unknown as UseQueryResult<ApiListResponseCursorPagination<CustomField[]>>)

    it('should render loading Skeleton when CustomFields loading', () => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: {data: ticketFieldDefinitions},
            isLoading: true,
        } as unknown as UseQueryResult<ApiListResponseCursorPagination<CustomField[]>>)

        const store = mockStore(defaultState)

        render(
            <Provider store={store}>
                <CustomFieldSelect />
            </Provider>
        )

        expect(store.getActions()).toContainEqual(
            setSelectedCustomField({
                id: ticketFieldDefinitions[0].id,
                label: ticketFieldDefinitions[0].label,
                isLoading: true,
            })
        )
        expect(document.querySelector('.skeleton')).toBeInTheDocument()
    })

    it('should select first of the active fields ', () => {
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: {data: ticketFieldDefinitions},
            isLoading: false,
        } as unknown as UseQueryResult<ApiListResponseCursorPagination<CustomField[]>>)

        const store = mockStore(defaultState)

        render(
            <Provider store={store}>
                <CustomFieldSelect />
            </Provider>
        )

        expect(store.getActions()).toContainEqual(
            setSelectedCustomField({
                id: ticketFieldDefinitions[0].id,
                label: ticketFieldDefinitions[0].label,
                isLoading: false,
            })
        )
        expect(screen.getByText(SELECT_FIELD_LABEL)).toBeInTheDocument()
    })

    it.each([{data: undefined}, undefined])(
        'should render if empty response %#',
        (response) => {
            const selectedCustomFieldId = ticketFieldDefinitions[0].id
            const state = {
                ui: {
                    [ticketInsightsSlice.name]: {
                        selectedCustomField: {id: selectedCustomFieldId},
                    },
                },
            }
            useCustomFieldDefinitionsMock.mockReturnValue({
                data: response,
                isLoading: false,
            } as unknown as UseQueryResult<ApiListResponseCursorPagination<CustomField[]>>)

            render(
                <Provider store={mockStore(state)}>
                    <CustomFieldSelect />
                </Provider>
            )

            expect(screen.getByText(SELECT_FIELD_LABEL)).toBeInTheDocument()
        }
    )

    it('should render Button with currently selected field Label', () => {
        const selectedCustomFieldId = ticketFieldDefinitions[0].id
        const state = {
            ui: {
                [ticketInsightsSlice.name]: {
                    selectedCustomField: {id: selectedCustomFieldId},
                },
            },
        }
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: {data: ticketFieldDefinitions},
            isLoading: false,
        } as unknown as UseQueryResult<ApiListResponseCursorPagination<CustomField[]>>)

        render(
            <Provider store={mockStore(state)}>
                <CustomFieldSelect />
            </Provider>
        )

        expect(
            screen.getByText(ticketFieldDefinitions[0].label)
        ).toBeInTheDocument()
    })

    it('should list all available Custom Fields and dispatch selection', () => {
        const state = {
            ui: {
                [ticketInsightsSlice.name]: initialState,
            },
        }
        useCustomFieldDefinitionsMock.mockReturnValue({
            data: {data: ticketFieldDefinitions},
            isLoading: false,
        } as unknown as UseQueryResult<ApiListResponseCursorPagination<CustomField[]>>)
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

        ticketFieldDefinitions.forEach((field) => {
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
