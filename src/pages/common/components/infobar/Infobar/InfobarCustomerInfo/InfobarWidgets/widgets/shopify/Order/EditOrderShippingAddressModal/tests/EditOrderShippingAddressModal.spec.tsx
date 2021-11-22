import React, {ReactNode, Component} from 'react'
import PropTypes from 'prop-types'
import {fromJS, Map, List} from 'immutable'

import {render, fireEvent} from '@testing-library/react'

import {integrationsStateWithShopify} from '../../../../../../../../../../../../fixtures/integrations'
import {CustomerContext} from '../../../../../../../../../infobar/Infobar/InfobarCustomerInfo/InfobarCustomerInfo'
import {EditOrderShippingAddressModal} from '../EditOrderShippingAddressModal'
import {shopifyCustomerFixture} from '../../../../../../../../../../../../fixtures/shopify'

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

const customer = fromJS(shopifyCustomerFixture()) as Map<any, any>
const dataWithProvinceCountry = {
    actionName: null,
    customer_id: customer.get('id'),
    order_id: '',
    current_shipping_address: fromJS({country: 'United States'}),
}

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
                <MockLegacyContextWrapper>
                    <EditOrderShippingAddressModal
                        {...minProps}
                        isOpen={false}
                    />
                </MockLegacyContextWrapper>
            </CustomerContext.Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the modal', () => {
        const {container} = render(
            <CustomerContext.Provider value={{customerId: 2}}>
                <MockLegacyContextWrapper>
                    <EditOrderShippingAddressModal {...minProps} />
                </MockLegacyContextWrapper>
            </CustomerContext.Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should render the modal with an extra province field', () => {
        const {container} = render(
            <CustomerContext.Provider value={{customerId: 2}}>
                <MockLegacyContextWrapper>
                    <EditOrderShippingAddressModal
                        {...minProps}
                        data={dataWithProvinceCountry}
                    />
                </MockLegacyContextWrapper>
            </CustomerContext.Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should call onInit when modal is opened', () => {
        const {rerender} = render(
            <CustomerContext.Provider value={{customerId: 2}}>
                <MockLegacyContextWrapper>
                    <EditOrderShippingAddressModal
                        {...minProps}
                        isOpen={false}
                    />
                </MockLegacyContextWrapper>
            </CustomerContext.Provider>
        )

        rerender(
            <CustomerContext.Provider value={{customerId: 2}}>
                <MockLegacyContextWrapper>
                    <EditOrderShippingAddressModal {...minProps} isOpen />
                </MockLegacyContextWrapper>
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
                <MockLegacyContextWrapper>
                    <EditOrderShippingAddressModal {...minProps} />
                </MockLegacyContextWrapper>
            </CustomerContext.Provider>
        )
        fireEvent.click(getByText(/Cancel/i))
        expect(minProps.onClose).toHaveBeenCalled()
        expect(minProps.onReset).toHaveBeenCalled()
    })

    it('should cancel when closing the modal"', () => {
        const {getByTestId} = render(
            <CustomerContext.Provider value={{customerId: 2}}>
                <MockLegacyContextWrapper>
                    <EditOrderShippingAddressModal {...minProps} />
                </MockLegacyContextWrapper>
            </CustomerContext.Provider>
        )

        fireEvent.click(getByTestId('Modal'))
        expect(minProps.onClose).toHaveBeenCalled()
        expect(minProps.onReset).toHaveBeenCalled()
    })
})
