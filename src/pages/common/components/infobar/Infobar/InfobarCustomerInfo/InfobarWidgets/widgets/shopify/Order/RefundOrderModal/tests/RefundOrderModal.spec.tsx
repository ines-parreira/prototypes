import React, {Component, ReactNode} from 'react'
import PropTypes from 'prop-types'
import {fireEvent, render, waitFor} from '@testing-library/react'
import {fromJS, List, Map} from 'immutable'

import {
    shopifyLineItemFixture,
    shopifyOrderFixture,
    shopifyRefundOrderPayloadFixture,
    shopifySuggestedRefundFixture,
} from '../../../../../../../../../../../../fixtures/shopify'
import {
    getFinalRefundOrderPayload,
    initRefundOrderLineItems,
    initRefundOrderPayload,
} from '../../../../../../../../../../../../business/shopify/order'
import {integrationsStateWithShopify} from '../../../../../../../../../../../../fixtures/integrations'
import * as utils from '../../../../../../../../../../utils/labels.js'
import {ShopifyActionType} from '../../../types'
import {RefundOrderModalContainer} from '../RefundOrderModal'

jest.spyOn(utils, 'DatetimeLabel').mockImplementation((({
    datetime,
}: {
    datetime: string
}) => {
    return <div data-testid="DatetimeLabel">{datetime}</div>
}) as any)

jest.mock(
    '../../../../../../../../../Modal',
    () => ({
        isOpen,
        children,
        onClose,
    }: {
        isOpen: boolean
        children: ReactNode
        onClose: () => void
    }) => {
        if (isOpen) {
            return (
                <div data-testid="Modal" onClick={onClose}>
                    {children}
                </div>
            )
        }
        return null
    }
)

class MockLegacyContextWrapper extends Component<{
    children: ReactNode
    value?: {integrationId?: number}
}> {
    static childContextTypes = {
        integrationId: PropTypes.number.isRequired,
    }

    static defaultProps = {value: {}}

    getChildContext() {
        const {value} = this.props

        return {integrationId: 1, ...value}
    }

    render() {
        const {children} = this.props
        return children
    }
}

describe('<RefundOrderModal />', () => {
    const order = fromJS(
        shopifyOrderFixture({shippingLines: [{price: '0.00'}]})
    )
    const payload = initRefundOrderPayload(order)
    const lineItems = initRefundOrderLineItems(order)
    const refund = fromJS(shopifySuggestedRefundFixture())

    const minProps = {
        data: {
            actionName: ShopifyActionType.RefundOrder,
            order,
        },
        header: 'Refund order',
        integrations: integrationsStateWithShopify.get('integrations') as List<
            any
        >,
        isOpen: true,
        lineItems: fromJS([]),
        loading: false,
        loadingMessage: '',
        payload: null,
        refund: fromJS({}),
        onBulkChange: jest.fn(),
        onCancel: jest.fn(),
        onChange: jest
            .fn()
            .mockImplementation(
                (
                    name: string,
                    value: string | number | boolean | Record<string, unknown>,
                    callback?: () => void
                ) => {
                    callback?.()
                }
            ),
        onClose: jest.fn(),
        onInit: jest.fn(),
        onLineItemsChange: jest.fn(),
        onOpen: jest.fn(),
        onPayloadChange: jest.fn(),
        onReset: jest.fn(),
        onSubmit: jest.fn(),
        setPayload: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should not render when the modal is closed', () => {
        const {container} = render(
            <MockLegacyContextWrapper>
                <RefundOrderModalContainer {...minProps} isOpen={false} />
            </MockLegacyContextWrapper>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a spinner when missing data', () => {
        const {container} = render(
            <MockLegacyContextWrapper>
                <RefundOrderModalContainer {...minProps} loading />
            </MockLegacyContextWrapper>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with an empty order table when data is empty', () => {
        const {container} = render(
            <MockLegacyContextWrapper>
                <RefundOrderModalContainer {...minProps} payload={payload} />
            </MockLegacyContextWrapper>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with a populated order table when data is populated', () => {
        const {container} = render(
            <MockLegacyContextWrapper>
                <RefundOrderModalContainer
                    {...minProps}
                    payload={payload}
                    lineItems={lineItems}
                />
            </MockLegacyContextWrapper>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call onPayloadChange when shipping amount is changed', async () => {
        const payload: Map<any, any> = fromJS(
            shopifyRefundOrderPayloadFixture()
        )

        const {getByLabelText} = render(
            <MockLegacyContextWrapper>
                <RefundOrderModalContainer
                    {...minProps}
                    payload={payload}
                    lineItems={lineItems}
                    refund={refund}
                />
            </MockLegacyContextWrapper>
        )
        const newPayload = payload.setIn(['shipping', 'amount'], '1.00')

        fireEvent.change(getByLabelText(/Shipping/i), {
            target: {value: '1.00'},
        })

        await waitFor(() =>
            expect(minProps.onPayloadChange).toHaveBeenCalledWith(1, newPayload)
        )
    })

    it('should call onLineItemsChange() when quantity of a product is changed', async () => {
        const lineItems = fromJS([
            shopifyLineItemFixture({currencyCode: 'USD'}),
        ]) as List<Map<any, any>>
        const payload = fromJS(shopifyRefundOrderPayloadFixture())

        const {getByText} = render(
            <MockLegacyContextWrapper>
                <RefundOrderModalContainer
                    {...minProps}
                    payload={payload}
                    lineItems={lineItems}
                    refund={refund}
                />
            </MockLegacyContextWrapper>
        )

        fireEvent.click(getByText('▼'))

        const newLineItems = lineItems.setIn(
            ['0', 'quantity'],
            lineItems.getIn(['0', 'quantity']) - 1
        )

        await waitFor(() =>
            expect(minProps.onLineItemsChange).toHaveBeenCalledWith(
                1,
                newLineItems
            )
        )
    })

    it('should call setPayload() when reason is changed', () => {
        const payload: Map<any, any> = fromJS(
            shopifyRefundOrderPayloadFixture()
        )

        render(
            <MockLegacyContextWrapper>
                <RefundOrderModalContainer
                    {...minProps}
                    payload={payload}
                    lineItems={lineItems}
                    refund={refund}
                />
            </MockLegacyContextWrapper>
        )

        const value = "I don't like this product anymore"
        document.getElementById('reason')
        const newPayload = payload.set('note', value)

        fireEvent.change(document.getElementById('reason') as HTMLElement, {
            target: {value},
        })

        expect(minProps.setPayload).toHaveBeenCalledWith(newPayload)
    })

    it('should call setPayload() when notify checkbox is updated', () => {
        const payload = fromJS(shopifyRefundOrderPayloadFixture()) as Map<
            any,
            any
        >

        const {getByLabelText} = render(
            <MockLegacyContextWrapper>
                <RefundOrderModalContainer
                    {...minProps}
                    payload={payload}
                    lineItems={lineItems}
                    refund={refund}
                />
            </MockLegacyContextWrapper>
        )
        const newPayload = payload.set('notify', false)

        fireEvent.click(getByLabelText(/Send notification/i))

        expect(minProps.setPayload).toHaveBeenCalledWith(newPayload)
    })

    it('should call onSubmit() when submitting the form', () => {
        const payload = fromJS(shopifyRefundOrderPayloadFixture())

        const {getByText} = render(
            <MockLegacyContextWrapper>
                <RefundOrderModalContainer
                    {...minProps}
                    payload={payload}
                    lineItems={lineItems}
                    refund={refund}
                />
            </MockLegacyContextWrapper>
        )

        fireEvent.click(getByText('Refund'))

        const finalPayload = getFinalRefundOrderPayload(payload, refund).toJS()

        expect(minProps.onChange).toHaveBeenCalledWith(
            'payload',
            finalPayload,
            expect.any(Function)
        )
        expect(minProps.onSubmit).toHaveBeenCalled()
        expect(minProps.onReset).toHaveBeenCalled()
    })

    it('should call onCancel() when clicking on cancel button', () => {
        const {getByText} = render(
            <MockLegacyContextWrapper>
                <RefundOrderModalContainer
                    {...minProps}
                    payload={fromJS(shopifyRefundOrderPayloadFixture())}
                    lineItems={lineItems}
                    refund={refund}
                />
            </MockLegacyContextWrapper>
        )

        fireEvent.click(getByText('Cancel'))

        expect(minProps.onCancel).toHaveBeenCalledWith('footer')
        expect(minProps.onClose).toHaveBeenCalled()
        expect(minProps.onReset).toHaveBeenCalled()
    })

    it('should call onCancel() when clicking on header button', () => {
        const {getByTestId} = render(
            <MockLegacyContextWrapper>
                <RefundOrderModalContainer
                    {...minProps}
                    payload={fromJS(shopifyRefundOrderPayloadFixture())}
                    lineItems={lineItems}
                    refund={refund}
                />
            </MockLegacyContextWrapper>
        )

        fireEvent.click(getByTestId('Modal'))

        expect(minProps.onCancel).toHaveBeenCalledWith('header')
        expect(minProps.onClose).toHaveBeenCalled()
        expect(minProps.onReset).toHaveBeenCalled()
    })
})
