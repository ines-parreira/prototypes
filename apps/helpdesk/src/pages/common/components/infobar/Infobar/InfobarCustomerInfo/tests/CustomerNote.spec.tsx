import { assumeMock, flushPromises } from '@repo/testing'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { submitCustomer } from 'state/customers/actions'

import CustomerNote from '../CustomerNote'

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual<typeof import('@gorgias/axiom')>('@gorgias/axiom'),
    LegacyLoadingSpinner: () => <div>SpinnerMock</div>,
}))

jest.mock('state/customers/actions')
const submitCustomerMock = assumeMock(submitCustomer)
const mockStore = configureMockStore([thunk])

describe('<CustomerNote />', () => {
    const note = 'this customer is nice'
    const newNote = 'this customer is VERY nice'
    const notePlaceholder = 'This customer has no note.'
    const error =
        'An error occurred while posting this note. Please try again in a few seconds.'

    const id = 111
    const props = { customerId: id, initialNote: note }

    beforeEach(() => {
        submitCustomerMock.mockReturnValue(() => Promise.resolve())
    })

    it('should display an empty note when no note is provided', () => {
        render(
            <Provider store={mockStore({})}>
                <CustomerNote {...props} initialNote={undefined} />
            </Provider>,
        )
        expect(screen.getByPlaceholderText(notePlaceholder)).toHaveValue('')
    })

    it('should display note when provided', () => {
        render(
            <Provider store={mockStore({})}>
                <CustomerNote {...props} />
            </Provider>,
        )
        expect(screen.getByPlaceholderText(notePlaceholder)).toHaveValue(
            note ?? '',
        )
    })

    it('should display loading state because the note is being saved', async () => {
        render(
            <Provider store={mockStore({})}>
                <CustomerNote {...props} />
            </Provider>,
        )
        fireEvent.change(screen.getByPlaceholderText(notePlaceholder), {
            target: { value: newNote },
        })

        fireEvent.blur(screen.getByPlaceholderText(notePlaceholder))
        expect(submitCustomerMock).toHaveBeenCalledWith({ note: newNote }, id)
        expect(screen.getByText('SpinnerMock')).toBeInTheDocument()

        await act(flushPromises)
    })

    it('should display the changed note and not the loader because the note was successfully saved', async () => {
        render(
            <Provider store={mockStore({})}>
                <CustomerNote {...props} />
            </Provider>,
        )

        fireEvent.change(screen.getByPlaceholderText(notePlaceholder), {
            target: { value: newNote },
        })
        fireEvent.blur(screen.getByPlaceholderText(notePlaceholder))

        expect(screen.getByText(newNote)).toBeInTheDocument()

        await act(flushPromises)
        expect(screen.queryByText('SpinnerMock')).not.toBeInTheDocument()
        expect(screen.queryByText(error)).not.toBeInTheDocument()
    })

    it('should display error message because the note failed to be saved', async () => {
        submitCustomerMock.mockReturnValue(() =>
            Promise.reject(new Error(error)),
        )

        render(
            <Provider store={mockStore({})}>
                <CustomerNote {...props} />
            </Provider>,
        )

        fireEvent.change(screen.getByPlaceholderText(notePlaceholder), {
            target: { value: null },
        })
        fireEvent.blur(screen.getByPlaceholderText(notePlaceholder))

        await act(flushPromises)
        expect(screen.getByText(error)).toBeInTheDocument()
    })

    it('should not save the note when it is blurred without change', async () => {
        render(
            <Provider store={mockStore({})}>
                <CustomerNote {...props} />
            </Provider>,
        )

        fireEvent.blur(screen.getByPlaceholderText(notePlaceholder))

        await act(flushPromises)
        expect(submitCustomerMock).not.toHaveBeenCalled()
    })
})
