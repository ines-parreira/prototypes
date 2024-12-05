import {EmailIntegration} from '@gorgias/api-queries'
import {screen, render} from '@testing-library/react'
import React from 'react'

import * as integrationsSelectors from 'state/integrations/selectors'
import {assumeMock} from 'utils/testing'

import {isBaseEmailAddress} from '../../helpers'
import RecordsTable from '../components/RecordsTable'
import EmailDomainVerificationContent from '../EmailDomainVerificationContent'
import useDomainVerification from '../useDomainVerification'

jest.mock('hooks/useAppSelector')
jest.mock('../../helpers')
jest.mock('../components/RecordsTable')
jest.mock('../useDomainVerification')

const isBaseEmailAddressMock = assumeMock(isBaseEmailAddress)
const useDomainVerificationMock = assumeMock(useDomainVerification)
const RecordsTableMock = assumeMock(RecordsTable)
const getIntegrationsLoadingSpy = jest.spyOn(
    integrationsSelectors,
    'getIntegrationsLoading'
)

describe('EmailDomainVerificationContent', () => {
    const renderComponent = () =>
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
            />
        )

    beforeEach(() => {
        isBaseEmailAddressMock.mockReturnValue(false)
        RecordsTableMock.mockImplementation(() => <div>RecordsTable</div>)
        useDomainVerificationMock.mockReturnValue({
            domain: undefined,
            errors: {createDomain: null},
        } as ReturnType<typeof useDomainVerification>)
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

    it('should pass domain to RecordsTable', () => {
        useDomainVerificationMock.mockReturnValue({
            domain: {name: 'gorgias.com'},
            errors: {createDomain: null},
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
                errors: {createDomain: null},
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
                errors: {createDomain: null},
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
                errors: {createDomain: null},
            } as ReturnType<typeof useDomainVerification>)

            renderComponent()

            expect(RecordsTableMock).toHaveBeenCalledWith(
                expect.objectContaining({isLoading: true}),
                {}
            )
        })
    })

    describe('success state', () => {
        it('should display success message when domain is verified', () => {
            useDomainVerificationMock.mockReturnValue({
                domain: {verified: true},
                errors: {createDomain: null},
            } as ReturnType<typeof useDomainVerification>)

            renderComponent()

            expect(
                screen.getByText(/Your domain has been successfully verified/)
            ).toBeInTheDocument()
        })
    })

    describe('error state', () => {
        it('should display error state when domain is not fetched and domain creation error is present', () => {
            useDomainVerificationMock.mockReturnValue({
                domain: undefined,
                errors: {createDomain: {message: 'error'}},
            } as ReturnType<typeof useDomainVerification>)

            renderComponent()

            expect(
                screen.getByText(/Please contact support for assistance/)
            ).toBeInTheDocument()
        })
    })
})
