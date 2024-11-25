import {EmailIntegration} from '@gorgias/api-queries'
import {render, screen} from '@testing-library/react'
import React from 'react'

import {assumeMock} from 'utils/testing'

import EmailDomainVerification from '../EmailDomainVerification'
import EmailDomainVerificationContent from '../EmailDomainVerificationContent'

jest.mock('../EmailDomainVerificationSupportContent', () => () => (
    <div>SidebarContent</div>
))
jest.mock('../EmailDomainVerificationContent')

const EmailDomainVerificationContentMock = assumeMock(
    EmailDomainVerificationContent
)

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
    })

    it('should render content and sidebar', () => {
        renderComponent()

        expect(screen.getByText('Content')).toBeInTheDocument()
        expect(EmailDomainVerificationContentMock).toHaveBeenLastCalledWith(
            expect.objectContaining({
                displayButtons: true,
                integration,
            }),
            {}
        )
        expect(screen.getByText('SidebarContent')).toBeInTheDocument()
        expect(screen.getByText('VerifyDomainModal')).toBeInTheDocument()
    })
})
