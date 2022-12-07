import {render, screen} from '@testing-library/react'
import React, {ComponentProps} from 'react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import thunk from 'redux-thunk'
import {
    bigCommerceCustomerFixture,
    bigCommerceIntegrationFixture,
} from 'fixtures/bigcommerce'
import OrderModal from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/OrderModal'
import {BigCommerceActionType} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/types'
import {integrationsState} from 'fixtures/integrations'

const minProps = {
    isOpen: true,
    header: 'Add order',
    onOpen: jest.fn(),
    data: {
        actionName: BigCommerceActionType.CreateOrder,
        customer: bigCommerceCustomerFixture(),
    },
    integrations: [bigCommerceIntegrationFixture()],
    onCancel: jest.fn(),
    onInit: jest.fn(() => () => Promise.resolve({})),
    onReset: jest.fn(),
    onChange: jest.fn(),
    onBulkChange: jest.fn(),
    onSubmit: jest.fn(),
    onClose: jest.fn(),
} as unknown as ComponentProps<typeof OrderModal>

jest.mock(
    'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/utils',
    () => ({
        onInit: jest.fn(() => () => Promise.resolve({})),
        getCustomerAddresses: jest.fn(() => () => {
            return []
        }),
        getOneLineAddress: jest.fn(() => () => {
            return ''
        }),
    })
)

jest.mock('store/middlewares/segmentTracker')

const defaultState = {
    integrations: fromJS(integrationsState),
}
const mockStore = configureMockStore([thunk])
const store = mockStore(defaultState)

describe('OrderModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should not render when the modal is closed', () => {
        const {baseElement} = render(
            <Provider store={store}>
                <OrderModal {...minProps} isOpen={false} />
            </Provider>
        )

        expect(baseElement.firstChild).toMatchSnapshot()
    })

    it('should render when the modal is opened', async () => {
        const {baseElement} = render(
            <Provider store={store}>
                <OrderModal {...minProps} />
            </Provider>
        )
        await screen.findByText('Awaiting Fulfillment')

        expect(baseElement).toMatchSnapshot()
    })
})
