import {screen, waitFor} from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'

import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'

import {FeatureFlagKey} from 'config/featureFlags'
import client from 'models/api/resources'
import {BillingInformationSection} from 'pages/settings/new_billing/views/PaymentInformationView/components/BillingInformationSection'
import {renderWithQueryClientProvider} from 'tests/reactQueryTestingUtils'

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

    describe('when the billing-tax-id-field feature flag is disabled', () => {
        it('should render', async () => {
            renderWithQueryClientProvider(<BillingInformationSection />)

            expect(screen.getByText('Billing address')).toBeVisible()

            await waitFor(() => {
                expect(screen.getByText('Company name:')).toBeVisible()
                expect(screen.getByText('Update address')).toBeVisible()
            })
        })
    })

    describe('when the billing-tax-id-field feature flag is enabled', () => {
        beforeEach(() => {
            mockFlags({
                [FeatureFlagKey.BillingTaxIdField]: true,
            })
        })

        it('should render', async () => {
            renderWithQueryClientProvider(<BillingInformationSection />)

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
                        phone: '',
                    },
                })
            })

            it('should render', async () => {
                renderWithQueryClientProvider(<BillingInformationSection />)

                expect(screen.getByText('Billing information')).toBeVisible()

                await waitFor(() => {
                    expect(screen.getAllByText('-')).toHaveLength(3)
                    expect(screen.getByText('Add Information')).toBeVisible()
                })
            })
        })
    })
})
