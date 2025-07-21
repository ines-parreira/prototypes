import React from 'react'

import { act, fireEvent, render, screen } from '@testing-library/react'

import { assumeMock } from 'utils/testing'

import OnboardingDomainVerificationButtons from '../CustomerOnboarding/OnboardingDomainVerificationButtons'
import useDomainVerification from '../EmailDomainVerification/useDomainVerification'
import useDeleteEmailIntegration from '../useDeleteEmailIntegration'

jest.mock('../EmailDomainVerification/useDomainVerification')
jest.mock('../useDeleteEmailIntegration')
jest.mock('../hooks/useEmailOnboarding', () => ({
    listUrl: () => '/list',
}))

const useDomainVerificationMock = assumeMock(useDomainVerification)
const useDeleteEmailIntegrationMock = assumeMock(useDeleteEmailIntegration)

describe('OnboardingDomainVerificationButtons', () => {
    const renderComponent = () =>
        render(<OnboardingDomainVerificationButtons />)

    beforeEach(() => {
        useDomainVerificationMock.mockReturnValue({
            domain: undefined,
            errors: { createDomain: null },
        } as ReturnType<typeof useDomainVerification>)
        useDeleteEmailIntegrationMock.mockReturnValue({} as any)
    })

    it('should check status when "check status" button is clicked', () => {
        const verifyDomainFn = jest.fn()
        useDomainVerificationMock.mockReturnValue({
            domain: {},
            verifyDomain: verifyDomainFn,
            isVerifying: false,
            isPending: false,
            errors: { createDomain: null },
        } as any)

        renderComponent()

        act(() => {
            fireEvent.click(screen.getByText('Check status'))
        })

        expect(verifyDomainFn).toHaveBeenCalled()
    })

    it('should show "Contact support" button when domain creation error is present', () => {
        useDomainVerificationMock.mockReturnValue({
            errors: { createDomain: 'error' },
        } as any)

        renderComponent()

        const button = screen.getByText('Contact support')
        expect(button).toBeInTheDocument()
        expect(button.closest('a')).toHaveAttribute(
            'href',
            'mailto:support@gorgias.com',
        )
    })

    describe('loading state', () => {
        it.each([
            [{ domain: undefined, isCreatingDomain: true, isFetching: false }],
            [{ domain: undefined, isCreatingDomain: false, isFetching: false }],
            [{ domain: {}, isCreatingDomain: false, isFetching: true }],
        ])(
            'should disable buttons when domain creation is in progress or domain is being fetched',
            (useDomainVerificationState) => {
                const verifyDomainFn = jest.fn()
                useDomainVerificationMock.mockReturnValue({
                    ...useDomainVerificationState,
                    verifyDomain: verifyDomainFn,
                    errors: { createDomain: null },
                } as any)

                renderComponent()

                act(() => {
                    fireEvent.click(screen.getByText('Check status'))
                })

                expect(verifyDomainFn).not.toHaveBeenCalled()
            },
        )
    })
})
