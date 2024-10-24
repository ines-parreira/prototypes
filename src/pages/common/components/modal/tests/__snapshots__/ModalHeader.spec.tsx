import {render, screen} from '@testing-library/react'
import React from 'react'

import {ModalContext} from '../../Modal'
import ModalHeader from '../../ModalHeader'

describe('<ModalHeader/>', () => {
    it('should not render close button if `isClosable` is false', () => {
        render(
            <ModalContext.Provider
                value={{
                    bodyId: 'bodyId',
                    onClose: jest.fn(),
                    isClosable: false,
                }}
            >
                <ModalHeader title="Title of a header" />
            </ModalContext.Provider>
        )

        expect(screen.queryByText('close')).not.toBeInTheDocument()
    })

    it('should  render close button if `isClosable` is false but `forceCloseButton` is true', () => {
        render(
            <ModalContext.Provider
                value={{
                    bodyId: 'bodyId',
                    onClose: jest.fn(),
                    isClosable: false,
                }}
            >
                <ModalHeader title="Title of a header" forceCloseButton />
            </ModalContext.Provider>
        )

        expect(screen.getByText('close')).toBeInTheDocument()
    })
})
