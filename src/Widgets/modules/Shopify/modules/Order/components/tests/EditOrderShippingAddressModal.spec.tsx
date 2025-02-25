import React, { ReactNode } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS, List, Map } from 'immutable'

import { integrationsStateWithShopify } from 'fixtures/integrations'
import { shopifyCustomerFixture } from 'fixtures/shopify'
import { CustomerContext } from 'providers/infobar/CustomerContext'
import { IntegrationContext } from 'providers/infobar/IntegrationContext'

import { EditOrderShippingAddressModal } from '../EditOrderShippingAddressModal'

jest.mock(
    'pages/common/utils/DatetimeLabel',
    () =>
        ({ dateTime }: { dateTime: string }) => <div>{dateTime}</div>,
)

jest.mock(
    'pages/common/components/modal/ModalHeader',
    () =>
        ({ title }: { title: ReactNode }) => (
            <div data-testid="Modal-Header">{title}</div>
        ),
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
        },
)

const customer = fromJS(shopifyCustomerFixture()) as Map<any, any>
const dataWithProvinceCountry = {
    actionName: null,
    customer_id: customer.get('id'),
    order_id: '',
    current_shipping_address: fromJS({ country: 'United States' }),
}
const integrationContextValue = { integration: fromJS({}), integrationId: 1 }
const minProps = {
    data: {
        actionName: null,
        customer_id: customer.get('id'),
        order_id: '',
        current_shipping_address: fromJS({}),
    },
    currentAccount: fromJS({}),
    shippingAddresses: fromJS([{}]),
    onChange: jest.fn(),
    isOpen: true,
    title: 'Edit Address',
    onOpen: jest.fn(),
    //eslint-disable-next-line @typescript-eslint/require-await
    onBulkChange: jest.fn(async (params, callBackFunc?: () => void) => {
        if (callBackFunc) {
            callBackFunc()
        }
    }),
    onSubmit: jest.fn(),
    onClose: jest.fn(),
    integrations: (
        integrationsStateWithShopify.get('integrations') as List<any>
    ).toJS(),
    loading: false,
    loadingMessage: undefined,
    payload: null,
    onInit: jest.fn(),
    onReset: jest.fn(),
}

describe('<EditOrderShippingAddressModal/>', () => {
    it('should not render when the modal is closed', () => {
        const { container } = render(
            <CustomerContext.Provider value={{ customerId: 2 }}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <EditOrderShippingAddressModal
                        {...minProps}
                        isOpen={false}
                    />
                </IntegrationContext.Provider>
            </CustomerContext.Provider>,
        )

        expect(container.firstChild).toBeNull()
    })

    it('should render the modal', () => {
        render(
            <CustomerContext.Provider value={{ customerId: 2 }}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <EditOrderShippingAddressModal {...minProps} />
                </IntegrationContext.Provider>
            </CustomerContext.Provider>,
        )

        expect(screen.getByText('Edit Address')).toBeInTheDocument()
        expect(screen.getByText('Select another address')).toBeInTheDocument()
    })

    it('should render the modal with an extra province field', () => {
        render(
            <CustomerContext.Provider value={{ customerId: 2 }}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <EditOrderShippingAddressModal
                        {...minProps}
                        data={dataWithProvinceCountry}
                    />
                </IntegrationContext.Provider>
            </CustomerContext.Provider>,
        )

        expect(screen.getByLabelText('Province')).toBeInTheDocument()
    })

    it('should call onInit when modal is opened', () => {
        const { rerender } = render(
            <CustomerContext.Provider value={{ customerId: 2 }}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <EditOrderShippingAddressModal
                        {...minProps}
                        isOpen={false}
                    />
                </IntegrationContext.Provider>
            </CustomerContext.Provider>,
        )

        rerender(
            <CustomerContext.Provider value={{ customerId: 2 }}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <EditOrderShippingAddressModal {...minProps} isOpen />
                </IntegrationContext.Provider>
            </CustomerContext.Provider>,
        )

        expect(minProps.onInit).toHaveBeenCalledWith(
            1,
            customer.get('id'),
            expect.any(Function),
        )
    })

    it('should cancel when clicking on "Cancel"', () => {
        const { getByText } = render(
            <CustomerContext.Provider value={{ customerId: 2 }}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <EditOrderShippingAddressModal {...minProps} />
                </IntegrationContext.Provider>
            </CustomerContext.Provider>,
        )
        fireEvent.click(getByText(/Cancel/i))
        expect(minProps.onClose).toHaveBeenCalled()
        expect(minProps.onReset).toHaveBeenCalled()
    })

    it('should cancel when closing the modal"', () => {
        const { getByTestId } = render(
            <CustomerContext.Provider value={{ customerId: 2 }}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <EditOrderShippingAddressModal {...minProps} />
                </IntegrationContext.Provider>
            </CustomerContext.Provider>,
        )

        fireEvent.click(getByTestId('Modal'))
        expect(minProps.onClose).toHaveBeenCalled()
        expect(minProps.onReset).toHaveBeenCalled()
    })
})
