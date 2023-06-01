import React from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {QueryClientProvider} from '@tanstack/react-query'
import MockAdapter from 'axios-mock-adapter'

import {createTestQueryClient} from 'tests/reactQueryTestingUtils'
import client from 'models/api/resources'
import {
    updateCustomFieldError,
    updateCustomFieldState,
    updateCustomFieldValue,
} from 'state/ticket/actions'

import NumberField from '../NumberField'

const mockStore = configureMockStore()
const mockedServer = new MockAdapter(client)
const queryClient = createTestQueryClient()

const ticketId = 'whateva'

describe('<NumberField />', () => {
    const defaultState = {
        ticket: fromJS({
            id: ticketId,
        }),
    }

    const fieldState = {
        id: 1,
        value: 9999999998, // long value to be truncated
        hasError: false,
    }
    const initialProps = {
        id: fieldState.id,
        label: 'number field',
        fieldState,
        isRequired: true,
        onChange: jest.fn(),
    }

    let store = mockStore(defaultState)

    beforeEach(async () => {
        jest.clearAllMocks()
        store = mockStore(defaultState)
        store.dispatch = jest.fn()
        mockedServer.reset()
        await queryClient.invalidateQueries()
    })

    it.each([999, undefined, 0, 2.3e-34])(
        'should render the number field component correctly',
        (valueToRender) => {
            const props = {
                ...initialProps,
                fieldState: {...initialProps.fieldState, value: valueToRender},
            }
            const {container} = render(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <NumberField {...props} />
                    </Provider>
                </QueryClientProvider>
            )

            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it('should render the number field component correctly but dispatch an error', () => {
        // This can happen if the definition changed and the existing value is no longer valid
        const {container} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <NumberField {...initialProps} max={10} />
                </Provider>
            </QueryClientProvider>
        )

        expect(store.dispatch).toHaveBeenCalledWith(
            updateCustomFieldError(fieldState.id, true)
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should show full value on hover', async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <NumberField {...initialProps} />)
                </Provider>
            </QueryClientProvider>
        )
        await waitFor(() => {
            userEvent.hover(screen.getByRole('spinbutton'))
            expect(screen.getByText(fieldState.value))
        })
    })

    it('should update accordingly when value is typed', async () => {
        mockedServer
            .onPut(`/api/tickets/${ticketId}/custom-fields/${fieldState.id}`)
            .reply(200, {
                data: 'not used, don’t care',
            })
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <NumberField
                        {...{
                            ...initialProps,
                            fieldState: {...fieldState, hasError: true},
                        }}
                    />
                </Provider>
            </QueryClientProvider>
        )

        const newValue = '100'
        const input = screen.getByRole('spinbutton')
        userEvent.clear(input)
        await userEvent.type(input, newValue)

        expect(store.dispatch).toHaveBeenCalledWith(
            updateCustomFieldError(fieldState.id, false)
        )

        fireEvent.blur(input)

        await waitFor(() => {
            expect(mockedServer.history.put[0].data).toEqual('100')
        })
        expect(store.dispatch).toHaveBeenCalledTimes(4)
        expect(store.dispatch).toHaveBeenNthCalledWith(
            4,
            updateCustomFieldValue(fieldState.id, Number(newValue))
        )
    })

    it('should not http update value when blurred on a new ticket', async () => {
        mockedServer
            .onPut(`/api/tickets/${ticketId}/custom-fields/${fieldState.id}`)
            .reply(200, {
                data: 'not used, don’t care',
            })
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore({ticket: fromJS({})})}>
                    <NumberField
                        {...{
                            ...initialProps,
                            fieldState: {...fieldState, hasError: true},
                        }}
                    />
                </Provider>
            </QueryClientProvider>
        )

        const input = screen.getByRole('spinbutton')
        userEvent.clear(input)
        await userEvent.type(input, '100')
        fireEvent.blur(input)
        await waitFor(() => {
            expect(mockedServer.history.put).toHaveLength(0)
        })
    })

    it.each([999, undefined, 0, 2.3e-34])(
        'should have onError to revert to a previous state',
        async (initialValue) => {
            mockedServer
                .onPut(
                    `/api/tickets/${ticketId}/custom-fields/${fieldState.id}`
                )
                .reply(400)

            const props = {
                ...initialProps,
                fieldState: {...initialProps.fieldState, value: initialValue},
                isRequired: false,
                max: fieldState.value,
            }
            render(
                <QueryClientProvider client={queryClient}>
                    <Provider store={store}>
                        <NumberField {...props} />
                    </Provider>
                </QueryClientProvider>
            )

            const input = screen.getByRole('spinbutton')
            await userEvent.type(input, (fieldState.value + 1).toString())
            fireEvent.blur(input)

            await waitFor(() => {
                expect(store.dispatch).toHaveBeenLastCalledWith(
                    updateCustomFieldState({
                        id: fieldState.id,
                        value: initialValue,
                        hasError: false,
                    })
                )
            })
        }
    )
})
