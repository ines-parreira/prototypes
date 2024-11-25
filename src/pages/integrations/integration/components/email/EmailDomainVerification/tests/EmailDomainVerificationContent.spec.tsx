import {EmailIntegration} from '@gorgias/api-queries'
import {screen, render, fireEvent} from '@testing-library/react'
import React, {ComponentProps} from 'react'

import * as integrationsSelectors from 'state/integrations/selectors'
import {assumeMock} from 'utils/testing'

import {getDomainFromEmailAddress, isBaseEmailAddress} from '../../helpers'
import useEmailIntegration from '../../useEmailIntegration'
import RecordsTable from '../components/RecordsTable'
import EmailDomainVerificationContent from '../EmailDomainVerificationContent'
import {useDomainVerification} from '../useDomainVerification'

jest.mock('hooks/useAppSelector')
jest.mock('../../helpers')
jest.mock('../components/RecordsTable')
jest.mock('../useDomainVerification')
jest.mock('../../useEmailIntegration')

const getDomainFromEmailAddressMock = assumeMock(getDomainFromEmailAddress)
const isBaseEmailAddressMock = assumeMock(isBaseEmailAddress)
const useDomainVerificationMock = assumeMock(useDomainVerification)
const RecordsTableMock = assumeMock(RecordsTable)
const useEmailIntegrationMock = assumeMock(useEmailIntegration)
const getIntegrationsLoadingSpy = jest.spyOn(
    integrationsSelectors,
    'getIntegrationsLoading'
)

describe('EmailDomainVerificationContent', () => {
    const renderComponent = (
        props?: Partial<ComponentProps<typeof EmailDomainVerificationContent>>
    ) =>
        render(
            <EmailDomainVerificationContent
                integration={
                    {
                        id: 1,
                        meta: {
                            address: 'test@gorgias.com',
                        },
                    } as EmailIntegration
                }
                displayButtons={props?.displayButtons}
            />
        )

    beforeEach(() => {
        isBaseEmailAddressMock.mockReturnValue(false)
        RecordsTableMock.mockImplementation(() => <div>RecordsTable</div>)
        useDomainVerificationMock.mockReturnValue({
            domain: undefined,
        } as ReturnType<typeof useDomainVerification>)
        useEmailIntegrationMock.mockReturnValue({} as any)
        getIntegrationsLoadingSpy.mockImplementation(() => ({
            integration: false,
        }))
    })

    it('should display base email integration alert', () => {
        isBaseEmailAddressMock.mockReturnValue(true)

        renderComponent()

        expect(
            screen.getByText(
                'The base email integration cannot have a domain associated.'
            )
        ).toBeInTheDocument()
    })

    it('should pass correct params to useDomainVerification', () => {
        getDomainFromEmailAddressMock.mockReturnValue('gorgias.com')
        renderComponent()

        expect(useDomainVerificationMock).toHaveBeenCalledWith('gorgias.com', {
            shouldCreateDomain: true,
        })
    })

    it('should not display buttons when displayButtons is false', () => {
        renderComponent({
            displayButtons: false,
        })

        expect(screen.queryByText('Verify domain')).not.toBeInTheDocument()
        expect(screen.queryByText('Delete integration')).not.toBeInTheDocument()
    })

    it('should delete integration when delete button is clicked', () => {
        const deleteFn = jest.fn()
        useEmailIntegrationMock.mockReturnValue({
            deleteIntegration: deleteFn,
            isDeleting: false,
        } as any)

        renderComponent({displayButtons: true})

        fireEvent.click(screen.getByText('Delete integration'))
        fireEvent.click(screen.getByText('Confirm'))

        expect(deleteFn).toHaveBeenCalled()
    })

    it('should check status when "check status" button is clicked', () => {
        const verifyDomainFn = jest.fn()
        useDomainVerificationMock.mockReturnValue({
            verifyDomain: verifyDomainFn,
            isVerifying: false,
            isPending: false,
        } as any)

        renderComponent({displayButtons: true})

        fireEvent.click(screen.getByText('Check status'))

        expect(verifyDomainFn).toHaveBeenCalled()
    })

    it('should pass domain to RecordsTable', () => {
        useDomainVerificationMock.mockReturnValue({
            domain: {name: 'gorgias.com'},
        } as ReturnType<typeof useDomainVerification>)

        renderComponent()

        expect(RecordsTableMock).toHaveBeenCalledWith(
            expect.objectContaining({domainName: 'gorgias.com'}),
            {}
        )
    })

    describe('loading state', () => {
        it('should display loading state when domain creation is in progress', () => {
            useDomainVerificationMock.mockReturnValue({
                domain: undefined,
                isCreatingDomain: true,
            } as ReturnType<typeof useDomainVerification>)

            renderComponent()

            expect(RecordsTableMock).toHaveBeenCalledWith(
                expect.objectContaining({isLoading: true}),
                {}
            )
        })

        it('should display loading state when integration is loading', () => {
            getIntegrationsLoadingSpy.mockImplementation(() => ({
                integration: true,
            }))

            renderComponent()

            expect(RecordsTableMock).toHaveBeenCalledWith(
                expect.objectContaining({isLoading: true}),
                {}
            )
        })

        it('should display loading state when domain is not fetched', () => {
            useDomainVerificationMock.mockReturnValue({
                domain: undefined,
            } as ReturnType<typeof useDomainVerification>)

            renderComponent()

            expect(RecordsTableMock).toHaveBeenCalledWith(
                expect.objectContaining({isLoading: true}),
                {}
            )
        })

        it('should display loading state when domain is being fetched', () => {
            useDomainVerificationMock.mockReturnValue({
                domain: undefined,
                isFetching: true,
            } as ReturnType<typeof useDomainVerification>)

            renderComponent()

            expect(RecordsTableMock).toHaveBeenCalledWith(
                expect.objectContaining({isLoading: true}),
                {}
            )
        })
    })
})
