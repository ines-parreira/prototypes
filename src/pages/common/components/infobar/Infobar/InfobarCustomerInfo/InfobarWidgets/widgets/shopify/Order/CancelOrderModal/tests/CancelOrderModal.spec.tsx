import React, {Component, ReactNode} from 'react'
import PropTypes from 'prop-types'
import {fireEvent, render, waitFor} from '@testing-library/react'
import {fromJS, List, Map} from 'immutable'

import {integrationsStateWithShopify} from '../../../../../../../../../../../../fixtures/integrations'
import {
    shopifyLineItemFixture,
    shopifyOrderFixture,
    shopifyCancelOrderPayloadFixture,
    shopifySuggestedRefundFixture,
} from '../../../../../../../../../../../../fixtures/shopify'
import {CancelOrderModalContainer} from '../CancelOrderModal'
import {ShopifyActionType} from '../../../types'
import {
    getFinalCancelOrderPayload,
    initRefundOrderLineItems,
    initCancelOrderPayload,
} from '../../../../../../../../../../../../business/shopify/order'

jest.mock('../../../../../../../../../../utils/labels', () => ({
    DatetimeLabel: ({dateTime}: {dateTime: string}) => (
        <div data-testid="DatetimeLabel">{dateTime}</div>
    ),
}))

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

describe('<CancelOrderContainer />', () => {
    const order = fromJS(
        shopifyOrderFixture({shippingLines: [{price: '0.00'}]})
    )
    const payload = initCancelOrderPayload(order)
    const lineItems = initRefundOrderLineItems(order)
    const refund = fromJS(shopifySuggestedRefundFixture())

    const minProps = {
        data: {
            actionName: ShopifyActionType.CancelOrder,
            order,
        },
        header: 'Cancel order',
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

    it('should not render when modal is closed', () => {
        const {container} = render(
            <MockLegacyContextWrapper>
                <CancelOrderModalContainer {...minProps} isOpen={false} />
            </MockLegacyContextWrapper>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a spinner when missing data', () => {
        const {container} = render(
            <MockLegacyContextWrapper>
                <CancelOrderModalContainer {...minProps} loading />
            </MockLegacyContextWrapper>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with an empty order table when data is empty', () => {
        const {container} = render(
            <MockLegacyContextWrapper>
                <CancelOrderModalContainer {...minProps} payload={payload} />
            </MockLegacyContextWrapper>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with a populated order table when data is populated', () => {
        const {container} = render(
            <MockLegacyContextWrapper>
                <CancelOrderModalContainer
                    {...minProps}
                    payload={payload}
                    lineItems={lineItems}
                />
            </MockLegacyContextWrapper>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call onLineItemsChange() when quantity of a product is changed', async () => {
        const lineItems = fromJS([
            shopifyLineItemFixture({currencyCode: 'USD'}),
        ]) as List<Map<any, any>>

        const {getByText} = render(
            <MockLegacyContextWrapper>
                <CancelOrderModalContainer
                    {...minProps}
                    payload={fromJS(shopifyCancelOrderPayloadFixture())}
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

    it('should call onPayloadChange when shipping amount is changed', async () => {
        const payload: Map<any, any> = fromJS(
            shopifyCancelOrderPayloadFixture()
        )

        const {getByLabelText} = render(
            <MockLegacyContextWrapper>
                <CancelOrderModalContainer
                    {...minProps}
                    payload={payload}
                    lineItems={lineItems}
                    refund={refund}
                />
            </MockLegacyContextWrapper>
        )
        const newPayload = payload.setIn(
            ['refund', 'shipping', 'amount'],
            '1.00'
        )

        fireEvent.change(getByLabelText(/Shipping/i), {
            target: {value: '1.00'},
        })

        await waitFor(() =>
            expect(minProps.onPayloadChange).toHaveBeenCalledWith(1, newPayload)
        )
    })

    it('should call setPayload() when reason is changed', () => {
        const payload: Map<any, any> = fromJS(
            shopifyCancelOrderPayloadFixture()
        )

        const {getByLabelText} = render(
            <MockLegacyContextWrapper>
                <CancelOrderModalContainer
                    {...minProps}
                    payload={payload}
                    lineItems={lineItems}
                    refund={refund}
                />
            </MockLegacyContextWrapper>
        )

        const reason = 'fraud'
        fireEvent.change(getByLabelText(/Reason for canceling/i), {
            target: {value: reason},
        })
        const newPayload = payload.set('reason', reason).set('email', false)

        expect(minProps.setPayload).toHaveBeenCalledWith(newPayload)
    })

    it('should call setPayload() when notify checkbox is updated', () => {
        const payload = fromJS(shopifyCancelOrderPayloadFixture()) as Map<
            any,
            any
        >

        const {getByLabelText} = render(
            <MockLegacyContextWrapper>
                <CancelOrderModalContainer
                    {...minProps}
                    payload={payload}
                    lineItems={lineItems}
                    refund={refund}
                />
            </MockLegacyContextWrapper>
        )
        const newPayload = payload
            .setIn(['refund', 'notify'], false)
            .set('email', false)

        fireEvent.click(getByLabelText(/Send notification/i))

        expect(minProps.setPayload).toHaveBeenCalledWith(newPayload)
    })

    it('should call onSubmit() when submitting the form', () => {
        const payload = fromJS(shopifyCancelOrderPayloadFixture())

        const {getByText} = render(
            <MockLegacyContextWrapper>
                <CancelOrderModalContainer
                    {...minProps}
                    lineItems={lineItems}
                    payload={payload}
                    refund={refund}
                />
            </MockLegacyContextWrapper>
        )

        fireEvent.click(getByText('Cancel order'))

        const finalPayload = getFinalCancelOrderPayload(payload, refund).toJS()

        expect(minProps.onChange).toHaveBeenCalledWith(
            'payload',
            finalPayload,
            expect.any(Function)
        )
        expect(minProps.onSubmit).toHaveBeenCalled()
        expect(minProps.onReset).toHaveBeenCalled()
    })

    it('should call onCancel() when clicking on Keep order button', () => {
        const {getByText} = render(
            <MockLegacyContextWrapper>
                <CancelOrderModalContainer
                    {...minProps}
                    payload={fromJS(shopifyCancelOrderPayloadFixture())}
                    lineItems={lineItems}
                    refund={refund}
                />
            </MockLegacyContextWrapper>
        )

        fireEvent.click(getByText('Keep order'))

        expect(minProps.onCancel).toHaveBeenCalledWith('footer')
        expect(minProps.onClose).toHaveBeenCalled()
        expect(minProps.onReset).toHaveBeenCalled()
    })

    it('should call onCancel() when clicking on header button', () => {
        const {getByTestId} = render(
            <MockLegacyContextWrapper>
                <CancelOrderModalContainer
                    {...minProps}
                    payload={fromJS(shopifyCancelOrderPayloadFixture())}
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
