import {act, fireEvent, render} from '@testing-library/react'
import React from 'react'

import {ConfirmationModal} from '../ConfirmationModal'

describe('<ConfirmationModal />', () => {
    const handleOnClose = jest.fn()
    const handleOnConfirm = jest.fn()

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

    it('should add additional button to the confirmation modal ', () => {
        const additionalButtonName = 'Additional button'
        const additionalActionButtonAction = jest.fn()
        const {getByRole} = render(
            <ConfirmationModal
                additionalActionButtonConfig={{
                    content: additionalButtonName,
                    onClick: additionalActionButtonAction,
                }}
                isOpen
                confirmText="Confirm"
                title="Are you sure?"
                onClose={handleOnClose}
                onConfirm={handleOnConfirm}
            >
                Test content
            </ConfirmationModal>
        )

        expect(
            getByRole('button', {name: additionalButtonName})
        ).toBeInTheDocument()

        act(() => {
            fireEvent.click(getByRole('button', {name: additionalButtonName}))
        })

        expect(additionalActionButtonAction).toHaveBeenCalled()
    })
})
