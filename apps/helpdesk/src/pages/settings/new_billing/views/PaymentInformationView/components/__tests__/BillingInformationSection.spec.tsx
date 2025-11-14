import { screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import { MemoryRouter } from 'react-router-dom'

import client from 'models/api/resources'
import { BillingInformationSection } from 'pages/settings/new_billing/views/PaymentInformationView/components/BillingInformationSection'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'

const mockedServer = new MockAdapter(client)

describe('BillingInformationSection', () => {
    beforeEach(() => {
        mockedServer.onGet('/api/billing/contact/').reply(200, {
            email: 'example@gorgias.com',
            shipping: {
                name: 'Gorgias',
                phone: '+3301234567',
                address: {
                    line1: '1234 Main St',
                    line2: 'Apt 1',
                    city: 'Paris',
                    state: 'Ile de France',
                    postal_code: '75001',
                    country: 'FR',
                },
            },
        })
    })

    describe('nominal case', () => {
        it('should render', async () => {
            renderWithQueryClientProvider(
                <MemoryRouter>
                    <BillingInformationSection />
                </MemoryRouter>,
            )

            expect(screen.getByText('Billing information')).toBeVisible()

            await waitFor(() => {
                expect(screen.getByText('Organization name:')).toBeVisible()
                expect(screen.getByText('Update Information')).toBeVisible()
            })
        })

        describe("when there's no address information", () => {
            beforeEach(() => {
                mockedServer.onGet('/api/billing/contact/').reply(200, {
                    email: 'example@gorgias.com',
                    shipping: {
                        address: {
                            line2: '',
                            state: '',
                        },
                        name: '',
                        phone: null,
                    },
                })
            })

            it('should render', async () => {
                renderWithQueryClientProvider(
                    <MemoryRouter>
                        <BillingInformationSection />
                    </MemoryRouter>,
                )

                expect(screen.getByText('Billing information')).toBeVisible()

                await waitFor(() => {
                    expectEmptyValues(4)
                    expect(screen.getByText('Add Information')).toBeVisible()
                    expect(screen.getByText('Sales Tax ID:')).toBeVisible()
                })
            })
        })
    })
})

const getAllEmptyValues = () => screen.getAllByText('-')

const expectEmptyValues = (quantity: number) => {
    expect(getAllEmptyValues()).toHaveLength(quantity)
}
