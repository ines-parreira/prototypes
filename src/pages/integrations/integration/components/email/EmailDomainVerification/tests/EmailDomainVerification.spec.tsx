import {render, screen} from '@testing-library/react'
import React from 'react'

import EmailDomainVerification from '../EmailDomainVerification'

jest.mock('../EmailDomainVerificationSupportContent', () => () => (
    <div>SidebarContent</div>
))

describe('EmailDomainVerification', () => {
    const renderComponent = () => render(<EmailDomainVerification />)

    it('should render content and sidebar', () => {
        renderComponent()

        expect(screen.getByText('Domain verification')).toBeInTheDocument()
        expect(screen.getByText('SidebarContent')).toBeInTheDocument()
    })
})
