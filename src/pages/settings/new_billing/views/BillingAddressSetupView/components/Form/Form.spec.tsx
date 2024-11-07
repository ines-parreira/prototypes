import {useElements} from '@stripe/react-stripe-js'
import {
    StripeAddressElementChangeEvent,
    StripeElements,
} from '@stripe/stripe-js'
import {act, fireEvent, render, screen, waitFor} from '@testing-library/react'
import {AxiosError} from 'axios'
import MockAdapter from 'axios-mock-adapter'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'
import {useHistory} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'
import client from 'models/api/resources'
import {mockQueryClientProvider} from 'tests/reactQueryTestingUtils'
import {reportError} from 'utils/errors'
import {assumeMock} from 'utils/testing'

import {Form} from './Form'

jest.mock('react-redux', () => ({
    useDispatch: jest.fn(() => jest.fn()),
}))
jest.mock('@stripe/react-stripe-js')
jest.mock('react-router-dom', () => ({
    useHistory: jest.fn(),
}))

jest.mock('utils/errors')

const mockedServer = new MockAdapter(client)

let addressElementChangeHandler: (
    event: StripeAddressElementChangeEvent
) => void = () => {}

assumeMock(useElements).mockReturnValue({
    getElement: jest.fn().mockReturnValue({
        on: jest
            .fn()
            .mockImplementation(
                (eventType, handler: (...args: any[]) => any) => {
                    if (eventType === 'change') {
                        addressElementChangeHandler = (...params) =>
                            act(() => {
                                handler(...params)
                            })
                    }
                }
            ),
    }),
} as unknown as StripeElements)

const renderForm = () =>
    render(
        <Form>
            <label>
                Email
                <input name="email" />
            </label>
        </Form>,
        {wrapper: mockQueryClientProvider()}
    )

const getSubmitButton = () => screen.getByRole('button', {name: 'Set Address'})

const expectSubmitButton = () => expect(getSubmitButton())

describe('BillingAddressSetupView::Form', () => {
    it('should render the billing address setup form', () => {
        render(<Form>Form children</Form>, {wrapper: mockQueryClientProvider()})
        expect(screen.getByText('Form children')).toBeVisible()
        expectSubmitButton().toBeVisible()
    })

    it('should disable the submit button when the email is invalid', async () => {
        renderForm()

        expectSubmitButton().toBeAriaDisabled()

        addressElementChangeHandler({
            complete: true,
            value: {address: {postal_code: '12345', country: 'US'}},
        } as StripeAddressElementChangeEvent)

        expectSubmitButton().toBeAriaDisabled()

        fireEvent.change(screen.getByRole('textbox', {name: 'Email'}), {
            target: {value: 'valid.email@gorgias.com'},
        })

        await waitFor(() => {
            expectSubmitButton().not.toBeAriaDisabled()
        })

        fireEvent.change(screen.getByRole('textbox', {name: 'Email'}), {
            target: {value: 'invalid-email'},
        })

        await waitFor(() => {
            expectSubmitButton().toBeAriaDisabled()
        })
    })

    it('should disable the submit button when the postal code is invalid, and displays an error', async () => {
        renderForm()

        expectSubmitButton().toBeAriaDisabled()

        fireEvent.change(screen.getByRole('textbox', {name: 'Email'}), {
            target: {value: 'valid-email@gorgias.com'},
        })

        expectSubmitButton().toBeAriaDisabled()

        addressElementChangeHandler({
            complete: true,
            value: {address: {postal_code: '12345', country: 'US'}},
        } as StripeAddressElementChangeEvent)

        await waitFor(() => {
            expectSubmitButton().not.toBeAriaDisabled()
        })

        addressElementChangeHandler({
            complete: true,
            value: {address: {postal_code: '00000', country: 'US'}},
        } as StripeAddressElementChangeEvent)

        await waitFor(() => {
            expectSubmitButton().toBeAriaDisabled()
            expect(screen.getByText('Postal code is invalid')).toBeVisible()
        })
    })

    describe('should be able to submit the form when it is complete, and', () => {
        it('should report the error if the request fails', async () => {
            mockedServer.onPut('/api/billing/contact/').reply(500)

            renderForm()

            fireEvent.change(screen.getByRole('textbox', {name: 'Email'}), {
                target: {value: 'valid.email@gorgias.com'},
            })

            addressElementChangeHandler({
                complete: true,
                value: {address: {postal_code: '12345', country: 'US'}},
            } as StripeAddressElementChangeEvent)

            await waitFor(() => {
                expectSubmitButton().not.toBeAriaDisabled()
            })

            fireEvent.click(getSubmitButton())

            await waitFor(() => {
                expect(reportError).toHaveBeenCalledWith(
                    expect.any(AxiosError),
                    {
                        tags: {team: 'crm-growth'},
                        extra: {
                            context: 'Failed to submit billing contact',
                        },
                    }
                )
            })
        })

        it('should navigate to the billing payment information page when it succedes', async () => {
            const history = {
                push: jest.fn(),
            }

            assumeMock(useHistory).mockReturnValue(history as any)

            mockedServer.onPut('/api/billing/contact/').reply(200, {})

            renderForm()

            fireEvent.change(screen.getByRole('textbox', {name: 'Email'}), {
                target: {value: 'valid.email@gorgias.com'},
            })

            addressElementChangeHandler({
                complete: true,
                value: {address: {postal_code: '12345', country: 'US'}},
            } as StripeAddressElementChangeEvent)

            await waitFor(() => {
                expectSubmitButton().not.toBeAriaDisabled()
            })

            fireEvent.click(getSubmitButton())

            await waitFor(() => {
                expect(history.push).toHaveBeenCalledWith(
                    '/app/settings/billing/payment'
                )
            })
        })
    })

    describe("should show the correct submit button content based on the 'BillingTaxIdField' feature flag", () => {
        it("should display 'Set Address' when the feature flag is disabled", () => {
            mockFlags({[FeatureFlagKey.BillingTaxIdField]: false})

            renderForm()

            expect(
                screen.getByRole('button', {name: 'Set Address'})
            ).toBeVisible()

            expect(
                screen.queryByRole('button', {name: 'Save Billing Information'})
            ).not.toBeInTheDocument()
        })

        it("should display 'Save Billing Information' when the feature flag is enabled", () => {
            mockFlags({[FeatureFlagKey.BillingTaxIdField]: true})

            renderForm()

            expect(
                screen.queryByRole('button', {name: 'Set Address'})
            ).not.toBeInTheDocument()

            expect(
                screen.getByRole('button', {name: 'Save Billing Information'})
            ).toBeVisible()
        })
    })
})
