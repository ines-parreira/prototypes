import React from 'react'

import { assumeMock } from '@repo/testing'
import { act, render, screen } from '@testing-library/react'

import { SelectField } from '@gorgias/axiom'

import EmailDomainVerificationSupportContentSidebar from '../EmailDomainVerificationSupportContentSidebar'
import SupportContentLearnMore from '../SupportContentLearnMore'

jest.mock('@gorgias/axiom')
jest.mock('../SupportContentLearnMore')
jest.mock('../useDomainVerification')

const SupportContentLearnMoreMock = assumeMock(SupportContentLearnMore)
const SelectFieldMock = assumeMock(SelectField)

describe('EmailDomainVerificationSupportContentSidebar', () => {
    const renderComponent = () =>
        render(<EmailDomainVerificationSupportContentSidebar />)

    beforeEach(() => {
        SelectFieldMock.mockReturnValue(<div>SelectField</div>)
        SupportContentLearnMoreMock.mockImplementation(({ children }) => (
            <div data-testid="supportContentLearnMore">{children}</div>
        ))
    })

    it('default state - should display dropdown, dynamic content and links', () => {
        const { container } = renderComponent()

        expect(screen.getByText('SelectField')).toBeInTheDocument()
        expect(
            container.querySelector(
                '[data-candu-id=email-domain-verification-support-content-default]',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByText('Identify Your Domain Registrar'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Adding values to a Domain Registrar'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Email Domain Verification 101'),
        ).toBeInTheDocument()
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
            screen.queryByText('Identify Your Domain Registrar'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('Adding values to a Domain Registrar'),
        ).not.toBeInTheDocument()

        expect(screen.getByText('GoDaddy Support')).toBeInTheDocument()
        expect(
            container.querySelector(
                '[data-candu-id=email-domain-verification-support-content-godaddy]',
            ),
        ).toBeInTheDocument()
    })

    it('should display all options in the dropdown', () => {
        renderComponent()

        expect(SelectFieldMock.mock.calls[0][0].options).toHaveLength(11)
    })
})
