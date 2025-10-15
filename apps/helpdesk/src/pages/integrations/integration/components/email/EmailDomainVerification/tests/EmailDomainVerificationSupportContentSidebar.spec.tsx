import React from 'react'

import { assumeMock } from '@repo/testing'
import { act, render, screen } from '@testing-library/react'

import { LegacySelectField as SelectField } from '@gorgias/axiom'

import EmailDomainVerificationSupportContentSidebar from '../EmailDomainVerificationSupportContentSidebar'

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    LegacySelectField: jest.fn(),
}))

const SelectFieldMock = assumeMock(SelectField)

describe('EmailDomainVerificationSupportContentSidebar', () => {
    const renderComponent = () =>
        render(<EmailDomainVerificationSupportContentSidebar />)

    beforeEach(() => {
        SelectFieldMock.mockReturnValue(<div>SelectField</div>)
    })

    it('default state - should display dropdown, dynamic content and links', () => {
        const { container } = renderComponent()

        expect(screen.getByText('SelectField')).toBeInTheDocument()
        expect(
            container.querySelector(
                '[data-candu-id=email-domain-verification-support-content-default]',
            ),
        ).toBeInTheDocument()

        expect(screen.getByText('Verify Your Email Domain')).toBeInTheDocument()
        expect(screen.getByText('Domain Verification FAQs')).toBeInTheDocument()
    })

    it('should display dynamic content and links based on dropdown selection', () => {
        const { container } = renderComponent()

        act(() => {
            SelectFieldMock.mock.lastCall?.[0].onChange({
                value: 'godaddy',
                label: 'GoDaddy',
                learnMoreURL: 'https://www.godaddy.com/',
            })
        })

        expect(
            container.querySelector(
                '[data-candu-id=email-domain-verification-support-content-godaddy]',
            ),
        ).toBeInTheDocument()

        expect(screen.getByText('Verify Your Email Domain')).toBeInTheDocument()
        expect(screen.getByText('Domain Verification FAQs')).toBeInTheDocument()
    })

    it('should display all options in the dropdown', () => {
        renderComponent()

        expect(SelectFieldMock.mock.calls[0][0].options).toHaveLength(11)
    })
})
