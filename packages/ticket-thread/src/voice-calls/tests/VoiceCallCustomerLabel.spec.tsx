import { screen, waitFor } from '@testing-library/react'
import { HttpResponse } from 'msw'

import { mockCustomer, mockGetCustomerHandler } from '@gorgias/helpdesk-mocks'

import { render } from '#tests/render.utils'
import { server } from '#tests/server'
import { VoiceCallCustomerLabel } from '#voice-calls/components/TicketThreadCallItem/components/VoiceCallCustomerLabel'

describe('VoiceCallCustomerLabel', () => {
    describe('when customer has a name', () => {
        beforeEach(() => {
            server.use(
                mockGetCustomerHandler(async () =>
                    HttpResponse.json(
                        mockCustomer({ id: 1, name: 'Jane Customer' }),
                    ),
                ).handler,
            )
        })

        it('renders customer name when loaded', async () => {
            render(<VoiceCallCustomerLabel customerId={1} />)

            await waitFor(() => {
                expect(screen.getByText('Jane Customer')).toBeInTheDocument()
            })
        })
    })

    describe('when customer has no name or email', () => {
        beforeEach(() => {
            server.use(
                mockGetCustomerHandler(async () =>
                    HttpResponse.json(
                        mockCustomer({ id: 2, name: null, email: null }),
                    ),
                ).handler,
            )
        })

        it('falls back to formatted phone number when customer has no name or email', async () => {
            render(
                <VoiceCallCustomerLabel
                    customerId={2}
                    phoneNumber="+12025551234"
                />,
            )

            await waitFor(() => {
                expect(screen.getByText('+1 202 555 1234')).toBeInTheDocument()
            })
        })
    })

    describe('when customer has no name, no email, and no phone number', () => {
        beforeEach(() => {
            server.use(
                mockGetCustomerHandler(async () =>
                    HttpResponse.json(
                        mockCustomer({ id: 3, name: null, email: null }),
                    ),
                ).handler,
            )
        })

        it('falls back to "Customer #N" when no name and no phone', async () => {
            render(<VoiceCallCustomerLabel customerId={3} />)

            await waitFor(() => {
                expect(screen.getByText('Customer #3')).toBeInTheDocument()
            })
        })
    })
})
