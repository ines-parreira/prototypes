import {fireEvent, render} from '@testing-library/react'
import ReactDOM from 'react-dom'
import React, {ReactPortal} from 'react'

import Modal from '../Modal'
import ModalHeader from '../ModalHeader'
import ModalBody from '../ModalBody'

jest.spyOn(ReactDOM, 'createPortal').mockImplementation(
    (element) => element as ReactPortal
)

describe('<Modal />', () => {
    const minProps = {
        container: document.body,
        isOpen: false,
        onClose: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    afterAll(() => {
        jest.resetAllMocks()
    })

    it('should render an opened modal', () => {
        const {baseElement} = render(
            <Modal {...minProps} isOpen={true}>
                <ModalHeader title="Did you know?" />
                <ModalBody>
                    Ares is the Greek god of courage and war. He is one of the
                    Twelve Olympians, and the son of Zeus and Hera
                </ModalBody>
            </Modal>
        )

        expect(baseElement.firstChild).toMatchSnapshot()
    })

    it('should trigger the provided callback on close', () => {
        const {getByText} = render(
            <Modal {...minProps} isOpen={true}>
                <ModalHeader title="Did you know?" />
                <ModalBody>
                    Ares is the Greek god of courage and war. He is one of the
                    Twelve Olympians, and the son of Zeus and Hera
                </ModalBody>
            </Modal>
        )

        fireEvent.click(getByText('close'))

        expect(minProps.onClose).toHaveBeenCalled()
    })

    it('should trigger onClose callback when pressing esc because modal is open', () => {
        const {container} = render(
            <Modal {...minProps} isOpen={true}>
                <ModalHeader title="Did you know?" />
                <ModalBody>
                    Ares is the Greek god of courage and war. He is one of the
                    Twelve Olympians, and the son of Zeus and Hera
                </ModalBody>
            </Modal>
        )

        fireEvent.keyDown(container, {key: 'Escape'})

        expect(minProps.onClose).toHaveBeenCalled()
    })

    it('should not trigger onClose callback when pressing esc because modal is closed', () => {
        const {container} = render(
            <Modal {...minProps} isOpen={false}>
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
})
