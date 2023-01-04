import React from 'react'
import {render, fireEvent} from '@testing-library/react'
import {fromJS} from 'immutable'

import {CustomerNote} from '../CustomerNote'

describe('CustomerNote component', () => {
    const note = 'this customer is nice'
    const newNote = 'this customer is VERY nice'
    const notePlaceholder = 'This customer has no note.'

    it.each([null, 'this customer is nice\n and happy'])(
        'should display passed note',
        (note) => {
            const {container} = render(
                <CustomerNote
                    customer={fromJS({id: 1, note})}
                    submitCustomer={jest.fn()}
                />
            )
            expect(container.firstChild).toMatchSnapshot()
        }
    )

    it('should display loading state because the note is being saved', () => {
        const {container, getByPlaceholderText} = render(
            <CustomerNote
                customer={fromJS({id: 1, note})}
                submitCustomer={jest.fn().mockResolvedValue({note: newNote})}
            />
        )

        fireEvent.change(getByPlaceholderText(notePlaceholder), {
            target: {value: newNote},
        })
        fireEvent.blur(getByPlaceholderText(notePlaceholder))

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display error message because the note failed to be saved', async () => {
        const error =
            'An error occurred while posting this note. Please try again in a few seconds.'
        const {container, findByText, getByPlaceholderText} = render(
            <CustomerNote
                customer={fromJS({id: 1, note})}
                submitCustomer={jest.fn().mockRejectedValue(new Error(error))}
            />
        )

        fireEvent.change(getByPlaceholderText(notePlaceholder), {
            target: {value: null},
        })
        fireEvent.blur(getByPlaceholderText(notePlaceholder))
        await findByText(error)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display the changed note and not loading because the note was successfully saved', async () => {
        const {container, getByPlaceholderText, findByText} = render(
            <CustomerNote
                customer={fromJS({id: 1, note})}
                submitCustomer={jest.fn()}
            />
        )

        fireEvent.change(getByPlaceholderText(notePlaceholder), {
            target: {value: newNote},
        })
        fireEvent.blur(getByPlaceholderText(notePlaceholder))

        const noteContent = await findByText(newNote)

        expect(noteContent.textContent).toEqual(newNote)
        expect(container.firstChild).toMatchSnapshot()
    })
})
