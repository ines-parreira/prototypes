import {act, fireEvent, render} from '@testing-library/react'
import React from 'react'

import PendingChangesModal from '../PendingChangesModal'

jest.mock('react-router-dom', () => ({
    useHistory: () => ({
        block: jest.fn(),
        push: jest.fn(),
    }),
}))

describe('<PendingChangesModal />', () => {
    const handleOnSave = jest.fn()
    const handleOnEdit = jest.fn()
    const handleOnDiscard = jest.fn()

    it('matches snapshot', () => {
        const {container} = render(
            <PendingChangesModal
                when={true}
                show
                onSave={handleOnSave}
                onContinueEditing={handleOnEdit}
                onDiscard={handleOnDiscard}
            />,
            {
                container: document.body,
            }
        )

        expect(container).toMatchSnapshot()
    })

    it('has the correct wording', () => {
        const {getByText} = render(
            <PendingChangesModal
                when={true}
                show
                onSave={handleOnSave}
                onContinueEditing={handleOnEdit}
                onDiscard={handleOnDiscard}
                title="Title text"
                saveText="Save text button"
            />
        )

        expect(getByText(/title text/i)).toBeInTheDocument()
        expect(getByText(/save text button/i)).toBeInTheDocument()
    })

    it('calls the onSave callback', () => {
        const {getByRole} = render(
            <PendingChangesModal
                when={true}
                show
                onSave={handleOnSave}
                onContinueEditing={handleOnEdit}
                onDiscard={handleOnDiscard}
            />
        )

        act(() => {
            fireEvent.click(getByRole('button', {name: /save/i}))
        })

        expect(handleOnSave).toHaveBeenCalled()
    })

    it('calls the onContinueEditing callback', () => {
        const {getByRole} = render(
            <PendingChangesModal
                when={true}
                show
                onSave={handleOnSave}
                onContinueEditing={handleOnEdit}
                onDiscard={handleOnDiscard}
            />
        )

        act(() => {
            fireEvent.click(getByRole('button', {name: /back to editing/i}))
        })

        expect(handleOnEdit).toHaveBeenCalled()
    })

    it('calls the onDiscard callback', () => {
        const {getByRole} = render(
            <PendingChangesModal
                when={true}
                show
                onSave={handleOnSave}
                onContinueEditing={handleOnEdit}
                onDiscard={handleOnDiscard}
            />
        )

        act(() => {
            fireEvent.click(getByRole('button', {name: /discard/i}))
        })

        expect(handleOnDiscard).toHaveBeenCalled()
    })
})
