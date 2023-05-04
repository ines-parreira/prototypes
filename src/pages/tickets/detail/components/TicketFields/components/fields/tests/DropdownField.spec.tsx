import React from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import MockAdapter from 'axios-mock-adapter'
import {QueryClientProvider} from '@tanstack/react-query'

import {createTestQueryClient} from 'tests/reactQueryTestingUtils'
import client from 'models/api/resources'
import {
    updateCustomFieldError,
    updateCustomFieldState,
    updateCustomFieldValue,
} from 'state/ticket/actions'

import DropdownField from '../DropdownField'

const mockStore = configureMockStore()
const mockedServer = new MockAdapter(client)
const queryClient = createTestQueryClient()

const ticketId = 'whateva'

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
        onChange: jest.fn(),
    }

    let store = mockStore(defaultState)

    beforeEach(async () => {
        store = mockStore(defaultState)
        store.dispatch = jest.fn()
        mockedServer.reset()
        await queryClient.invalidateQueries()
    })

    it('should render the dropdown component correctly', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <DropdownField {...initialProps} />)
                </Provider>
            </QueryClientProvider>
        )
        userEvent.click(screen.getByRole('textbox'))
        expect(document.body).toMatchSnapshot()
    })

    it('should show full value on hover', async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <DropdownField {...initialProps} />)
                </Provider>
            </QueryClientProvider>
        )
        await waitFor(() => {
            userEvent.hover(screen.getByRole('textbox'))
            expect(screen.getByText(fieldState.value))
        })
    })

    it('should dispatch an error if the value is not in the choices', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <DropdownField
                        {...initialProps}
                        fieldState={{...fieldState, value: 's1::ss8::c4'}}
                    />
                </Provider>
            </QueryClientProvider>
        )
        expect(store.dispatch).toHaveBeenCalledWith(
            updateCustomFieldError(fieldState.id, true)
        )
        userEvent.click(screen.getByRole('textbox'))
        expect(screen.queryByText('ss8')).toBeNull()
    })

    it('should display all the items when focused and allow mouse navigation', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <DropdownField
                        {...{
                            ...initialProps,
                            fieldState: {id: fieldState.id, value: ''},
                        }}
                    />
                </Provider>
            </QueryClientProvider>
        )

        userEvent.click(screen.getByRole('textbox'))
        let navItem = screen.getByText('s1')
        expect(screen.getByText('s2'))
        // forth
        userEvent.click(navItem)
        expect(screen.getByText('ss1'))
        navItem = screen.getByText('s1')
        // and back
        userEvent.click(navItem)
        expect(screen.getByText('s2'))
    })

    it('should call onChange with correct params and dismiss modal when selecting a value', async () => {
        mockedServer
            .onPut(`/api/tickets/${ticketId}/custom-fields/${fieldState.id}`)
            .reply(200, {
                data: 'not used, don’t care',
            })
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <DropdownField {...initialProps} />
                </Provider>
            </QueryClientProvider>
        )

        userEvent.click(screen.getByRole('textbox'))
        userEvent.click(screen.getByText('c1'))
        expect(store.dispatch).toHaveBeenNthCalledWith(
            1,
            updateCustomFieldValue(fieldState.id, 's1::ss2::c1')
        )
        expect(store.dispatch).toHaveBeenNthCalledWith(
            2,
            updateCustomFieldError(fieldState.id, false)
        )
        await waitFor(() => {
            expect(mockedServer.history.put[0].data).toEqual('"s1::ss2::c1"')
        })
        expect(store.dispatch).toHaveBeenCalledTimes(2)
        expect(screen.queryByTestId('floating-overlay')).toBe(null)
    })

    it('should call dispatch state to previous state when failing to update the value', async () => {
        mockedServer
            .onPut(`/api/tickets/${ticketId}/custom-fields/${fieldState.id}`)
            .reply(400)
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <DropdownField {...initialProps} />
                </Provider>
            </QueryClientProvider>
        )
        userEvent.click(screen.getByRole('textbox'))
        userEvent.click(screen.getByText('c1'))
        await waitFor(() => {
            expect(store.dispatch).toHaveBeenLastCalledWith(
                updateCustomFieldState(fieldState)
            )
        })
    })

    it('should call onChange with correct params and dismiss modal when clearing the value', async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <DropdownField {...initialProps} />
                </Provider>
            </QueryClientProvider>
        )

        userEvent.click(screen.getByRole('textbox'))
        userEvent.click(screen.getByText('Clear'))
        await waitFor(() => {
            expect(mockedServer.history.delete[0]).toBeDefined()
        })
        expect(screen.queryByTestId('floating-overlay')).toBe(null)
    })

    it('should not http update value onChange when on a new ticket', async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore({ticket: fromJS({})})}>
                    <DropdownField {...initialProps} />
                </Provider>
            </QueryClientProvider>
        )

        userEvent.click(screen.getByRole('textbox'))
        userEvent.click(screen.getByText('Clear'))
        await waitFor(() => {
            expect(mockedServer.history.delete).toHaveLength(0)
        })
    })

    // TODO(@Manuel): add accessibility tests once we update userEvent
})
