import {cleanup, fireEvent, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import React from 'react'
import {MemoryRouter} from 'react-router-dom'
import {fromJS} from 'immutable'

import {mockStore, renderWithRouter} from 'utils/testing'
import * as hooks from 'common/hooks'
import {IntegrationType} from 'models/integration/constants'
import {UserRole} from 'config/types/user'
import {OutboundVerificationStatusValue} from 'models/integration/types'

import EmailDomainVerificationBanner from '../EmailDomainVerificationBanner'

const usePersistedStateSpy = jest.spyOn(hooks, 'usePersistedState')

describe('EmailDomainVerificationBanner', () => {
    const renderComponent = (
        userRole = UserRole.Admin,
        domainStatus = OutboundVerificationStatusValue.Pending,
        route = '/app'
    ) =>
        renderWithRouter(
            <Provider
                store={mockStore({
                    integrations: fromJS({
                        integrations: [
                            {
                                type: IntegrationType.Email,
                                meta: {
                                    address: 'email@gorgias.com',
                                    outbound_verification_status: {
                                        sender_verification: 'unverified',
                                        domain: domainStatus,
                                    },
                                },
                            },
                        ],
                    }),
                    currentUser: fromJS({
                        name: UserRole.Admin,
                        role: {name: userRole},
                    }),
                } as any)}
            >
                <MemoryRouter initialEntries={[route]}>
                    <EmailDomainVerificationBanner />
                </MemoryRouter>
            </Provider>,
            {route}
        )
    afterEach(cleanup)

    it('should display the banner text', () => {
        renderComponent()
        expect(screen.getByLabelText('Email domain verification')).toBeVisible()
    })

    it('should not display the banner if it was previously dismissed', () => {
        const dismissFn = jest.fn()
        usePersistedStateSpy.mockReturnValue([false, dismissFn])

        renderComponent()
        expect(
            screen.queryByLabelText('Email domain verification')
        ).not.toBeInTheDocument()
    })

    it('should not display the banner if all email domains are verified', () => {
        const dismissFn = jest.fn()
        usePersistedStateSpy.mockReturnValue([false, dismissFn])

        renderComponent(UserRole.Admin, OutboundVerificationStatusValue.Success)
        expect(
            screen.queryByLabelText('Email domain verification')
        ).not.toBeInTheDocument()
    })

    it('should not display to non-admin users', () => {
        const dismissFn = jest.fn()
        usePersistedStateSpy.mockReturnValue([false, dismissFn])

        renderComponent(UserRole.Agent)
        expect(
            screen.queryByTestId('email-domain-verification-banner')
        ).not.toBeInTheDocument()
    })

    it('should have the option to dismiss the banner', () => {
        const dismissFn = jest.fn()
        usePersistedStateSpy.mockReturnValue([true, dismissFn])

        renderComponent()

        const closeIcon = screen.getByRole('img', {
            name: /close\-icon/i,
        })
        fireEvent.click(closeIcon)
        expect(dismissFn).toHaveBeenCalledWith(false)
    })
})
