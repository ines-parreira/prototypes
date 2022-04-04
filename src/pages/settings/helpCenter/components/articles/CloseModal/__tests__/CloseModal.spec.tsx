import React from 'react'
import {act, fireEvent, render} from '@testing-library/react'

import {CloseModal} from '../CloseModal'

describe('<CloseModal />', () => {
    const handleOnSave = jest.fn()
    const handleOnEdit = jest.fn()
    const handleOnDiscard = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('matches snapshot', () => {
        const {container} = render(
            <CloseModal
                isOpen
                title="Are you sure?"
                saveText="Save label"
                discardText="Discard label"
                editText="Edit label"
                onSave={handleOnSave}
                onContinueEditing={handleOnEdit}
                onDiscard={handleOnDiscard}
            >
                Test content
            </CloseModal>,
            {
                container: document.body,
            }
        )

        expect(container).toMatchSnapshot()
    })

    it('calls the onSave callback', () => {
        const {getByRole} = render(
            <CloseModal
                isOpen
                title="Are you sure?"
                saveText="Save label"
                discardText="Discard label"
                editText="Edit label"
                onSave={handleOnSave}
                onContinueEditing={handleOnEdit}
                onDiscard={handleOnDiscard}
            >
                Test content
            </CloseModal>
        )

        act(() => {
            fireEvent.click(getByRole('button', {name: /save/i}))
        })

        expect(handleOnSave).toHaveBeenCalled()
    })

    it('calls the onContinueEditing callback', () => {
        const {getByRole} = render(
            <CloseModal
                isOpen
                title="Are you sure?"
                saveText="Save label"
                discardText="Discard label"
                editText="Edit label"
                onSave={handleOnSave}
                onContinueEditing={handleOnEdit}
                onDiscard={handleOnDiscard}
            >
                Test content
            </CloseModal>
        )

        act(() => {
            fireEvent.click(getByRole('button', {name: /edit/i}))
        })

        expect(handleOnEdit).toHaveBeenCalled()
    })

    it('calls the onDiscard callback', () => {
        const {getByRole} = render(
            <CloseModal
                isOpen
                title="Are you sure?"
                saveText="Save label"
                discardText="Discard label"
                editText="Edit label"
                onSave={handleOnSave}
                onContinueEditing={handleOnEdit}
                onDiscard={handleOnDiscard}
            >
                Test content
            </CloseModal>
        )

        act(() => {
            fireEvent.click(getByRole('button', {name: /discard/i}))
        })

        expect(handleOnDiscard).toHaveBeenCalled()
    })
})
