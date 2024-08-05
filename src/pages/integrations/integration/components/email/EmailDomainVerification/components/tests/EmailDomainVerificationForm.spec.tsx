import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'

import {QueryClientProvider} from '@tanstack/react-query'
import {fireEvent, render, screen} from '@testing-library/react'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import EmailDomainVerificationForm from '../EmailDomainVerificationForm'
import * as helpers from '../../../helpers'

const queryClient = mockQueryClient()
const mockUpdate = jest.fn()

jest.mock('@gorgias/api-queries', () => ({
    useUpdateEmailIntegrationDomain: () => ({mutate: mockUpdate}),
}))

describe('<EmailDomainVerificationForm/>', () => {
    const minProps: ComponentProps<typeof EmailDomainVerificationForm> = {
        integration: {
            id: 1,
            meta: {
                address: 'test@gorgias.com',
            },
        } as any,
        loading: fromJS({}),
    }

    const renderComponent = (props = {}) =>
        render(
            <QueryClientProvider client={queryClient}>
                <EmailDomainVerificationForm {...minProps} {...props} />
            </QueryClientProvider>
        )

    it('should render the form', () => {
        renderComponent()

        expect(screen.getByText('DKIM key size')).toBeInTheDocument()
        expect(screen.getByText('Add Domain')).toBeInTheDocument()
    })

    it('should trigger a create request when clicking on Add Domain', () => {
        renderComponent()

        fireEvent.click(screen.getByText('Add Domain'))

        expect(mockUpdate).toHaveBeenCalledWith({
            domainName: 'gorgias.com',
            data: {dkim_key_size: 1024},
        })
    })

    it('should render with a default key size for Sendgrid', () => {
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
        expect(mockUpdate).toHaveBeenCalledWith({
            domainName: 'acme.com',
            data: {dkim_key_size: 1024},
        })
    })

    it('should not break rendering when the address is not defined', () => {
        const getDomainAddressMock = jest.spyOn(
            helpers,
            'getDomainFromEmailAddress'
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
