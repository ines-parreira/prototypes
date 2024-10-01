import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import React from 'react'
import {useElements} from '@stripe/react-stripe-js'
import {
    StripeAddressElementChangeEvent,
    StripeElements,
} from '@stripe/stripe-js'
import {useHistory} from 'react-router-dom'
import {fromJS} from 'immutable'
import {reportError} from 'utils/errors'
import {updateContact} from 'state/billing/actions'
import {assumeMock} from 'utils/testing'
import {Form} from './Form'

jest.mock('react-redux')
jest.mock('@stripe/react-stripe-js')
jest.mock('react-router-dom', () => ({
    useHistory: jest.fn(),
}))

jest.mock('utils/errors')
jest.mock('state/billing/actions', () => ({
    updateContact: jest.fn(),
}))

let addressElementChangeHandler: (
    event: StripeAddressElementChangeEvent
) => any = () => {}

assumeMock(useElements).mockReturnValue({
    getElement: jest.fn().mockReturnValue({
        on: jest.fn().mockImplementation((_, handler) => {
            addressElementChangeHandler = handler
        }),
    }),
} as unknown as StripeElements)

const renderForm = () =>
    render(
        <Form>
            <label>
                Email
                <input name="email" />
            </label>
        </Form>
    )

const getSubmitButton = () => screen.getByRole('button', {name: 'Set Address'})

const expectSubmitButton = () => expect(getSubmitButton())

describe('BillingAddressSetupView::Form', () => {
    it('should render the billing address setup form', () => {
        render(<Form>Form children</Form>)
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
            const error = new Error()

            assumeMock(updateContact).mockImplementation(() =>
                jest.fn().mockRejectedValue(error)
            )

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
                expect(reportError).toHaveBeenCalledWith(error, {
                    tags: {team: 'crm-growth'},
                    extra: {
                        context:
                            'BillingAddressSetupView.SubmitButton.onSubmit :: Failed to update billing contact',
                    },
                })
            })
        })

        it('should navigate to the billing payment information page when it succedes', async () => {
            const history = {
                push: jest.fn(),
            }

            assumeMock(useHistory).mockReturnValue(history as any)
            assumeMock(updateContact).mockImplementation(() =>
                jest.fn().mockResolvedValue({})
            )

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
                expect(updateContact).toHaveBeenCalledWith(
                    fromJS({
                        email: 'valid.email@gorgias.com',
                        shipping: {
                            address: {postal_code: '12345', country: 'US'},
                        },
                    })
                )
                expect(history.push).toHaveBeenCalledWith(
                    '/app/settings/billing/payment'
                )
            })
        })

        it('should not change route when the response has a type that indicates that the update failed', async () => {
            const history = {
                push: jest.fn(),
            }

            assumeMock(useHistory).mockReturnValue(history as any)
            assumeMock(updateContact).mockImplementation(() =>
                jest
                    .fn()
                    .mockResolvedValue({type: 'UPDATE_BILLING_CONTACT_ERROR'})
            )

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
                expect(updateContact).toHaveBeenCalledWith(
                    fromJS({
                        email: 'valid.email@gorgias.com',
                        shipping: {
                            address: {postal_code: '12345', country: 'US'},
                        },
                    })
                )
                expect(history.push).not.toHaveBeenCalled()
            })
        })
    })
})
