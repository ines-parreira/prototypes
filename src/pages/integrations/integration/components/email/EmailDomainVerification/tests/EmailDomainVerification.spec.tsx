import {render, screen} from '@testing-library/react'
import React from 'react'

import EmailDomainVerification from '../EmailDomainVerification'

jest.mock('../EmailDomainVerificationSupportContent', () => () => (
    <div>SidebarContent</div>
))

jest.mock('../VerifyDomainModal', () => () => <div>VerifyDomainModal</div>)

describe('EmailDomainVerification', () => {
    const renderComponent = () => render(<EmailDomainVerification />)

    it('should render content and sidebar', () => {
        renderComponent()

        expect(screen.getByText('Domain verification')).toBeInTheDocument()
        expect(screen.getByText('SidebarContent')).toBeInTheDocument()
        expect(screen.getByText('VerifyDomainModal')).toBeInTheDocument()
    })
})
