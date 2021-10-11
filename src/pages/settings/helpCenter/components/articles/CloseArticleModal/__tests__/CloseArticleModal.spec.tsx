import React from 'react'
import {act, fireEvent, render} from '@testing-library/react'

import {CloseArticleModal} from '../CloseArticleModal'

describe('<CloseArticleModal />', () => {
    const handleOnSave = jest.fn()
    const handleOnEdit = jest.fn()
    const handleOnDiscard = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('matches snapshot', () => {
        const {container} = render(
            <CloseArticleModal
                isOpen
                title="Are you sure?"
                onSave={handleOnSave}
                onContinueEditing={handleOnEdit}
                onDiscard={handleOnDiscard}
            >
                Test content
            </CloseArticleModal>
        )

        expect(container).toMatchSnapshot()
    })

    it('calls the onSave callback', () => {
        const {getByRole} = render(
            <CloseArticleModal
                isOpen
                title="Are you sure?"
                onSave={handleOnSave}
                onContinueEditing={handleOnEdit}
                onDiscard={handleOnDiscard}
            >
                Test content
            </CloseArticleModal>
        )

        act(() => {
            fireEvent.click(getByRole('button', {name: /save/i}))
        })

        expect(handleOnSave).toHaveBeenCalled()
    })

    it('calls the onContinueEditing callback', () => {
        const {getByRole} = render(
            <CloseArticleModal
                isOpen
                title="Are you sure?"
                onSave={handleOnSave}
                onContinueEditing={handleOnEdit}
                onDiscard={handleOnDiscard}
            >
                Test content
            </CloseArticleModal>
        )

        act(() => {
            fireEvent.click(getByRole('button', {name: /edit/i}))
        })

        expect(handleOnEdit).toHaveBeenCalled()
    })

    it('calls the onDiscard callback', () => {
        const {getByRole} = render(
            <CloseArticleModal
                isOpen
                title="Are you sure?"
                onSave={handleOnSave}
                onContinueEditing={handleOnEdit}
                onDiscard={handleOnDiscard}
            >
                Test content
            </CloseArticleModal>
        )

        act(() => {
            fireEvent.click(getByRole('button', {name: /discard/i}))
        })

        expect(handleOnDiscard).toHaveBeenCalled()
    })
})
