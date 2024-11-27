import {SelectInput} from '@gorgias/merchant-ui-kit'
import {screen, render, act} from '@testing-library/react'
import React from 'react'

import {assumeMock} from 'utils/testing'

import EmailDomainVerificationSupportContentSidebar from '../EmailDomainVerificationSupportContentSidebar'
import SupportContentLearnMore from '../SupportContentLearnMore'
import useDomainVerification from '../useDomainVerification'

jest.mock('@gorgias/merchant-ui-kit')
jest.mock('../SupportContentLearnMore')
jest.mock('../useDomainVerification')

const SupportContentLearnMoreMock = assumeMock(SupportContentLearnMore)
const SelectInputMock = assumeMock(SelectInput)
const useDomainVerificationMock = assumeMock(useDomainVerification)

describe('EmailDomainVerificationSupportContentSidebar', () => {
    const renderComponent = () =>
        render(<EmailDomainVerificationSupportContentSidebar />)

    beforeEach(() => {
        SelectInputMock.mockReturnValue(<div>SelectInput</div>)
        SupportContentLearnMoreMock.mockImplementation(({children}) => (
            <div data-testid="supportContentLearnMore">{children}</div>
        ))
        useDomainVerificationMock.mockReturnValue({
            domainCreationError: null,
        } as ReturnType<typeof useDomainVerification>)
    })

    it('default state - should display dropdown, dynamic content and links', () => {
        const {container} = renderComponent()

        expect(screen.getByText('SelectInput')).toBeInTheDocument()
        expect(
            container.querySelector(
                '[data-candu-id=email-domain-verification-support-content-default]'
            )
        ).toBeInTheDocument()

        expect(
            screen.getByText('Identify Your Domain Registrar')
        ).toBeInTheDocument()
        expect(
            screen.getByText('Adding values to a Domain Registrar')
        ).toBeInTheDocument()
        expect(
            screen.getByText('Email Domain Verification 101')
        ).toBeInTheDocument()
        expect(screen.getByText('Domain Verification FAQs')).toBeInTheDocument()
    })

    it('should display dynamic content and links based on dropdown selection', () => {
        const {container} = renderComponent()

        act(() => {
            SelectInputMock.mock.lastCall?.[0].onChange({
                value: 'godaddy',
                label: 'GoDaddy',
                learnMoreURL: 'https://www.godaddy.com/',
            })
        })

        expect(
            screen.queryByText('Identify Your Domain Registrar')
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('Adding values to a Domain Registrar')
        ).not.toBeInTheDocument()

        expect(screen.getByText('GoDaddy Support')).toBeInTheDocument()
        expect(
            container.querySelector(
                '[data-candu-id=email-domain-verification-support-content-godaddy]'
            )
        ).toBeInTheDocument()
    })

    it('should display all options in the dropdown', () => {
        renderComponent()

        expect(SelectInputMock.mock.calls[0][0].options).toHaveLength(11)
    })
})
