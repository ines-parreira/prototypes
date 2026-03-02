import { assumeMock } from '@repo/testing'
import { AddressElement, Elements, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import type { Stripe, StripeAddressElementChangeEvent } from '@stripe/stripe-js'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import MockAdapter from 'axios-mock-adapter'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { MemoryRouter } from 'react-router-dom'

import { UserRole } from 'config/types/user'
import { billingContact } from 'fixtures/resources'
import client from 'models/api/resources'
import { PaymentMethodType } from 'state/billing/types'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import MissingBillingInformationRow from '../MissingBillingInformationRow'

jest.mock('@stripe/stripe-js')

assumeMock(loadStripe).mockResolvedValue({} as Stripe)
window.STRIPE_PUBLIC_KEY = 'pk_test_123'

jest.mock('@stripe/react-stripe-js')

assumeMock(Elements).mockImplementation(({ children }: any) => (
    <div data-testid="stripe-elements">{children}</div>
))

let handleAddressChange: (event: StripeAddressElementChangeEvent) => any

assumeMock(AddressElement).mockImplementation(({ onChange }) => {
    handleAddressChange = onChange ?? (() => {})

    return <div data-testid="stripe-address-element" />
})

const mockAddressValue = (event: Partial<StripeAddressElementChangeEvent>) => {
    assumeMock(useElements).mockReturnValue({
        getElement: jest.fn().mockReturnValue({
            getValue: jest.fn().mockResolvedValue(event),
        }),
    } as any)

    act(() => {
        handleAddressChange(event as any)
    })
}

const mockedServer = new MockAdapter(client)

mockedServer.onGet('/api/billing/contact/').reply(200, {
    ...billingContact,
    shipping: {
        ...billingContact.shipping,
        address: {
            ...billingContact.shipping.address,
            country: '',
        },
    },
})

mockedServer.onPut('/api/billing/contact/').reply(201, {})

describe('<MissingBillingInformationRow />', () => {
    const initialState = {
        currentUser: fromJS({
            role: { name: UserRole.Admin },
        }) as Map<any, any>,
        currentAccount: fromJS({
            meta: { hasCreditCard: true, should_pay_with_shopify: false },
        }) as Map<any, any>,
        billing: fromJS({
            paymentMethod: PaymentMethodType.Stripe,
        }) as Map<any, any>,
    }

    it('should render a row when conditions are met', async () => {
        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <MissingBillingInformationRow />
            </MemoryRouter>,
            initialState,
        )

        expect(await screen.findByText('Update Now')).toBeVisible()

        expect(
            screen.getByText(
                'You need to complete your billing profile, please update it now.',
            ),
        ).toBeVisible()
    })

    it.each([
        [
            'the user is not an admin',
            {
                ...initialState,
                currentUser: initialState.currentUser.setIn(
                    ['role', 'name'],
                    UserRole.Agent,
                ),
            },
        ],
        [
            'the account has no credit card',
            {
                ...initialState,
                currentAccount: initialState.currentAccount.setIn(
                    ['meta', 'hasCreditCard'],
                    false,
                ),
            },
        ],
        [
            'the payment method is shopify',
            {
                ...initialState,
                currentAccount: initialState.currentAccount.setIn(
                    ['meta', 'should_pay_with_shopify'],
                    true,
                ),
            },
        ],
        [
            'the billing information is valid',
            {
                ...initialState,
                billing: initialState.billing.setIn(
                    ['contact', 'shipping', 'address', 'state'],
                    'NY',
                ),
            },
        ],
    ])('should not render a row when %s', (testName, state) => {
        const { container } = renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <MissingBillingInformationRow />
            </MemoryRouter>,
            state,
        )

        expect(container.firstChild).toBe(null)
    })

    it('should open the modal when clicking on update button', async () => {
        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <MissingBillingInformationRow />
            </MemoryRouter>,
            initialState,
        )

        fireEvent.click(await screen.findByText('Update Now'))

        expect(
            await screen.findByText('Missing information - Billing'),
        ).toBeVisible()
    })

    it('should submit the billing information when submiting the modal form', async () => {
        renderWithStoreAndQueryClientProvider(
            <MemoryRouter>
                <MissingBillingInformationRow />
            </MemoryRouter>,
            initialState,
        )

        fireEvent.click(await screen.findByText('Update Now'))

        expect(
            await screen.findByRole('button', {
                name: 'Save Billing Information',
            }),
        ).toBeVisible()

        const value = {
            name: 'John Doe',
            address: {
                city: 'New York',
                country: 'US',
                line1: '123 Main St',
                line2: null,
                postal_code: '12345',
                state: 'NY',
            },
        }
        mockAddressValue({
            complete: true,
            value,
        })

        fireEvent.click(
            screen.getByRole('button', { name: 'Save Billing Information' }),
        )

        await waitFor(() => {
            expect(JSON.parse(mockedServer.history.put[0]?.data)).toEqual({
                ...billingContact,
                shipping: value,
                tax_ids: {},
            })
        })
    })
})
