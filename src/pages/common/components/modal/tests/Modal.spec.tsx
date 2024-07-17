import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import React from 'react'

import Modal from '../Modal'
import ModalHeader from '../ModalHeader'
import ModalBody from '../ModalBody'

describe('<Modal />', () => {
    const minProps = {
        container: document.body,
        isOpen: false,
        onClose: jest.fn(),
    }

    afterAll(() => {
        jest.resetAllMocks()
    })

    it('should render an opened modal or not according to isOpen prop', async () => {
        const {rerender} = render(
            <Modal {...minProps} isOpen>
                <ModalHeader title="Did you know?" />
            </Modal>
        )
        expect(screen.getByText('Did you know?'))

        rerender(
            <Modal {...minProps} isOpen={false}>
                <ModalHeader title="Did you know?" />
            </Modal>
        )
        await waitFor(() => {
            expect(screen.queryByText('Did you know?')).not.toBeInTheDocument()
        })
    })

    it('should trigger the provided callback on close', () => {
        const {getByText} = render(
            <Modal {...minProps} isOpen={true}>
                <ModalHeader title="Did you know?" />
            </Modal>
        )

        fireEvent.click(getByText('close'))

        expect(minProps.onClose).toHaveBeenCalled()
    })

    it('should trigger onClose callback when pressing esc because modal is open', () => {
        const {container} = render(
            <Modal {...minProps} isOpen={true}>
                <ModalHeader title="Did you know?" />
            </Modal>
        )

        fireEvent.keyDown(container, {key: 'Escape'})

        expect(minProps.onClose).toHaveBeenCalled()
    })

    it('should not trigger onClose callback when pressing esc because modal is closed', () => {
        const {container} = render(
            <Modal {...minProps} isOpen={false}>
                <ModalHeader title="Did you know?" />
            </Modal>
        )

        fireEvent.keyDown(container, {key: 'Escape'})

        expect(minProps.onClose).not.toHaveBeenCalled()
    })

    it('should not trigger onClose callback when pressing esc because modal is not closable', () => {
        const {container} = render(
            <Modal {...minProps} isClosable={false} isOpen={true}>
                <ModalHeader title="Did you know?" />
                <ModalBody>
                    Ares is the Greek god of courage and war. He is one of the
                    Twelve Olympians, and the son of Zeus and Hera
                </ModalBody>
            </Modal>
        )

        fireEvent.keyDown(container, {key: 'Escape'})

        expect(minProps.onClose).not.toHaveBeenCalled()
    })

    it('should display the modal on the provided container', () => {
        const modalContainer = document.createElement('div')
        modalContainer.setAttribute('id', 'modal-container')
        document.body.appendChild(modalContainer)

        const {baseElement} = render(
            <Modal {...minProps} isOpen={true} container={modalContainer}>
                <ModalHeader title="Did you know?" />
                <ModalBody>
                    Ares is the Greek god of courage and war. He is one of the
                    Twelve Olympians, and the son of Zeus and Hera
                </ModalBody>
            </Modal>
        )

        expect(baseElement).toMatchSnapshot()
    })

    it('should not close the modal if the click started inside the modal but finished outside the modal', () => {
        render(
            <Modal {...minProps} isOpen={true}>
                <ModalHeader title="target" />
            </Modal>
        )

        fireEvent.mouseDown(screen.getByText('target'))
        fireEvent.click(screen.getByRole('dialog'))

        expect(minProps.onClose).not.toHaveBeenCalled()
    })

    it('should close the modal when clicking outside the modal', () => {
        render(
            <Modal {...minProps} isOpen={true}>
                <ModalHeader title="target" />
            </Modal>
        )

        fireEvent.click(screen.getByRole('dialog'))

        expect(minProps.onClose).toHaveBeenCalled()
    })
})
