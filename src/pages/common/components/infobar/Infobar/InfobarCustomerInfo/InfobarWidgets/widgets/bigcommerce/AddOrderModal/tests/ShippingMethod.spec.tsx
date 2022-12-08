import React from 'react'

import {render, waitFor, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import MockAdapter from 'axios-mock-adapter'
import {
    bigCommerceCartFixture,
    bigCommerceShippingAddress,
} from 'fixtures/bigcommerce'
import client from 'models/api/resources'
import {ShippingMethod} from '../ShippingMethod'
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
                        consignments: [
                            {
                                id: 'consignment-id',
                                available_shipping_options: [
                                    {
                                        id: 'available-shipping-option-1',
                                        description: 'Description One',
                                        cost: 55,
                                        type: 'some-type',
                                        additional_description: '',
                                        image_url: '',
                                        transit_time: '',
                                    },
                                    {
                                        id: 'available-shipping-option-2',
                                        description: 'Description Two',
                                        cost: 66,
                                        type: 'some-type',
                                        additional_description: '',
                                        image_url: '',
                                        transit_time: '',
                                    },
                                ],
                                selected_shipping_option: undefined,
                                shipping_cost_inc_tax: 77,
                            },
                        ],
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
