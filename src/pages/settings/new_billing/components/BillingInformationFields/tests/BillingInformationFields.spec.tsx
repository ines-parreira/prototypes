import {AddressElement} from '@stripe/react-stripe-js'
import {StripeAddressElementChangeEvent} from '@stripe/stripe-js'
import {act, render, screen, waitFor} from '@testing-library/react'

import React from 'react'

import {Form} from 'components/Form/Form'
import {BillingInformationFields} from 'pages/settings/new_billing/components/BillingInformationFields/BillingInformationFields'
import {VATCountries} from 'state/billing/types'
import {assumeMock} from 'utils/testing'

jest.mock('@stripe/react-stripe-js')

let handleAddressChange:
    | ((event: StripeAddressElementChangeEvent) => void)
    | undefined

assumeMock(AddressElement).mockImplementation(({onChange}) => {
    handleAddressChange = onChange
    return <div data-testid="stripe-address-element" />
})

describe('BillingInformationFields', () => {
    it('should render', () => {
        render(
            <Form onValidSubmit={jest.fn()}>
                <BillingInformationFields />
            </Form>
        )

        expect(screen.getByText('Billing Information')).toBeVisible()
        expect(screen.getByRole('textbox', {name: 'Email'})).toBeVisible()
        expect(screen.getByTestId('stripe-address-element')).toBeVisible()
    })

    describe('nominal case', () => {
        it('should display GST/HST and PST fields when Canada/BC is selected', async () => {
            render(
                <Form onValidSubmit={jest.fn()}>
                    <BillingInformationFields />
                </Form>
            )

            act(() => {
                handleAddressChange?.({
                    value: {address: {country: 'CA', state: 'BC'}},
                } as any)
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('textbox', {name: 'GST/HST ID info'})
                ).toBeVisible()
                expect(
                    screen.getByRole('textbox', {name: 'PST ID info'})
                ).toBeVisible()
            })
        })

        it('should display GST/HST and PST fields when Canada/SK is selected', async () => {
            render(
                <Form onValidSubmit={jest.fn()}>
                    <BillingInformationFields />
                </Form>
            )

            act(() => {
                handleAddressChange?.({
                    value: {address: {country: 'CA', state: 'SK'}},
                } as any)
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('textbox', {name: 'GST/HST ID info'})
                ).toBeVisible()
                expect(
                    screen.getByRole('textbox', {name: 'PST ID info'})
                ).toBeVisible()
            })
        })

        it('should display GST/HST and PST fields when Canada/MB is selected', async () => {
            render(
                <Form onValidSubmit={jest.fn()}>
                    <BillingInformationFields />
                </Form>
            )

            act(() => {
                handleAddressChange?.({
                    value: {address: {country: 'CA', state: 'MB'}},
                } as any)
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('textbox', {name: 'GST/HST ID info'})
                ).toBeVisible()
                expect(
                    screen.getByRole('textbox', {name: 'PST ID info'})
                ).toBeVisible()
            })
        })

        it('should display GST/HST and QST fields when Canada/QC is selected', async () => {
            render(
                <Form onValidSubmit={jest.fn()}>
                    <BillingInformationFields />
                </Form>
            )

            act(() => {
                handleAddressChange?.({
                    value: {address: {country: 'CA', state: 'QC'}},
                } as any)
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('textbox', {name: 'GST/HST ID info'})
                ).toBeVisible()
                expect(
                    screen.getByRole('textbox', {name: 'QST ID info'})
                ).toBeVisible()
            })
        })

        it('should display the ABN field when Australia is selected', async () => {
            render(
                <Form onValidSubmit={jest.fn()}>
                    <BillingInformationFields />
                </Form>
            )

            act(() => {
                handleAddressChange?.({
                    value: {address: {country: 'AU'}},
                } as any)
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('textbox', {name: 'ABN Number info'})
                ).toBeVisible()
            })
        })

        test.each(Object.values(VATCountries))(
            'should display the VAT ID field when %s is selected',
            async (country) => {
                render(
                    <Form onValidSubmit={jest.fn()}>
                        <BillingInformationFields />
                    </Form>
                )

                act(() => {
                    handleAddressChange?.({
                        value: {address: {country}},
                    } as any)
                })

                await waitFor(() => {
                    expect(
                        screen.getByRole('textbox', {name: 'VAT Number info'})
                    ).toBeVisible()
                })
            }
        )
    })
})
