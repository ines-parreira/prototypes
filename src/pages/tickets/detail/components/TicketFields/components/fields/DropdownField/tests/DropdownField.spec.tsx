import React from 'react'
import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import MockAdapter from 'axios-mock-adapter'
import {QueryClientProvider} from '@tanstack/react-query'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import client from 'models/api/resources'
import {
    updateCustomFieldError,
    updateCustomFieldState,
    updateCustomFieldValue,
} from 'state/ticket/actions'

import {DROPDOWN_NESTING_DELIMITER as delimiter} from 'models/customField/constants'
import DropdownField from '../DropdownField'
import {getLabel} from '../helpers/getLabels'

jest.mock('lodash/debounce', () => (fn: (...args: any[]) => void) => fn)

const mockStore = configureMockStore()
const mockedServer = new MockAdapter(client)
const queryClient = mockQueryClient()

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
        mockedServer.reset()
        queryClient.clear()
    })

    it('should render the dropdown component correctly', () => {
        const props = {
            ...initialProps,
            choices: [
                'Option 1',
                'Option 2',
                `Option 3${delimiter}Sub 2${delimiter}Sub 3${delimiter}Sub 4${delimiter}Sub 5`,
                0,
                1,
                123,
                true,
                false,
                // this should be ignored with no errors as we are not supporting objects
                {foo: 'bar'},
            ],
        }
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    {/*@ts-ignore - we are testing an unsupported object*/}
                    <DropdownField {...props} />)
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
            expect(screen.getByText(getLabel(fieldState.value)))
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
            updateCustomFieldError(fieldState.id, false)
        )
        expect(store.dispatch).toHaveBeenNthCalledWith(
            2,
            updateCustomFieldValue(fieldState.id, 's1::ss2::c1')
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
        userEvent.click(screen.getByText(/Clear/))
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
        userEvent.click(screen.getByText(/Clear/))
        await waitFor(() => {
            expect(mockedServer.history.delete).toHaveLength(0)
        })
    })

    it('should not display a search input if not text choices', () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <DropdownField {...initialProps} choices={[1024, 2048]} />
                </Provider>
            </QueryClientProvider>
        )
        userEvent.click(screen.getByRole('textbox'))
        expect(screen.queryByPlaceholderText('Search')).toBeNull()
    })

    it('should display display results when searching', async () => {
        const {container} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <DropdownField {...initialProps} />
                </Provider>
            </QueryClientProvider>
        )
        userEvent.click(screen.getByRole('textbox'))
        await userEvent.type(screen.getByPlaceholderText('Search'), 's1')
        expect(container.parentElement).toMatchSnapshot()
    })

    it('should display prediction icon in field and in list', () => {
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
            </QueryClientProvider>
        )
        userEvent.click(screen.getByRole('textbox'))
        expect(screen.getAllByText('auto_awesome')).toMatchSnapshot()
    })

    it.each([
        {...prediction, predicted: 'not::the::value'},
        {...prediction, display: false},
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
            </QueryClientProvider>
        )
        expect(screen.queryByText('auto_awesome')).toBeNull()
    })
})
