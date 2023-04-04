import React from 'react'
import {Router} from 'react-router-dom'
import {render, fireEvent} from '@testing-library/react'

import history from 'pages/history'

import NavigatedSuccessModal, {
    NavigatedSuccessModalName,
} from '../NavigatedSuccessModal'

import {SuccessModalIcon} from '../SuccessModal'

describe('<NavigatedSuccessModal />', () => {
    it('does not open modal if not specified in location state', () => {
        const {getByRole} = render(
            <Router history={history}>
                <NavigatedSuccessModal
                    name={NavigatedSuccessModalName.GorgiasChatAutoInstallation}
                    icon={SuccessModalIcon.PartyPopper}
                    buttonLabel="foo"
                />
            </Router>
        )

        expect(getByRole('dialog')).not.toHaveClass('open')
    })

    it('opens modal if specified in location state', () => {
        const {getByRole} = render(
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
                <NavigatedSuccessModal
                    name={NavigatedSuccessModalName.GorgiasChatAutoInstallation}
                    icon={SuccessModalIcon.PartyPopper}
                    buttonLabel="foo"
                />
            </Router>
        )

        expect(getByRole('dialog')).toHaveClass('open')
    })

    it('closing modal updates location state', () => {
        const {getByText, getByRole} = render(
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
                <NavigatedSuccessModal
                    name={NavigatedSuccessModalName.GorgiasChatAutoInstallation}
                    icon={SuccessModalIcon.PartyPopper}
                    buttonLabel="foo"
                />
            </Router>
        )

        expect(getByRole('dialog')).toHaveClass('open')

        const spy = jest.spyOn(history, 'replace')

        fireEvent.click(getByText('foo'))

        expect(getByRole('dialog')).not.toHaveClass('open')

        expect(spy).toHaveBeenCalledWith(expect.any(String), {
            showModal: undefined,
        })
    })
})
