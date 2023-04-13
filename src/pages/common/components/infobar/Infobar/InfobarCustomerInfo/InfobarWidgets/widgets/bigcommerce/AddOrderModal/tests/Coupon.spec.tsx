import React from 'react'
import produce from 'immer'

import {render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {bigCommerceCartFixture} from 'fixtures/bigcommerce'
import {Coupon} from '../Coupon'

describe('<Coupon />', () => {
    const cartFixture = bigCommerceCartFixture()
    const onUpdateCouponMock = jest.fn()
    const onRemoveCouponMock = jest.fn()

    it('renders empty as expected', () => {
        const {baseElement} = render(
            <Coupon
                cart={cartFixture}
                currencyCode="EUR"
                onUpdateCoupon={onUpdateCouponMock}
                onRemoveCoupon={onRemoveCouponMock}
            />
        )

        expect(baseElement).toMatchSnapshot('initial')
    })

    it('should update the coupon', async () => {
        render(
            <Coupon
                cart={cartFixture}
                currencyCode="EUR"
                onUpdateCoupon={onUpdateCouponMock}
                onRemoveCoupon={onRemoveCouponMock}
            />
        )
        userEvent.click(screen.getByRole('button', {name: /Add coupon/i}))

        // Close button is visible when we first open the popover
        await waitFor(() => {
            expect(
                screen.getByRole('button', {name: /Close/i})
            ).toBeInTheDocument()
        })

        // And the remove button is not visible
        expect(
            screen.queryByRole('button', {name: /Remove/i})
        ).not.toBeInTheDocument()

        await userEvent.type(screen.getByLabelText('Coupon code'), 'SOME CODE')
        userEvent.click(screen.getByRole('button', {name: /Apply/i}))

        expect(onUpdateCouponMock).toHaveBeenNthCalledWith(1, 'SOME CODE')
    })

    it('renders with coupon code as expected', async () => {
        const {getByText} = render(
            <Coupon
                cart={produce(cartFixture, (draft) => {
                    draft.coupons = [
                        {
                            id: 1,
                            code: 'SOME_CODE',
                            coupon_type: 'some_type',
                            discounted_amount: 5.55,
                        },
                    ]
                })}
                currencyCode="EUR"
                onUpdateCoupon={onUpdateCouponMock}
                onRemoveCoupon={onRemoveCouponMock}
            />
        )

        expect(getByText('SOME_CODE')).toBeVisible()

        userEvent.click(screen.getByRole('button', {name: /Add coupon/i}))

        // Remove button is visible when we open popover the second time, because the coupon is set in the cart
        await waitFor(() => {
            expect(
                screen.getByRole('button', {name: /Remove/i})
            ).toBeInTheDocument()
        })

        // And the remove button is not visible
        expect(
            screen.queryByRole('button', {name: /Close/i})
        ).not.toBeInTheDocument()

        // Check that the callback on the "Remove" button is called correctly
        userEvent.click(screen.getByRole('button', {name: /Remove/i}))
        expect(onRemoveCouponMock).toHaveBeenNthCalledWith(1)
    })
})
