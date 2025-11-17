import type { ComponentProps } from 'react'
import React from 'react'

import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { updateEmailIntegrationDomain } from '@gorgias/helpdesk-client'

import useAppDispatch from 'hooks/useAppDispatch'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import * as helpers from '../../../helpers'
import EmailDomainVerificationForm from '../EmailDomainVerificationForm'

const queryClient = mockQueryClient()
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([])

jest.mock('hooks/useAppDispatch')
jest.mock('state/notifications/actions')
jest.mock('@gorgias/helpdesk-client')

const notifyMock = assumeMock(notify)
const useAppDispatchMock = assumeMock(useAppDispatch)
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
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore({})}>
                    <EmailDomainVerificationForm {...minProps} {...props} />
                </Provider>
            </QueryClientProvider>,
        )

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

        const dispatchMock = jest.fn()
        useAppDispatchMock.mockReturnValue(dispatchMock)
        updateDomainMock.mockReturnValue(Promise.reject())

        expect(screen.getByText('1024')).toBeInTheDocument()

        fireEvent.click(screen.getByText('Add Domain'))

        await waitFor(() => {
            expect(updateDomainMock).toHaveBeenCalledWith(
                'acme.com',
                { dkim_key_size: 1024 },
                undefined,
            )

            expect(notifyMock).toHaveBeenCalledWith({
                message: 'Failed to create domain',
                status: NotificationStatus.Error,
            })
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

            expect(notifyMock).toHaveBeenCalledWith({
                message: 'Domain already exists',
                status: NotificationStatus.Error,
            })
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
