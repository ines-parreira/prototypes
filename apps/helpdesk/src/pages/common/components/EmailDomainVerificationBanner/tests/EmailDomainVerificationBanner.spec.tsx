import React from 'react'

import { assumeMock } from '@repo/testing'
import { cleanup, fireEvent, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'

import { UserRole } from 'config/types/user'
import useLocalStorage from 'hooks/useLocalStorage'
import { IntegrationType } from 'models/integration/constants'
import { OutboundVerificationStatusValue } from 'models/integration/types'
import { mockStore, renderWithRouter } from 'utils/testing'

import EmailDomainVerificationBanner from '../EmailDomainVerificationBanner'

jest.mock('hooks/useLocalStorage')
const useLocalStorageMock = assumeMock(useLocalStorage)

describe('EmailDomainVerificationBanner', () => {
    const renderComponent = (
        userRole = UserRole.Admin,
        domainStatus = OutboundVerificationStatusValue.Pending,
        route = '/app',
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
                        role: { name: userRole },
                    }),
                } as any)}
            >
                <MemoryRouter initialEntries={[route]}>
                    <EmailDomainVerificationBanner />
                </MemoryRouter>
            </Provider>,
            { route },
        )
    const dismissFn = jest.fn()
    beforeEach(() => {
        useLocalStorageMock.mockReturnValue([true, dismissFn, dismissFn])
    })
    afterEach(cleanup)

    it('should display the banner text', () => {
        renderComponent()
        expect(screen.getByLabelText('Email domain verification')).toBeVisible()
    })

    it('should not display the banner if it was previously dismissed', () => {
        useLocalStorageMock.mockReturnValue([false, dismissFn, dismissFn])

        renderComponent()
        expect(
            screen.queryByLabelText('Email domain verification'),
        ).not.toBeInTheDocument()
    })

    it('should not display the banner if all email domains are verified', () => {
        renderComponent(UserRole.Admin, OutboundVerificationStatusValue.Success)
        expect(
            screen.queryByLabelText('Email domain verification'),
        ).not.toBeInTheDocument()
    })

    it('should not display to non-admin users', () => {
        renderComponent(UserRole.Agent)
        expect(
            screen.queryByTestId('email-domain-verification-banner'),
        ).not.toBeInTheDocument()
    })

    it('should have the option to dismiss the banner', () => {
        renderComponent()

        const closeIcon = screen.getByText('close')
        fireEvent.click(closeIcon)
        expect(dismissFn).toHaveBeenCalledWith(false)
    })
})
