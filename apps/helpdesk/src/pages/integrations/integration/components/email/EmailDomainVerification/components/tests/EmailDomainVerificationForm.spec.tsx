import type { ComponentProps } from 'react'
import React from 'react'

import { assumeMock, render } from '@repo/testing'
import { fireEvent, screen, waitFor } from '@testing-library/react'

import { updateEmailIntegrationDomain } from '@gorgias/helpdesk-client'

import * as helpers from '../../../helpers'
import { EmailDomainVerificationForm } from '../EmailDomainVerificationForm'

jest.mock('@gorgias/helpdesk-client')

const updateDomainMock = assumeMock(updateEmailIntegrationDomain)

describe('<EmailDomainVerificationForm/>', () => {
    const minProps: ComponentProps<typeof EmailDomainVerificationForm> = {
        integration: {
            id: 1,
            meta: {
                address: 'test@gorgias.com',
            },
        } as any,
        loading: {},
    }

    const renderComponent = (props = {}) =>
        render(<EmailDomainVerificationForm {...minProps} {...props} />)

    it('should render the form', () => {
        renderComponent()

        expect(screen.getByText('DKIM key size')).toBeInTheDocument()
        expect(screen.getByText('Add Domain')).toBeInTheDocument()
    })

    it('should trigger a create request when clicking on Add Domain', async () => {
        renderComponent()

        fireEvent.click(screen.getByText('Add Domain'))

        await waitFor(() => {
            expect(updateDomainMock).toHaveBeenCalledWith(
                'gorgias.com',
                { dkim_key_size: 1024 },
                undefined,
            )
        })
    })

    it('should display a default error message if the domain verification fails', async () => {
        renderComponent({
            ...minProps,
            integration: {
                ...minProps.integration,
                meta: {
                    address: 'alice@acme.com',
                    provider: 'mailgun',
                },
            },
        })

        updateDomainMock.mockReturnValue(Promise.reject())

        expect(screen.getByText('1024')).toBeInTheDocument()

        fireEvent.click(screen.getByText('Add Domain'))

        await waitFor(() => {
            expect(updateDomainMock).toHaveBeenCalledWith(
                'acme.com',
                { dkim_key_size: 1024 },
                undefined,
            )
        })

        await waitFor(() => {
            const toast = screen.getByRole('status')
            expect(toast).toHaveTextContent('Failed to create domain')
            expect(toast).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('should display the backend provided error message if the domain verification fails', async () => {
        renderComponent({
            ...minProps,
            integration: {
                ...minProps.integration,
                meta: {
                    address: 'alice@acme.com',
                    provider: 'mailgun',
                },
            },
        })

        updateDomainMock.mockReturnValue(
            Promise.reject({
                isAxiosError: true,
                response: { data: { error: { msg: 'Domain already exists' } } },
            }),
        )

        expect(screen.getByText('1024')).toBeInTheDocument()

        fireEvent.click(screen.getByText('Add Domain'))

        await waitFor(() => {
            expect(updateDomainMock).toHaveBeenCalledWith(
                'acme.com',
                { dkim_key_size: 1024 },
                undefined,
            )
        })

        await waitFor(() => {
            const toast = screen.getByRole('status')
            expect(toast).toHaveTextContent('Domain already exists')
            expect(toast).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('should render with a default key size for Sendgrid', async () => {
        renderComponent({
            ...minProps,
            integration: {
                ...minProps.integration,
                meta: {
                    address: 'alice@acme.com',
                    provider: 'sendgrid',
                },
            },
        })

        expect(screen.getByText('1024 (Default)')).toBeInTheDocument()

        fireEvent.click(screen.getByText('Add Domain'))
        await waitFor(() => {
            expect(updateDomainMock).toHaveBeenCalledWith(
                'acme.com',
                { dkim_key_size: 1024 },
                undefined,
            )
        })
    })

    it('should not break rendering if the provider is undefined', () => {
        renderComponent({
            ...minProps,
            integration: {
                ...minProps.integration,
                meta: {
                    address: 'alice@acme.com',
                    provider: undefined,
                },
            },
        })

        expect(screen.getByText('1024')).toBeInTheDocument()
    })

    it('should not break rendering when the address is not defined', () => {
        const getDomainAddressMock = jest.spyOn(
            helpers,
            'getDomainFromEmailAddress',
        )
        renderComponent({
            ...minProps,
            integration: {
                ...minProps.integration,
                meta: {
                    address: undefined,
                },
            },
        })
        expect(getDomainAddressMock).toHaveBeenCalledWith('')
    })
})
