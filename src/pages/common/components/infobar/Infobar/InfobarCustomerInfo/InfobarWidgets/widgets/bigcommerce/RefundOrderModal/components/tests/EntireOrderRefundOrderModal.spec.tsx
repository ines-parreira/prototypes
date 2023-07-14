import React, {ComponentProps} from 'react'
import {act, fireEvent, render, screen} from '@testing-library/react'

import {BigCommerceOrder} from 'models/integration/types'
import {
    bigCommerceCalculateOrderRefundDataResponseApiFixture,
    bigCommerceOrderFixture,
} from 'fixtures/bigcommerce'
import {EntireOrderRefundOrderModal} from '../EntireOrderRefundOrderModal'
import {BigCommerceRefundActionType} from '../../reducer'

type Props = ComponentProps<typeof EntireOrderRefundOrderModal>

const bigcommerceOrder: BigCommerceOrder = {
    id: 123,
    currency_code: 'EUR',
    bc_products: bigCommerceOrderFixture.bc_products,
    bc_shipping: bigCommerceOrderFixture.bc_shipping,
}

const initialDisabledProps: Props = {
    refundData: {
        order: null,
        order_level_refund_data: null,
        individual_items_level_refund_data: null,
    },
    refundItemsPayload: null,
    dispatchRefundOrderState: jest.fn(),
    availablePaymentOptionsData: null,
    productImageURLs: {},
    storeHash: 'storeHash',
    currencyCode: null,
    isLoading: true,
}

const availableAmount = 1230000.89

const initialProps: Props = {
    refundData: {
        order: bigcommerceOrder,
        order_level_refund_data: {
            total_amount: 1234567.89,
            refunded_amount: 4567,
            available_amount: availableAmount,
        },
        individual_items_level_refund_data:
            bigCommerceCalculateOrderRefundDataResponseApiFixture.individual_items_level_refund_data,
    },
    refundItemsPayload: null,
    dispatchRefundOrderState: jest.fn(),
    availablePaymentOptionsData: null,
    productImageURLs: {
        '2259792': 'https://variantsImage.com/variant.png',
    },
    storeHash: 'storeHash',
    currencyCode: 'EUR',
    isLoading: false,
}

jest.useFakeTimers()

describe('EntireOrderRefundOrderModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('snapshot renders the initial disabled state', () => {
        const {container} = render(
            <EntireOrderRefundOrderModal {...initialDisabledProps} />
        )

        expect(container).toMatchSnapshot()
    })

    it('snapshot renders the initial state', () => {
        const {container} = render(
            <EntireOrderRefundOrderModal {...initialProps} />
        )

        expect(container).toMatchSnapshot()
    })

    it('should update external state with `Shipping Cost` & `Handling Fee`', () => {
        const dispatchRefundOrderStateMock = jest.fn()

        render(
            <EntireOrderRefundOrderModal
                {...initialProps}
                dispatchRefundOrderState={dispatchRefundOrderStateMock}
            />
        )
        act(() => jest.runAllTimers())

        expect(dispatchRefundOrderStateMock).toHaveBeenNthCalledWith(1, {
            type: BigCommerceRefundActionType.ResetRefundMethodState,
        })
        expect(dispatchRefundOrderStateMock).toHaveBeenNthCalledWith(2, {
            type: BigCommerceRefundActionType.EntireOrder,
            refundData: initialProps.refundData,
        })

        // Agent clicks `Shipping cost` & `Handling fee` checkboxes => it will trigger a hook call with user's data
        fireEvent.click(screen.getAllByRole('checkbox')[0]) // Shipping cost
        fireEvent.click(screen.getAllByRole('checkbox')[1]) // Handling fee
        act(() => jest.runAllTimers())

        expect(dispatchRefundOrderStateMock).toHaveBeenNthCalledWith(3, {
            type: BigCommerceRefundActionType.EntireOrderAddShipping,
            shippingRefundData:
                initialProps.refundData.individual_items_level_refund_data!
                    .SHIPPING,
            isShippingCostRefunded: true,
        })
        expect(dispatchRefundOrderStateMock).toHaveBeenNthCalledWith(4, {
            type: BigCommerceRefundActionType.EntireOrderAddHandling,
            handlingRefundData:
                initialProps.refundData.individual_items_level_refund_data!
                    .HANDLING,
            isHandlingFeeRefunded: true,
        })
    })
})
