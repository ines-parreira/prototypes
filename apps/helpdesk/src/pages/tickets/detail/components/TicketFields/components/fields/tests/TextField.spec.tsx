import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { useUpdateOrDeleteTicketFieldValue } from 'custom-fields/hooks/queries/useUpdateOrDeleteTicketFieldValue'
import {
    updateCustomFieldError,
    updateCustomFieldState,
    updateCustomFieldValue,
} from 'state/ticket/actions'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { getLastMockCall } from 'utils/testing'

import TextField from '../TextField'

const mockStore = configureMockStore()
const queryClient = mockQueryClient()

const ticketId = 'whateva'

jest.mock('custom-fields/hooks/queries/useUpdateOrDeleteTicketFieldValue')
const useUpdateOrDeleteTicketFieldValueMock =
    useUpdateOrDeleteTicketFieldValue as jest.Mock

describe('<TextField />', () => {
    const defaultState = {
        ticket: fromJS({
            id: ticketId,
        }),
    }

    const fieldState = {
        id: 1,
        value: 'this is a very long value that should be truncated',
        hasError: false,
    }
    const initialProps = {
        id: fieldState.id,
        label: 'text field',
        fieldState,
        isRequired: true,
        onChange: jest.fn(),
    }

    let store = mockStore(defaultState)
    const mutateMock = jest.fn()

    beforeEach(() => {
        store = mockStore(defaultState)
        store.dispatch = jest.fn()
        queryClient.clear()
        useUpdateOrDeleteTicketFieldValueMock.mockReturnValue({
            mutate: mutateMock,
        })
    })

    it('should render the text field component correctly', () => {
        const { container } = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <TextField {...initialProps} />)
                </Provider>
            </QueryClientProvider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should show full value on hover', async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <TextField {...initialProps} />)
                </Provider>
            </QueryClientProvider>,
        )
        await waitFor(() => {
            userEvent.hover(screen.getByRole('textbox'))
            expect(screen.getByText(fieldState.value))
        })
    })

    it('should update accordingly when value is typed', async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <TextField
                        {...{
                            ...initialProps,
                            fieldState: { ...fieldState, hasError: true },
                        }}
                    />
                </Provider>
            </QueryClientProvider>,
        )

        const newValue = 'a '
        const input = screen.getByRole('textbox')
        userEvent.clear(input)
        await userEvent.type(input, newValue)

        expect(store.dispatch).toHaveBeenCalledWith(
            updateCustomFieldError(fieldState.id, false),
        )

        fireEvent.blur(input)

        const trimmedNewValue = newValue.trim()

        await waitFor(() => {
            expect(mutateMock).toHaveBeenCalledWith({
                fieldId: fieldState.id,
                ticketId,
                value: trimmedNewValue,
            })
            expect(store.dispatch).toHaveBeenNthCalledWith(
                3,
                updateCustomFieldValue(fieldState.id, trimmedNewValue),
            )
            expect(store.dispatch).toHaveBeenCalledTimes(3)
        })
    })

    it('should disable the update query when ticket is new', async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore({ ticket: fromJS({}) })}>
                    <TextField
                        {...{
                            ...initialProps,
                            fieldState: { ...fieldState },
                        }}
                    />
                </Provider>
            </QueryClientProvider>,
        )

        expect(useUpdateOrDeleteTicketFieldValueMock).toHaveBeenCalledWith(
            expect.objectContaining({
                onError: expect.any(Function),
            }),
            { isDisabled: true },
        )
    })

    it('should have onError to revert to a previous state', async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <TextField {...initialProps} />
                </Provider>
            </QueryClientProvider>,
        )

        const input = screen.getByRole('textbox')
        await userEvent.type(input, ticketId)
        fireEvent.blur(input)

        getLastMockCall(useUpdateOrDeleteTicketFieldValueMock)[0].onError()

        await waitFor(() => {
            expect(store.dispatch).toHaveBeenLastCalledWith(
                updateCustomFieldState({
                    id: fieldState.id,
                    value: fieldState.value,
                    hasError: false,
                }),
            )
        })
    })

    it('should update the value when the value prop changes', () => {
        const { rerender } = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <TextField {...initialProps} />
                </Provider>
            </QueryClientProvider>,
        )
        const input = screen.getByRole('textbox')
        expect(input).toHaveValue(fieldState.value)

        const newFieldState = {
            ...fieldState,
            value: 'some new value',
        }
        rerender(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <TextField {...initialProps} fieldState={newFieldState} />
                </Provider>
            </QueryClientProvider>,
        )
        expect(input).toHaveValue(newFieldState.value)
    })
})
