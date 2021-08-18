import React from 'react'
import {act, fireEvent, render} from '@testing-library/react'

import {ConfirmationModal} from '../ConfirmationModal'

describe('<ConfirmationModal />', () => {
    const handleOnClose = jest.fn()
    const handleOnConfirm = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('matches snapshot', () => {
        const {container} = render(
            <ConfirmationModal
                isOpen
                confirmText="Confirm"
                title="Are you sure?"
                onClose={handleOnClose}
                onConfirm={handleOnConfirm}
            >
                Test content
            </ConfirmationModal>
        )

        expect(container).toMatchSnapshot()
    })

    it('calls the onClose callback', () => {
        const {getByRole} = render(
            <ConfirmationModal
                isOpen
                confirmText="Confirm"
                title="Are you sure?"
                onClose={handleOnClose}
                onConfirm={handleOnConfirm}
            >
                Test content
            </ConfirmationModal>
        )

        act(() => {
            fireEvent.click(getByRole('button', {name: /Cancel/i}))
        })

        expect(handleOnClose).toHaveBeenCalled()
    })

    it('calls the onConfirm callback', () => {
        const {getByRole} = render(
            <ConfirmationModal
                isOpen
                confirmText="Confirm"
                title="Are you sure?"
                onClose={handleOnClose}
                onConfirm={handleOnConfirm}
            >
                Test content
            </ConfirmationModal>
        )

        act(() => {
            fireEvent.click(getByRole('button', {name: /Confirm/i}))
        })

        expect(handleOnConfirm).toHaveBeenCalled()
    })
})
