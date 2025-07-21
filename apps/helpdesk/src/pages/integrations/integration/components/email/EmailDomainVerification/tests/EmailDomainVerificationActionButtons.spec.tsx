import React from 'react'

import { act, fireEvent, render, screen } from '@testing-library/react'

import { EmailIntegration } from '@gorgias/helpdesk-queries'

import { assumeMock } from 'utils/testing'

import useDeleteEmailIntegration from '../../useDeleteEmailIntegration'
import EmailDomainVerificationActionButtons from '../EmailDomainVerificationActionButtons'
import useDomainVerification from '../useDomainVerification'

jest.mock('../useDomainVerification')
jest.mock('../../useDeleteEmailIntegration')

const useDomainVerificationMock = assumeMock(useDomainVerification)
const useDeleteEmailIntegrationMock = assumeMock(useDeleteEmailIntegration)

describe('EmailDomainVerificationActionButtons', () => {
    const renderComponent = () =>
        render(
            <EmailDomainVerificationActionButtons
                integration={
                    {
                        id: 1,
                        meta: {
                            address: 'test@gorgias.com',
                        },
                    } as EmailIntegration
                }
            />,
        )

    beforeEach(() => {
        useDomainVerificationMock.mockReturnValue({
            domain: undefined,
            errors: { createDomain: null },
        } as ReturnType<typeof useDomainVerification>)
        useDeleteEmailIntegrationMock.mockReturnValue({} as any)
    })

    it('should delete integration when delete button is clicked', () => {
        const deleteFn = jest.fn()
        useDeleteEmailIntegrationMock.mockReturnValue({
            deleteIntegration: deleteFn,
            isDeleting: false,
        } as any)
        useDomainVerificationMock.mockReturnValue({
            domain: {},
            errors: { createDomain: null },
        } as ReturnType<typeof useDomainVerification>)

        renderComponent()

        act(() => {
            fireEvent.click(screen.getByText('Delete integration'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Confirm'))
        })

        expect(deleteFn).toHaveBeenCalled()
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

    describe('domain creation error state', () => {
        it('should render correct href for contact support button', () => {
            useDomainVerificationMock.mockReturnValue({
                errors: { createDomain: true },
            } as any)
            renderComponent()

            expect(screen.getByText('Contact support')).toHaveAttribute(
                'href',
                'mailto:support@gorgias.com',
            )
        })

        it('should render correct link for close button', () => {
            useDomainVerificationMock.mockReturnValue({
                errors: { createDomain: true },
            } as any)

            renderComponent()

            expect(screen.getByText('Close').closest('a')).toHaveAttribute(
                'to',
                '/app/settings/channels/email',
            )
        })
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

                act(() => {
                    fireEvent.click(screen.getByText('Delete integration'))
                })

                expect(screen.queryByText('Confirm')).not.toBeInTheDocument()
            },
        )
    })
})
