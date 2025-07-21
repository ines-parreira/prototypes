import React, { ComponentProps, ReactNode } from 'react'

import { fireEvent, render } from '@testing-library/react'
import { Router } from 'react-router-dom'

import Modal from 'pages/common/components/modal/Modal'
import history from 'pages/history'

import NavigatedSuccessModal, {
    NavigatedSuccessModalName,
} from '../NavigatedSuccessModal'
import { SuccessModalIcon } from '../SuccessModal'

jest.mock('pages/common/components/modal/Modal', () => {
    return ({ children, isOpen, onClose }: ComponentProps<typeof Modal>) => (
        <div onClick={onClose}>{isOpen ? children : null}</div>
    )
})

jest.mock('pages/common/components/modal/ModalHeader', () => {
    return ({ title }: { title: ReactNode }) => <div>{title}</div>
})

jest.mock('pages/common/components/modal/ModalBody', () => {
    return ({ children }: { children: ReactNode }) => <div>{children}</div>
})

describe('<NavigatedSuccessModal />', () => {
    const content = 'content of modal'

    const props = {
        name: NavigatedSuccessModalName.GorgiasChatAutoInstallation,
        icon: SuccessModalIcon.PartyPopper,
        buttonLabel: 'foo',
    }

    it('does not open modal if not specified in location state', () => {
        const { queryByText } = render(
            <Router history={history}>
                <NavigatedSuccessModal {...props}>
                    {content}
                </NavigatedSuccessModal>
            </Router>,
        )

        expect(queryByText(content)).not.toBeInTheDocument()
    })

    it('opens modal if specified in location state', () => {
        const { queryByText } = render(
            <Router
                history={{
                    ...history,
                    location: {
                        ...history.location,
                        state: {
                            showModal:
                                NavigatedSuccessModalName.GorgiasChatAutoInstallation,
                        },
                    },
                }}
            >
                <NavigatedSuccessModal {...props}>
                    {content}
                </NavigatedSuccessModal>
            </Router>,
        )

        expect(queryByText(content)).toBeInTheDocument()
    })

    it('closing modal updates location state', () => {
        const { getByText, queryByText } = render(
            <Router
                history={{
                    ...history,
                    location: {
                        ...history.location,
                        state: {
                            showModal:
                                NavigatedSuccessModalName.GorgiasChatAutoInstallation,
                        },
                    },
                }}
            >
                <NavigatedSuccessModal {...props}>
                    {content}
                </NavigatedSuccessModal>
            </Router>,
        )

        expect(queryByText(content)).toBeInTheDocument()

        const spy = jest.spyOn(history, 'replace')
        fireEvent.click(getByText(content))

        expect(queryByText(content)).not.toBeInTheDocument()

        expect(spy).toHaveBeenCalledWith(expect.any(String), {
            showModal: undefined,
        })
    })
})
