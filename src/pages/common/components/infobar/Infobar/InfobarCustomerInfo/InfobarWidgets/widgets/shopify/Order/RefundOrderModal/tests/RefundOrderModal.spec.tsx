import React, {ReactNode} from 'react'
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
import {IntegrationContext} from '../../../../IntegrationContext'
import {ShopifyActionType} from '../../../types'
import {RefundOrderModalContainer} from '../RefundOrderModal'

jest.mock('../../../../../../../../../../utils/labels', () => ({
    DatetimeLabel: ({dateTime}: {dateTime: string}) => (
        <div data-testid="DatetimeLabel">{dateTime}</div>
    ),
}))

jest.mock(
    '../../../../../../../../../Modal',
    () =>
        ({
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

describe('<RefundOrderModal />', () => {
    const order = fromJS(
        shopifyOrderFixture({shippingLines: [{price: '0.00'}]})
    )
    const payload = initRefundOrderPayload(order)
    const lineItems = initRefundOrderLineItems(order)
    const refund = fromJS(shopifySuggestedRefundFixture())
    const integrationContextValue = {integration: fromJS({}), integrationId: 1}
    const minProps = {
        data: {
            actionName: ShopifyActionType.RefundOrder,
            order,
        },
        header: 'Refund order',
        integrations: integrationsStateWithShopify.get(
            'integrations'
        ) as List<any>,
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
        onLineItemChange: jest.fn(),
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
            <IntegrationContext.Provider value={integrationContextValue}>
                <RefundOrderModalContainer {...minProps} isOpen={false} />
            </IntegrationContext.Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a spinner when missing data', () => {
        const {container} = render(
            <IntegrationContext.Provider value={integrationContextValue}>
                <RefundOrderModalContainer {...minProps} loading />
            </IntegrationContext.Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with an empty order table when data is empty', () => {
        const {container} = render(
            <IntegrationContext.Provider value={integrationContextValue}>
                <RefundOrderModalContainer {...minProps} payload={payload} />
            </IntegrationContext.Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with a populated order table when data is populated', () => {
        const {container} = render(
            <IntegrationContext.Provider value={integrationContextValue}>
                <RefundOrderModalContainer
                    {...minProps}
                    payload={payload}
                    lineItems={lineItems}
                />
            </IntegrationContext.Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call onPayloadChange when shipping amount is changed', async () => {
        const payload: Map<any, any> = fromJS(
            shopifyRefundOrderPayloadFixture()
        )

        const {getByLabelText} = render(
            <IntegrationContext.Provider value={integrationContextValue}>
                <RefundOrderModalContainer
                    {...minProps}
                    payload={payload}
                    lineItems={lineItems}
                    refund={refund}
                />
            </IntegrationContext.Provider>
        )
        const newPayload = payload.setIn(['shipping', 'amount'], '1.00')

        fireEvent.change(getByLabelText(/Shipping/i), {
            target: {value: '1.00'},
        })

        await waitFor(() =>
            expect(minProps.onPayloadChange).toHaveBeenCalledWith(1, newPayload)
        )
    })

    it('should call onLineItemChange() when quantity of a product is changed', async () => {
        const lineItems = fromJS([
            shopifyLineItemFixture({currencyCode: 'USD'}),
        ]) as List<Map<any, any>>
        const payload = fromJS(shopifyRefundOrderPayloadFixture())

        const {getByText} = render(
            <IntegrationContext.Provider value={integrationContextValue}>
                <RefundOrderModalContainer
                    {...minProps}
                    payload={payload}
                    lineItems={lineItems}
                    refund={refund}
                />
            </IntegrationContext.Provider>
        )

        fireEvent.click(getByText('▼'))

        const newLineItems = lineItems.setIn(
            ['0', 'quantity'],
            lineItems.getIn(['0', 'quantity']) - 1
        )

        await waitFor(() =>
            expect(minProps.onLineItemChange).toHaveBeenCalledWith(
                1,
                newLineItems.get(0),
                0
            )
        )
    })

    it('should call setPayload() when reason is changed', () => {
        const payload: Map<any, any> = fromJS(
            shopifyRefundOrderPayloadFixture()
        )

        render(
            <IntegrationContext.Provider value={integrationContextValue}>
                <RefundOrderModalContainer
                    {...minProps}
                    payload={payload}
                    lineItems={lineItems}
                    refund={refund}
                />
            </IntegrationContext.Provider>
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
            <IntegrationContext.Provider value={integrationContextValue}>
                <RefundOrderModalContainer
                    {...minProps}
                    payload={payload}
                    lineItems={lineItems}
                    refund={refund}
                />
            </IntegrationContext.Provider>
        )
        const newPayload = payload.set('notify', false)

        fireEvent.click(getByLabelText(/Send notification/i))

        expect(minProps.setPayload).toHaveBeenCalledWith(newPayload)
    })

    it('should call onSubmit() when submitting the form', () => {
        const payload = fromJS(shopifyRefundOrderPayloadFixture())

        const {getByText} = render(
            <IntegrationContext.Provider value={integrationContextValue}>
                <RefundOrderModalContainer
                    {...minProps}
                    payload={payload}
                    lineItems={lineItems}
                    refund={refund}
                />
            </IntegrationContext.Provider>
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
            <IntegrationContext.Provider value={integrationContextValue}>
                <RefundOrderModalContainer
                    {...minProps}
                    payload={fromJS(shopifyRefundOrderPayloadFixture())}
                    lineItems={lineItems}
                    refund={refund}
                />
            </IntegrationContext.Provider>
        )

        fireEvent.click(getByText('Cancel'))

        expect(minProps.onCancel).toHaveBeenCalledWith('footer')
        expect(minProps.onClose).toHaveBeenCalled()
        expect(minProps.onReset).toHaveBeenCalled()
    })

    it('should call onCancel() when clicking on header button', () => {
        const {getByTestId} = render(
            <IntegrationContext.Provider value={integrationContextValue}>
                <RefundOrderModalContainer
                    {...minProps}
                    payload={fromJS(shopifyRefundOrderPayloadFixture())}
                    lineItems={lineItems}
                    refund={refund}
                />
            </IntegrationContext.Provider>
        )

        fireEvent.click(getByTestId('Modal'))

        expect(minProps.onCancel).toHaveBeenCalledWith('header')
        expect(minProps.onClose).toHaveBeenCalled()
        expect(minProps.onReset).toHaveBeenCalled()
    })
})
