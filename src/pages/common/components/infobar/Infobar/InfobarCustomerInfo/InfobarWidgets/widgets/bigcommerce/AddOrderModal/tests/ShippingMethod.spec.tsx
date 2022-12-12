import React from 'react'

import {render, waitFor, screen} from '@testing-library/react'
import {renderHook, act} from 'react-hooks-testing-library'
import userEvent from '@testing-library/user-event'

import MockAdapter from 'axios-mock-adapter'
import {
    bigCommerceCartFixture,
    bigCommerceConsignmentFixture,
    bigCommerceShippingAddress,
} from 'fixtures/bigcommerce'
import client from 'models/api/resources'
import {ShippingMethod, useShippingMethods} from '../ShippingMethod'
import {
    updateCheckoutConsignmentShippingMethod,
    upsertCheckoutConsignment,
} from '../utils'

jest.mock('../utils')

describe('ShippingMethod', () => {
    let apiMock: MockAdapter

    beforeEach(() => {
        jest.resetAllMocks()
        apiMock = new MockAdapter(client)
    })

    afterAll(() => {
        apiMock.restore()
    })

    it('create/update consignment and change shipping method', async () => {
        const cartFixture = bigCommerceCartFixture()

        ;(
            upsertCheckoutConsignment as jest.MockedFunction<
                typeof upsertCheckoutConsignment
            >
        ).mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolve({
                        id: 'some-id',
                        consignments: [bigCommerceConsignmentFixture],
                    })
                })
        )

        const {rerender, baseElement} = render(
            <ShippingMethod
                integrationId={1}
                cart={null}
                shippingAddress={null}
                currencyCode="USD"
            />
        )

        expect(baseElement).toMatchSnapshot('initial')

        // No calls because we have not provided `shippingAddress` or `cart`
        expect(upsertCheckoutConsignment).not.toHaveBeenCalled()

        rerender(
            <ShippingMethod
                integrationId={1}
                cart={cartFixture}
                shippingAddress={bigCommerceShippingAddress}
                currencyCode="USD"
            />
        )

        // Call without `consignmentId` because we do not have it yet
        await waitFor(() => {
            expect(upsertCheckoutConsignment).toHaveBeenNthCalledWith(1, {
                cart: cartFixture,
                consignmentId: undefined,
                integrationId: 1,
                shippingAddress: bigCommerceShippingAddress,
            })
        })

        rerender(
            <ShippingMethod
                integrationId={1}
                cart={cartFixture}
                shippingAddress={{...bigCommerceShippingAddress}}
                currencyCode="USD"
            />
        )

        // Call with `consignmentId` because we have it from previous call
        await waitFor(() => {
            expect(upsertCheckoutConsignment).toHaveBeenNthCalledWith(
                2,
                expect.objectContaining({
                    consignmentId: 'consignment-id',
                })
            )
        })

        userEvent.click(screen.getByRole('button', {name: /Add shipping/i}))
        userEvent.click(screen.getByRole('radio', {name: /Description Two/i}))

        expect(baseElement).toMatchSnapshot('dropdown open')

        userEvent.click(screen.getByRole('button', {name: /Apply/i}))

        // Confirm we have called to change consignment shipping method after selecting it
        await waitFor(() => {
            expect(
                updateCheckoutConsignmentShippingMethod
            ).toHaveBeenCalledWith(
                expect.objectContaining({
                    shippingMethodId: 'available-shipping-option-2',
                })
            )
        })

        expect(baseElement).toMatchSnapshot('shipping method selected')
    })
})

describe('useConsignment', () => {
    it('works as expected', () => {
        const updateConsignmentShippingMethodMock = jest.fn()

        const {result, rerender} = renderHook(
            (props: Partial<Parameters<typeof useShippingMethods>[0]>) =>
                useShippingMethods({
                    consignment: null,
                    currencyCode: null,
                    updateConsignmentShippingMethod:
                        updateConsignmentShippingMethodMock,
                    ...props,
                })
        )

        expect(updateConsignmentShippingMethodMock).not.toHaveBeenCalled()
        expect(result.current.selectedShippingMethod).toEqual(null)
        expect(result.current.shippingMethodOptions).toEqual([])

        // Provide initial consignment
        rerender({consignment: bigCommerceConsignmentFixture})

        expect(updateConsignmentShippingMethodMock).not.toHaveBeenCalled()
        expect(result.current.selectedShippingMethod).toEqual(null)
        expect(result.current.shippingMethodOptions).toEqual([
            {
                label: expect.anything(),
                value: 'available-shipping-option-1',
            },
            {
                label: expect.anything(),
                value: 'available-shipping-option-2',
            },
        ])

        /**
         * Calling `onSelectShippingMethod` triggers a call to `updateConsignmentShippingMethod`
         */
        act(() => {
            result.current.onSelectShippingMethod('available-shipping-option-1')
        })
        expect(updateConsignmentShippingMethodMock).toHaveBeenNthCalledWith(
            1,
            'available-shipping-option-1'
        )
        expect(result.current.selectedShippingMethod).toEqual(
            bigCommerceConsignmentFixture.available_shipping_options[0]
        )

        /**
         * Consignment with `selected_shipping_method` arrives, because it is the same
         * shipping method that is currently selected, there's no call to `updateConsignmentShippingMethod` triggered
         */
        rerender({
            consignment: {
                ...bigCommerceConsignmentFixture,
                selected_shipping_option:
                    bigCommerceConsignmentFixture.available_shipping_options[0],
            },
        })
        expect(updateConsignmentShippingMethodMock).toHaveBeenCalledTimes(1)
        expect(result.current.selectedShippingMethod).toEqual(
            bigCommerceConsignmentFixture.available_shipping_options[0]
        )

        /**
         * Consignment with no `selected_shipping_method` arrives, but with `available_shipping_options`
         * with `id` that matches current selected shipping method, call to `updateConsignmentShippingMethodMock` is
         * triggered
         */
        rerender({
            consignment: bigCommerceConsignmentFixture,
        })
        expect(updateConsignmentShippingMethodMock).toHaveBeenNthCalledWith(
            2,
            'available-shipping-option-1'
        )
        expect(result.current.selectedShippingMethod).toEqual(
            bigCommerceConsignmentFixture.available_shipping_options[0]
        )

        /**
         * Consignment with no `selected_shipping_method` arrives, but with `available_shipping_options`
         * with `type` and `description` that matches current selected shipping method, call to `updateConsignmentShippingMethodMock`
         * is triggered with new ID
         */
        rerender({
            consignment: {
                ...bigCommerceConsignmentFixture,
                available_shipping_options: [
                    {
                        ...bigCommerceConsignmentFixture
                            .available_shipping_options[0],
                        id: 'modified-available-shipping-option-1',
                    },
                ],
            },
        })
        expect(updateConsignmentShippingMethodMock).toHaveBeenNthCalledWith(
            3,
            'modified-available-shipping-option-1'
        )
        expect(result.current.selectedShippingMethod).toEqual({
            ...bigCommerceConsignmentFixture.available_shipping_options[0],
            id: 'modified-available-shipping-option-1',
        })
    })
})
