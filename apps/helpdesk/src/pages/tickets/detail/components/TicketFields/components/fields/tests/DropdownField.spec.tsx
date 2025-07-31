import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { getValueLabel } from 'custom-fields/helpers/getValueLabels'
import { useUpdateOrDeleteTicketFieldValue } from 'custom-fields/hooks/queries/useUpdateOrDeleteTicketFieldValue'
import {
    updateCustomFieldError,
    updateCustomFieldState,
    updateCustomFieldValue,
} from 'state/ticket/actions'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { getLastMockCall } from 'utils/testing'

import DropdownField from '../DropdownField'

jest.mock('lodash/debounce', () => (fn: (...args: any[]) => void) => fn)

const mockStore = configureMockStore()
const queryClient = mockQueryClient()
const mutateMock = jest.fn()

const ticketId = 'whateva'

jest.mock('custom-fields/hooks/queries/useUpdateOrDeleteTicketFieldValue')
const useUpdateOrDeleteTicketFieldValueMock =
    useUpdateOrDeleteTicketFieldValue as jest.Mock

describe('<DropdownField />', () => {
    const defaultState = {
        ticket: fromJS({
            id: ticketId,
        }),
    }

    const choices = ['s1::ss1', 's1::ss2::c1', 's1::ss2::c2', 's1::ss3', 's2']
    const fieldState = {
        id: 1,
        value: 's1::ss2::c2',
        hasError: false,
    }
    const initialProps = {
        id: fieldState.id,
        label: 'dropdown',
        fieldState,
        choices,
        isRequired: true,
    }
    const prediction = {
        confidence: 87,
        confirmed: false,
        display: true,
        modified: false,
        predicted: 's1::ss2::c2',
    }

    let store = mockStore(defaultState)

    beforeEach(() => {
        store = mockStore(defaultState)
        store.dispatch = jest.fn()
        queryClient.clear()
        useUpdateOrDeleteTicketFieldValueMock.mockReturnValue({
            mutate: mutateMock,
        })
    })

    it('should show full value on hover', async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <DropdownField {...initialProps} />)
                </Provider>
            </QueryClientProvider>,
        )
        await waitFor(() => {
            userEvent.hover(screen.getByRole('textbox'))
            expect(screen.getByText(getValueLabel(fieldState.value)))
        })
    })

    it('should dispatch an error if the value is not in the choices', async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <DropdownField
                        {...initialProps}
                        fieldState={{ ...fieldState, value: 's1::ss8::c4' }}
                    />
                </Provider>
            </QueryClientProvider>,
        )
        expect(store.dispatch).toHaveBeenCalledWith(
            updateCustomFieldError(fieldState.id, true),
        )
        await userEvent.click(screen.getByRole('textbox'))
        expect(screen.queryByText('ss8')).toBeNull()
    })

    it('should display all the items when focused and allow mouse navigation', async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <DropdownField
                        {...{
                            ...initialProps,
                            fieldState: { id: fieldState.id, value: '' },
                        }}
                    />
                </Provider>
            </QueryClientProvider>,
        )

        await userEvent.click(screen.getByRole('textbox'))
        let navItem = screen.getByText('s1')
        expect(screen.getByText('s2'))
        // forth
        await userEvent.click(navItem)
        expect(screen.getByText('ss1'))
        navItem = screen.getByText('s1')
        // and back
        await userEvent.click(navItem)
        expect(screen.getByText('s2'))
    })

    it('should call onChange with correct params and dismiss modal when selecting a value', async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <DropdownField {...initialProps} />
                </Provider>
            </QueryClientProvider>,
        )

        await userEvent.click(screen.getByRole('textbox'))
        await userEvent.click(screen.getByText('c1'))
        expect(store.dispatch).toHaveBeenNthCalledWith(
            1,
            updateCustomFieldError(fieldState.id, false),
        )
        expect(store.dispatch).toHaveBeenNthCalledWith(
            2,
            updateCustomFieldValue(fieldState.id, 's1::ss2::c1'),
        )
        await waitFor(() => {
            expect(mutateMock).toHaveBeenCalledWith({
                fieldId: fieldState.id,
                ticketId,
                value: 's1::ss2::c1',
            })
        })
        expect(store.dispatch).toHaveBeenCalledTimes(2)
        expect(screen.queryByTestId('floating-overlay')).toBe(null)
    })

    it('should call dispatch state to previous state when failing to update the value', async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <DropdownField {...initialProps} />
                </Provider>
            </QueryClientProvider>,
        )
        await userEvent.click(screen.getByRole('textbox'))
        await userEvent.click(screen.getByText('c1'))

        getLastMockCall(useUpdateOrDeleteTicketFieldValueMock)[0].onError()

        await waitFor(() => {
            expect(store.dispatch).toHaveBeenLastCalledWith(
                updateCustomFieldState(fieldState),
            )
        })
    })

    it('should call onChange with correct params and dismiss modal when clearing the value', async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <DropdownField {...initialProps} />
                </Provider>
            </QueryClientProvider>,
        )

        await userEvent.click(screen.getByRole('textbox'))
        await userEvent.click(screen.getByText(/Clear/))
        await waitFor(() => {
            expect(mutateMock).toHaveBeenCalledWith({
                fieldId: fieldState.id,
                ticketId,
                value: '',
            })
        })
        expect(screen.queryByTestId('floating-overlay')).toBe(null)
    })

    it('should disable the update query when ticket is new', async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore({ ticket: fromJS({}) })}>
                    <DropdownField {...initialProps} />
                </Provider>
            </QueryClientProvider>,
        )

        await userEvent.click(screen.getByRole('textbox'))
        await userEvent.click(screen.getByText(/Clear/))

        expect(useUpdateOrDeleteTicketFieldValueMock).toHaveBeenCalledWith(
            expect.objectContaining({
                onError: expect.any(Function),
            }),
            { isDisabled: true },
        )
    })

    it('should not display a search input if not text choices', async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <DropdownField {...initialProps} choices={[1024, 2048]} />
                </Provider>
            </QueryClientProvider>,
        )
        await userEvent.click(screen.getByRole('textbox'))
        expect(screen.queryByPlaceholderText('Search')).toBeNull()
    })

    it('should display prediction icon in field and in list', async () => {
        const props = {
            ...initialProps,
            fieldState: {
                ...fieldState,
                hasError: undefined,
                prediction,
            },
        }
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <DropdownField {...props} />
                </Provider>
            </QueryClientProvider>,
        )
        await userEvent.click(screen.getByRole('textbox'))
        expect(screen.getAllByText('auto_awesome')[0]).toBeInTheDocument()
    })

    it.each([
        { ...prediction, predicted: 'not::the::value' },
        { ...prediction, display: false },
    ])('should not display prediction icon', (wrongPrediction) => {
        const props = {
            ...initialProps,
            fieldState: {
                ...fieldState,
                prediction: wrongPrediction,
            },
        }
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <DropdownField {...props} />
                </Provider>
            </QueryClientProvider>,
        )
        expect(screen.queryByText('auto_awesome')).toBeNull()
    })
})
