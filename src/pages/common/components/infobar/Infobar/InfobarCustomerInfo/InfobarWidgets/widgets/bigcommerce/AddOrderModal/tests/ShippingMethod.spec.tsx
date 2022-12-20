import React, {ComponentProps} from 'react'

import {render, screen} from '@testing-library/react'
import {renderHook, act} from 'react-hooks-testing-library'
import userEvent from '@testing-library/user-event'

import MockAdapter from 'axios-mock-adapter'
import {
    bigCommerceCartFixture,
    bigCommerceConsignmentFixture,
    bigCommerceLineItemFixture,
} from 'fixtures/bigcommerce'
import client from 'models/api/resources'
import Tooltip from 'pages/common/components/Tooltip'
import {ShippingMethod, useShippingMethods} from '../ShippingMethod'

// Mocking to check what text is provided to `Tooltip`
jest.mock(
    'pages/common/components/Tooltip',
    () =>
        ({children}: ComponentProps<typeof Tooltip>) =>
            <div>{children}</div>
)

describe('ShippingMethod', () => {
    let apiMock: MockAdapter

    beforeEach(() => {
        jest.resetAllMocks()
        apiMock = new MockAdapter(client)
    })

    afterAll(() => {
        apiMock.restore()
    })

    it('create/update consignment and change shipping method', () => {
        const onUpdateConsignmentShippingMethodMock = jest.fn()

        const {rerender, baseElement} = render(
            <ShippingMethod
                cart={null}
                consignment={null}
                onUpdateConsignmentShippingMethod={
                    onUpdateConsignmentShippingMethodMock
                }
                currencyCode="USD"
                shippingCost={77}
                hasShippingAddress={false}
            />
        )

        expect(baseElement).toMatchSnapshot('initial')

        // No calls because we have not provided `shippingAddress` or `cart`
        expect(onUpdateConsignmentShippingMethodMock).not.toHaveBeenCalled()

        rerender(
            <ShippingMethod
                cart={bigCommerceCartFixture()}
                consignment={bigCommerceConsignmentFixture}
                onUpdateConsignmentShippingMethod={
                    onUpdateConsignmentShippingMethodMock
                }
                currencyCode="USD"
                shippingCost={77}
                hasShippingAddress
            />
        )

        // No calls because we do not have shipping method selected yet
        expect(onUpdateConsignmentShippingMethodMock).not.toHaveBeenCalled()

        userEvent.click(screen.getByRole('button', {name: /Add shipping/i}))
        userEvent.click(screen.getByRole('radio', {name: /Description Two/i}))

        expect(baseElement).toMatchSnapshot('dropdown open')

        userEvent.click(screen.getByRole('button', {name: /Apply/i}))

        expect(onUpdateConsignmentShippingMethodMock).toHaveBeenNthCalledWith(
            1,
            'available-shipping-option-2'
        )

        expect(baseElement).toMatchSnapshot('shipping method selected')
    })

    it('disables "Add Shipping" button when conditions match', () => {
        const cartFixture = bigCommerceCartFixture()

        const {rerender} = render(
            <ShippingMethod
                cart={null}
                consignment={null}
                onUpdateConsignmentShippingMethod={jest.fn()}
                currencyCode="USD"
                shippingCost={77}
                hasShippingAddress={false}
            />
        )

        // Has no products
        expect(screen.getByRole('button', {name: /Add shipping/i})).toHaveClass(
            'isDisabled'
        )
        expect(
            screen.getByText(
                /Your cart contains no products, please select some first/i
            )
        ).toBeInTheDocument()

        // Has no physical products
        rerender(
            <ShippingMethod
                cart={{
                    ...cartFixture,
                    line_items: {
                        ...cartFixture.line_items,
                        physical_items: [],
                        digital_items: [bigCommerceLineItemFixture()],
                    },
                }}
                consignment={bigCommerceConsignmentFixture}
                onUpdateConsignmentShippingMethod={jest.fn()}
                currencyCode="USD"
                shippingCost={77}
                hasShippingAddress={false}
            />
        )

        expect(screen.getByRole('button', {name: /Add shipping/i})).toHaveClass(
            'isDisabled'
        )
        expect(
            screen.getByText(
                /Your cart contains only digital products, no shipping is required/i
            )
        ).toBeInTheDocument()

        // Still has no shipping address
        rerender(
            <ShippingMethod
                cart={cartFixture}
                consignment={bigCommerceConsignmentFixture}
                onUpdateConsignmentShippingMethod={jest.fn()}
                currencyCode="USD"
                shippingCost={77}
                hasShippingAddress={false}
            />
        )

        expect(screen.getByRole('button', {name: /Add shipping/i})).toHaveClass(
            'isDisabled'
        )
        expect(screen.getByText(/to see shipping rates/i)).toBeInTheDocument()

        // Has it all
        rerender(
            <ShippingMethod
                cart={cartFixture}
                consignment={bigCommerceConsignmentFixture}
                onUpdateConsignmentShippingMethod={jest.fn()}
                currencyCode="USD"
                shippingCost={77}
                hasShippingAddress
            />
        )

        expect(
            screen.getByRole('button', {name: /Add shipping/i})
        ).not.toHaveClass('isDisabled')
    })
})

describe('useShippingMethods', () => {
    it('works as expected', () => {
        const onUpdateConsignmentShippingMethodMock = jest.fn()

        const {result, rerender} = renderHook(
            (props: Partial<Parameters<typeof useShippingMethods>[0]>) =>
                useShippingMethods({
                    consignment: null,
                    currencyCode: null,
                    onUpdateConsignmentShippingMethod:
                        onUpdateConsignmentShippingMethodMock,
                    ...props,
                })
        )

        expect(onUpdateConsignmentShippingMethodMock).not.toHaveBeenCalled()
        expect(result.current.selectedShippingMethod).toEqual(null)
        expect(result.current.shippingMethodOptions).toEqual([])

        // Provide initial consignment
        rerender({consignment: bigCommerceConsignmentFixture})

        expect(onUpdateConsignmentShippingMethodMock).not.toHaveBeenCalled()
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
        expect(onUpdateConsignmentShippingMethodMock).toHaveBeenNthCalledWith(
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
        expect(onUpdateConsignmentShippingMethodMock).toHaveBeenCalledTimes(1)
        expect(result.current.selectedShippingMethod).toEqual(
            bigCommerceConsignmentFixture.available_shipping_options[0]
        )

        /**
         * Consignment with no `selected_shipping_method` arrives, but with `available_shipping_options`
         * with `id` that matches current selected shipping method, call to `onUpdateConsignmentShippingMethodMock` is
         * triggered
         */
        rerender({
            consignment: bigCommerceConsignmentFixture,
        })
        expect(onUpdateConsignmentShippingMethodMock).toHaveBeenNthCalledWith(
            2,
            'available-shipping-option-1'
        )
        expect(result.current.selectedShippingMethod).toEqual(
            bigCommerceConsignmentFixture.available_shipping_options[0]
        )

        /**
         * Consignment with no `selected_shipping_method` arrives, but with `available_shipping_options`
         * with `type` and `description` that matches current selected shipping method, call to `onUpdateConsignmentShippingMethodMock`
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
        expect(onUpdateConsignmentShippingMethodMock).toHaveBeenNthCalledWith(
            3,
            'modified-available-shipping-option-1'
        )
        expect(result.current.selectedShippingMethod).toEqual({
            ...bigCommerceConsignmentFixture.available_shipping_options[0],
            id: 'modified-available-shipping-option-1',
        })
    })
})
