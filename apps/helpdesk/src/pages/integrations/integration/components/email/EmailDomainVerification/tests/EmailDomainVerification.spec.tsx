import React from 'react'

import { render, screen } from '@testing-library/react'

import { EmailIntegration } from '@gorgias/helpdesk-queries'

import { assumeMock } from 'utils/testing'

import { getDomainFromEmailAddress } from '../../helpers'
import DomainVerificationProvider from '../DomainVerificationProvider'
import EmailDomainVerification from '../EmailDomainVerification'
import EmailDomainVerificationActionButtons from '../EmailDomainVerificationActionButtons'
import EmailDomainVerificationContent from '../EmailDomainVerificationContent'

jest.mock('../EmailDomainVerificationSupportContentSidebar', () => () => (
    <div>SidebarContent</div>
))
jest.mock('../../helpers')
jest.mock('../EmailDomainVerificationContent')
jest.mock('../EmailDomainVerificationActionButtons')
jest.mock('../DomainVerificationProvider')

const EmailDomainVerificationContentMock = assumeMock(
    EmailDomainVerificationContent,
)
const EmailDomainVerificationActionButtonsMock = assumeMock(
    EmailDomainVerificationActionButtons,
)
const DomainVerificationProviderMock = assumeMock(DomainVerificationProvider)
const getDomainFromEmailAddressMock = assumeMock(getDomainFromEmailAddress)

const integration = {
    id: 1,
    meta: {
        address: 'test@gorgias.com',
    },
} as EmailIntegration

jest.mock('../VerifyDomainModal', () => () => <div>VerifyDomainModal</div>)

describe('EmailDomainVerification', () => {
    const renderComponent = () =>
        render(<EmailDomainVerification integration={integration} />)

    beforeEach(() => {
        EmailDomainVerificationContentMock.mockImplementation(() => (
            <div>Content</div>
        ))
        EmailDomainVerificationActionButtonsMock.mockImplementation(() => (
            <div>ActionButtons</div>
        ))
        DomainVerificationProviderMock.mockImplementation(
            ({ children }: any) => (
                <div>
                    <div>DomainVerificationProvider</div>
                    {children}
                </div>
            ),
        )
    })

    it('should render content and sidebar', () => {
        getDomainFromEmailAddressMock.mockReturnValue('gorgias.com')

        renderComponent()

        expect(
            screen.getByText('DomainVerificationProvider'),
        ).toBeInTheDocument()
        expect(screen.getByText('Content')).toBeInTheDocument()
        expect(screen.getByText('ActionButtons')).toBeInTheDocument()
        expect(EmailDomainVerificationContentMock).toHaveBeenLastCalledWith(
            {
                integration,
            },
            {},
        )
        expect(
            EmailDomainVerificationActionButtonsMock,
        ).toHaveBeenLastCalledWith(
            {
                integration,
            },
            {},
        )
        expect(DomainVerificationProviderMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                domainName: 'gorgias.com',
            }),
            {},
        )
        expect(screen.getByText('SidebarContent')).toBeInTheDocument()
        expect(screen.getByText('VerifyDomainModal')).toBeInTheDocument()
    })
})
