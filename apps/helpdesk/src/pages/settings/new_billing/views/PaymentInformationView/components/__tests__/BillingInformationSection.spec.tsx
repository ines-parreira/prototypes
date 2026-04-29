import client from '@repo/api-resources'
import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, render } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MockAdapter from 'axios-mock-adapter'

import { billingContact } from 'fixtures/resources'
import { BillingInformationSection } from 'pages/settings/new_billing/views/PaymentInformationView/components/BillingInformationSection'

jest.mock('@repo/logging')
const logEventMock = assumeMock(logEvent)
const mockedServer = new MockAdapter(client)
describe('BillingInformationSection', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        logEventMock.mockClear()
        mockedServer.onGet('/api/billing/contact/').reply(200, billingContact)
    })
    describe('nominal case', () => {
        it('should render', async () => {
            render(<BillingInformationSection />, {})
            expect(screen.getByText('Billing information')).toBeVisible()
            await waitFor(() => {
                expect(screen.getByText('Organization name:')).toBeVisible()
                expect(screen.getByText('Update Information')).toBeVisible()
            })
        })
        describe("when there's no address information", () => {
            beforeEach(() => {
                mockedServer.onGet('/api/billing/contact/').reply(200, {
                    ...billingContact,
                    shipping: {
                        ...billingContact.shipping,
                        address: {
                            line1: '',
                            line2: '',
                            state: '',
                            city: '',
                            country: '',
                            postal_code: '',
                        },
                        name: '',
                        phone: null,
                    },
                })
            })
            it('should render', async () => {
                render(<BillingInformationSection />, {})
                expect(screen.getByText('Billing information')).toBeVisible()
                await waitFor(() => {
                    expectEmptyValues(4)
                    expect(screen.getByText('Add Information')).toBeVisible()
                    expect(screen.getByText('Sales Tax ID:')).toBeVisible()
                })
            })
        })
    })
    describe('BillingPaymentInformationUpdateInformationClicked tracking', () => {
        it('should track event when "Update Information" link is clicked', async () => {
            render(<BillingInformationSection />, {})
            const link = await screen.findByText('Update Information')
            expect(link).toHaveAttribute(
                'href',
                '/app/settings/billing/payment/billing-information',
            )
            logEventMock.mockClear()
            await act(() => userEvent.click(link))
            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.BillingPaymentInformationUpdateInformationClicked,
            )
            expect(logEventMock).toHaveBeenCalledTimes(1)
        })
        it('should track event when "Add Information" link is clicked', async () => {
            mockedServer.onGet('/api/billing/contact/').reply(200, {
                email: 'example@gorgias.com',
                shipping: {
                    address: {
                        city: '',
                        country: '',
                        postal_code: '',
                        line1: '',
                        line2: '',
                        state: '',
                    },
                    name: '',
                    phone: null,
                },
            })
            render(<BillingInformationSection />, {})
            const link = await screen.findByText('Add Information')
            expect(link).toHaveAttribute(
                'href',
                '/app/settings/billing/payment/billing-information',
            )
            logEventMock.mockClear()
            await act(() => userEvent.click(link))
            expect(logEventMock).toHaveBeenCalledWith(
                SegmentEvent.BillingPaymentInformationUpdateInformationClicked,
            )
            expect(logEventMock).toHaveBeenCalledTimes(1)
        })
    })
})
const getAllEmptyValues = () => screen.getAllByText('-')
const expectEmptyValues = (quantity: number) => {
    expect(getAllEmptyValues()).toHaveLength(quantity)
}
