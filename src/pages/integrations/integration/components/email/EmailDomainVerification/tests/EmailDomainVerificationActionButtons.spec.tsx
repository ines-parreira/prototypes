import {EmailIntegration} from '@gorgias/api-queries'
import {screen, render, fireEvent, act} from '@testing-library/react'
import React from 'react'

import {assumeMock} from 'utils/testing'

import useEmailIntegration from '../../useEmailIntegration'
import EmailDomainVerificationActionButtons from '../EmailDomainVerificationActionButtons'
import useDomainVerification from '../useDomainVerification'

jest.mock('../useDomainVerification')
jest.mock('../../useEmailIntegration')

const useDomainVerificationMock = assumeMock(useDomainVerification)
const useEmailIntegrationMock = assumeMock(useEmailIntegration)

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
            />
        )

    beforeEach(() => {
        useDomainVerificationMock.mockReturnValue({
            domain: undefined,
        } as ReturnType<typeof useDomainVerification>)
        useEmailIntegrationMock.mockReturnValue({} as any)
    })

    it('should delete integration when delete button is clicked', () => {
        const deleteFn = jest.fn()
        useEmailIntegrationMock.mockReturnValue({
            deleteIntegration: deleteFn,
            isDeleting: false,
        } as any)
        useDomainVerificationMock.mockReturnValue({
            domain: {},
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
        } as any)

        renderComponent()

        act(() => {
            fireEvent.click(screen.getByText('Check status'))
        })

        expect(verifyDomainFn).toHaveBeenCalled()
    })

    describe('loading state', () => {
        it.each([
            [{domain: undefined, isCreatingDomain: true, isFetching: false}],
            [{domain: undefined, isCreatingDomain: false, isFetching: false}],
            [{domain: {}, isCreatingDomain: false, isFetching: true}],
        ])(
            'should disable buttons when domain creation is in progress or domain is being fetched',
            (useDomainVerificationState) => {
                const verifyDomainFn = jest.fn()
                useDomainVerificationMock.mockReturnValue({
                    ...useDomainVerificationState,
                    verifyDomain: verifyDomainFn,
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
            }
        )
    })
})
