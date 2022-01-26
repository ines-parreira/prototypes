import React from 'react'
import {act, fireEvent, render} from '@testing-library/react'

import {DiscardChangesModal} from '../DiscardChangesModal'

describe('<DiscardChangesModal />', () => {
    const handleOnEdit = jest.fn()
    const handleOnDiscard = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('matches snapshot', () => {
        const {container} = render(
            <DiscardChangesModal
                title="Are you sure?"
                onContinueEditing={handleOnEdit}
                onDiscard={handleOnDiscard}
            >
                Test content
            </DiscardChangesModal>
        )

        expect(container).toMatchSnapshot()
    })

    it('calls the onContinueEditing callback', () => {
        const {getByRole} = render(
            <DiscardChangesModal
                title="Are you sure?"
                onContinueEditing={handleOnEdit}
                onDiscard={handleOnDiscard}
            >
                Test content
            </DiscardChangesModal>
        )

        act(() => {
            fireEvent.click(getByRole('button', {name: /edit/i}))
        })

        expect(handleOnEdit).toHaveBeenCalled()
    })

    it('calls the onDiscard callback', () => {
        const {getByRole} = render(
            <DiscardChangesModal
                title="Are you sure?"
                onContinueEditing={handleOnEdit}
                onDiscard={handleOnDiscard}
            >
                Test content
            </DiscardChangesModal>
        )

        act(() => {
            fireEvent.click(getByRole('button', {name: /discard/i}))
        })

        expect(handleOnDiscard).toHaveBeenCalled()
    })
})
