import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import type { MockStore } from 'redux-mock-store'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { InfobarAction } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/types'

import { CustomizationContext } from '../../../Template'
import { ShopifyContext } from '../../contexts/ShopifyContext'
import { shippingAddressCustomization } from '../ShippingAddress'

jest.mock(
    'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/ActionButtonsGroup',
    () => ({
        __esModule: true,
        default: ({ actions }: { actions: InfobarAction[] }) => (
            <div data-testid="action-buttons">
                {actions.map((action) => (
                    <button key={action.key}>{action.child}</button>
                ))}
            </div>
        ),
    }),
)

const mockStore = configureMockStore([thunk])
const AfterTitle = shippingAddressCustomization.AfterTitle!

describe('ShippingAddress', () => {
    let store: MockStore

    const mockShippingAddress = fromJS({
        address1: '123 Test St',
        address2: 'Apt 4B',
        city: 'Test City',
        province: 'Test Province',
        zip: '12345',
        country: 'Test Country',
    })

    const mockResourceIds = {
        target_id: 123,
        customer_id: 456,
        data_source: null,
    }

    beforeEach(() => {
        store = mockStore({})
    })

    describe('<AfterTitle />', () => {
        it('should render edit button when actions are not hidden', () => {
            const { getByText } = render(
                <Provider store={store}>
                    <ShopifyContext.Provider
                        value={{
                            widget_resource_ids: mockResourceIds,
                            data_source: null,
                        }}
                    >
                        <CustomizationContext.Provider
                            value={{
                                hideActionsForCustomer: false,
                            }}
                        >
                            <AfterTitle
                                source={mockShippingAddress}
                                isEditing={false}
                            />
                        </CustomizationContext.Provider>
                    </ShopifyContext.Provider>
                </Provider>,
            )

            expect(getByText('Edit')).toBeInTheDocument()
        })

        it('should not render edit button when actions are hidden', () => {
            const { queryByText } = render(
                <Provider store={store}>
                    <ShopifyContext.Provider
                        value={{
                            widget_resource_ids: mockResourceIds,
                            data_source: null,
                        }}
                    >
                        <CustomizationContext.Provider
                            value={{
                                hideActionsForCustomer: true,
                            }}
                        >
                            <AfterTitle
                                source={mockShippingAddress}
                                isEditing={false}
                            />
                        </CustomizationContext.Provider>
                    </ShopifyContext.Provider>
                </Provider>,
            )

            expect(queryByText('Edit')).not.toBeInTheDocument()
        })
    })
})
