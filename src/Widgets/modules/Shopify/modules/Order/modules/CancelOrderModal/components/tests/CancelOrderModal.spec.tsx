import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import {fromJS, List, Map} from 'immutable'
import React, {ReactNode} from 'react'

import {
    getFinalCancelOrderPayload,
    initRefundOrderLineItems,
    initCancelOrderPayload,
} from 'business/shopify/order'
import {TransactionKind} from 'constants/integrations/types/shopify'
import {integrationsStateWithShopify} from 'fixtures/integrations'
import {
    shopifyLineItemFixture,
    shopifyOrderFixture,
    shopifyCancelOrderPayloadFixture,
    shopifySuggestedRefundFixture,
} from 'fixtures/shopify'
import {IntegrationContext} from 'providers/infobar/IntegrationContext'
import {ShopifyActionType} from 'Widgets/modules/Shopify/types'

import {CancelOrderModalContainer} from '../CancelOrderModal'

jest.mock(
    'pages/common/utils/DatetimeLabel',
    () =>
        ({dateTime}: {dateTime: string}) => (
            <div data-testid="DatetimeLabel">{dateTime}</div>
        )
)

jest.mock(
    'pages/common/components/modal/ModalHeader',
    () =>
        ({title}: {title: ReactNode}) => (
            <div data-testid="Modal-Header">{title}</div>
        )
)

jest.mock(
    'pages/common/components/modal/Modal',
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

describe('<CancelOrderContainer />', () => {
    const order = fromJS(
        shopifyOrderFixture({shippingLines: [{price: '0.00'}]})
    )
    const payload = initCancelOrderPayload(order)
    const lineItems = initRefundOrderLineItems(order)
    const refund = fromJS(shopifySuggestedRefundFixture())
    const integrationContextValue = {integration: fromJS({}), integrationId: 1}
    const minProps = {
        data: {
            actionName: ShopifyActionType.CancelOrder,
            order,
        },
        integrations: (
            integrationsStateWithShopify.get('integrations') as List<any>
        ).toJS(),
        isOpen: true,
        lineItems: fromJS([]),
        loading: false,
        loadingMessage: '',
        payload: null,
        refund: fromJS({}),
        title: 'Cancel order',
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

    it('should not render when modal is closed', () => {
        const {container} = render(
            <IntegrationContext.Provider value={integrationContextValue}>
                <CancelOrderModalContainer {...minProps} isOpen={false} />
            </IntegrationContext.Provider>
        )

        expect(container.firstChild).toBeNull()
    })

    it('should render a spinner when missing data', () => {
        render(
            <IntegrationContext.Provider value={integrationContextValue}>
                <CancelOrderModalContainer {...minProps} loading />
            </IntegrationContext.Provider>
        )

        expect(screen.getAllByText('Loading...').length).toBeTruthy()
    })

    it('should render with an empty order table when data is empty', () => {
        render(
            <IntegrationContext.Provider value={integrationContextValue}>
                <CancelOrderModalContainer {...minProps} payload={payload} />
            </IntegrationContext.Provider>
        )

        expect(document.getElementsByTagName('tbody')[0]).toBeEmptyDOMElement()
    })

    it('should render with a populated order table when data is populated', () => {
        const {container} = render(
            <IntegrationContext.Provider value={integrationContextValue}>
                <CancelOrderModalContainer
                    {...minProps}
                    payload={payload}
                    lineItems={lineItems}
                />
            </IntegrationContext.Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call onLineItemsChange() when quantity of a product is changed', async () => {
        const lineItems = fromJS([
            shopifyLineItemFixture({currencyCode: 'USD'}),
        ]) as List<Map<any, any>>

        const {getByText} = render(
            <IntegrationContext.Provider value={integrationContextValue}>
                <CancelOrderModalContainer
                    {...minProps}
                    payload={fromJS(shopifyCancelOrderPayloadFixture())}
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

    it('should call onPayloadChange when shipping amount is changed', async () => {
        const payload: Map<any, any> = fromJS(
            shopifyCancelOrderPayloadFixture()
        )

        const {getByLabelText} = render(
            <IntegrationContext.Provider value={integrationContextValue}>
                <CancelOrderModalContainer
                    {...minProps}
                    payload={payload}
                    lineItems={lineItems}
                    refund={refund}
                />
            </IntegrationContext.Provider>
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
            <IntegrationContext.Provider value={integrationContextValue}>
                <CancelOrderModalContainer
                    {...minProps}
                    payload={payload}
                    lineItems={lineItems}
                    refund={refund}
                />
            </IntegrationContext.Provider>
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
            <IntegrationContext.Provider value={integrationContextValue}>
                <CancelOrderModalContainer
                    {...minProps}
                    payload={payload}
                    lineItems={lineItems}
                    refund={refund}
                />
            </IntegrationContext.Provider>
        )
        const newPayload = payload
            .setIn(['refund', 'notify'], false)
            .set('email', false)

        fireEvent.click(getByLabelText(/Send notification/i))

        expect(minProps.setPayload).toHaveBeenCalledWith(newPayload)
    })

    it('should call onSubmit() when submitting the form', () => {
        const payload = fromJS(shopifyCancelOrderPayloadFixture())

        const {getAllByText} = render(
            <IntegrationContext.Provider value={integrationContextValue}>
                <CancelOrderModalContainer
                    {...minProps}
                    lineItems={lineItems}
                    payload={payload}
                    refund={refund}
                />
            </IntegrationContext.Provider>
        )

        fireEvent.click(getAllByText('Cancel order')[1])

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
            <IntegrationContext.Provider value={integrationContextValue}>
                <CancelOrderModalContainer
                    {...minProps}
                    payload={fromJS(shopifyCancelOrderPayloadFixture())}
                    lineItems={lineItems}
                    refund={refund}
                />
            </IntegrationContext.Provider>
        )

        fireEvent.click(getByText('Keep order'))

        expect(minProps.onCancel).toHaveBeenCalledWith('footer')
        expect(minProps.onClose).toHaveBeenCalled()
        expect(minProps.onReset).toHaveBeenCalled()
    })

    it('should call onCancel() when clicking on header button', () => {
        const {getByTestId} = render(
            <IntegrationContext.Provider value={integrationContextValue}>
                <CancelOrderModalContainer
                    {...minProps}
                    payload={fromJS(shopifyCancelOrderPayloadFixture())}
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

    it('should disable the Cancel Order button if the order have multiple gateway', () => {
        const payload = fromJS(shopifyCancelOrderPayloadFixture())
        const fixture = shopifySuggestedRefundFixture()
        const refund = fromJS({
            ...fixture,
            transactions: [
                ...fixture.transactions,
                {
                    order_id: 1894175539223,
                    kind: TransactionKind.SuggestedRefund,
                    gateway: 'bogus',
                    parent_id: 2521452118039,
                    amount: '1.20',
                    currency: 'USD',
                    maximum_refundable: '1.20',
                },
            ],
        })

        const {getAllByText} = render(
            <IntegrationContext.Provider value={integrationContextValue}>
                <CancelOrderModalContainer
                    {...minProps}
                    lineItems={lineItems}
                    payload={payload}
                    refund={refund}
                />
            </IntegrationContext.Provider>
        )
        const button = getAllByText('Cancel order')[1]
        expect(button).toBeDisabled()
    })
})
