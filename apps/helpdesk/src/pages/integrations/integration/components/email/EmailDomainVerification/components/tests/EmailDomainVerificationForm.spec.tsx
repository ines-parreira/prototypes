import type { ComponentProps } from 'react'
import React from 'react'

import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { mockUpdateEmailIntegrationDomainHandler } from '@gorgias/helpdesk-mocks'

import * as helpers from '../../../helpers'
import { EmailDomainVerificationForm } from '../EmailDomainVerificationForm'

const updateDomainMock = mockUpdateEmailIntegrationDomainHandler()
const server = setupServer(updateDomainMock.handler)

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

    beforeAll(() => {
        server.listen({ onUnhandledRequest: 'error' })
    })

    afterEach(() => {
        server.resetHandlers()
    })

    afterAll(() => {
        server.close()
    })

    it('should render the form', () => {
        renderComponent()

        expect(screen.getByText('DKIM key size')).toBeInTheDocument()
        expect(screen.getByText('Add Domain')).toBeInTheDocument()
    })

    it('should trigger a create request when clicking on Add Domain', async () => {
        const user = userEvent.setup()
        const waitForUpdateDomainRequest =
            updateDomainMock.waitForRequest(server)
        renderComponent()

        await user.click(screen.getByText('Add Domain'))

        await waitForUpdateDomainRequest(async (request) => {
            expect(new URL(request.url).pathname).toBe(
                '/api/integrations/domains/gorgias.com',
            )
            await expect(request.json()).resolves.toEqual({
                dkim_key_size: 1024,
            })
        })
    })

    it('should display a default error message if the domain verification fails', async () => {
        const user = userEvent.setup()
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

        server.use(
            mockUpdateEmailIntegrationDomainHandler(async () =>
                HttpResponse.json(null as never, { status: 500 }),
            ).handler,
        )

        expect(screen.getByText('1024')).toBeInTheDocument()

        await user.click(screen.getByText('Add Domain'))

        await waitFor(() => {
            const toast = screen.getByRole('status')
            expect(toast).toHaveTextContent('Failed to create domain')
            expect(toast).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('should display the backend provided error message if the domain verification fails', async () => {
        const user = userEvent.setup()
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

        server.use(
            mockUpdateEmailIntegrationDomainHandler(async () =>
                HttpResponse.json(
                    { error: { msg: 'Domain already exists' } } as never,
                    { status: 400 },
                ),
            ).handler,
        )

        expect(screen.getByText('1024')).toBeInTheDocument()

        await user.click(screen.getByText('Add Domain'))

        await waitFor(() => {
            const toast = screen.getByRole('status')
            expect(toast).toHaveTextContent('Domain already exists')
            expect(toast).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('should render with a default key size for Sendgrid', async () => {
        const user = userEvent.setup()
        const waitForUpdateDomainRequest =
            updateDomainMock.waitForRequest(server)
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

        await user.click(screen.getByText('Add Domain'))
        await waitForUpdateDomainRequest(async (request) => {
            expect(new URL(request.url).pathname).toBe(
                '/api/integrations/domains/acme.com',
            )
            await expect(request.json()).resolves.toEqual({
                dkim_key_size: 1024,
            })
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
