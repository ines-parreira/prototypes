import React, {ReactNode} from 'react'
import {fromJS, Map, List} from 'immutable'
import {render, fireEvent} from '@testing-library/react'

import {integrationsStateWithShopify} from 'fixtures/integrations'
import {shopifyCustomerFixture} from 'fixtures/shopify'
import {CustomerContext} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarCustomerInfo'
import {IntegrationContext} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/IntegrationContext'
import {EditOrderShippingAddressModal} from '../EditOrderShippingAddressModal'

jest.mock('pages/common/utils/labels', () => ({
    DatetimeLabel: ({dateTime}: {dateTime: string}) => (
        <div data-testid="DatetimeLabel">{dateTime}</div>
    ),
}))

jest.mock(
    'pages/common/components/DEPRECATED_Modal',
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

const customer = fromJS(shopifyCustomerFixture()) as Map<any, any>
const dataWithProvinceCountry = {
    actionName: null,
    customer_id: customer.get('id'),
    order_id: '',
    current_shipping_address: fromJS({country: 'United States'}),
}
const integrationContextValue = {integration: fromJS({}), integrationId: 1}
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
    header: 'Edit Address',
    onOpen: jest.fn(),
    //eslint-disable-next-line @typescript-eslint/require-await
    onBulkChange: jest.fn(async (params, callBackFunc?: () => void) => {
        if (callBackFunc) {
            callBackFunc()
        }
    }),
    onSubmit: jest.fn(),
    onClose: jest.fn(),
    integrations: integrationsStateWithShopify.get('integrations') as List<any>,
    loading: false,
    loadingMessage: undefined,
    payload: null,
    onInit: jest.fn(),
    onReset: jest.fn(),
}

describe('<EditOrderShippingAddressModal/>', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should not render when the modal is closed', () => {
        const {container} = render(
            <CustomerContext.Provider value={{customerId: 2}}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <EditOrderShippingAddressModal
                        {...minProps}
                        isOpen={false}
                    />
                </IntegrationContext.Provider>
            </CustomerContext.Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the modal', () => {
        const {container} = render(
            <CustomerContext.Provider value={{customerId: 2}}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <EditOrderShippingAddressModal {...minProps} />
                </IntegrationContext.Provider>
            </CustomerContext.Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should render the modal with an extra province field', () => {
        const {container} = render(
            <CustomerContext.Provider value={{customerId: 2}}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <EditOrderShippingAddressModal
                        {...minProps}
                        data={dataWithProvinceCountry}
                    />
                </IntegrationContext.Provider>
            </CustomerContext.Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should call onInit when modal is opened', () => {
        const {rerender} = render(
            <CustomerContext.Provider value={{customerId: 2}}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <EditOrderShippingAddressModal
                        {...minProps}
                        isOpen={false}
                    />
                </IntegrationContext.Provider>
            </CustomerContext.Provider>
        )

        rerender(
            <CustomerContext.Provider value={{customerId: 2}}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <EditOrderShippingAddressModal {...minProps} isOpen />
                </IntegrationContext.Provider>
            </CustomerContext.Provider>
        )

        expect(minProps.onInit).toBeCalledWith(
            1,
            customer.get('id'),
            expect.any(Function)
        )
    })

    it('should cancel when clicking on "Cancel"', () => {
        const {getByText} = render(
            <CustomerContext.Provider value={{customerId: 2}}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <EditOrderShippingAddressModal {...minProps} />
                </IntegrationContext.Provider>
            </CustomerContext.Provider>
        )
        fireEvent.click(getByText(/Cancel/i))
        expect(minProps.onClose).toHaveBeenCalled()
        expect(minProps.onReset).toHaveBeenCalled()
    })

    it('should cancel when closing the modal"', () => {
        const {getByTestId} = render(
            <CustomerContext.Provider value={{customerId: 2}}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <EditOrderShippingAddressModal {...minProps} />
                </IntegrationContext.Provider>
            </CustomerContext.Provider>
        )

        fireEvent.click(getByTestId('Modal'))
        expect(minProps.onClose).toHaveBeenCalled()
        expect(minProps.onReset).toHaveBeenCalled()
    })
})
