import {render, screen, waitFor} from '@testing-library/react'
import React, {ComponentProps} from 'react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import {
    bigCommerceCustomerFixture,
    bigCommerceIntegrationFixture,
} from 'fixtures/bigcommerce'
import OrderModal from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/OrderModal'
import {BigCommerceActionType} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/types'
import {RootState, StoreDispatch} from 'state/types'

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

jest.mock('state/infobarActions/bigcommerce/createOrder/actions', () => ({
    onInit: jest.fn(() => () => Promise.resolve({})),
}))

jest.mock('store/middlewares/segmentTracker')
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({})

const renderInitialModal = async (baseElement: HTMLElement) => {
    // Wait until the show class is added to the modal
    await waitFor(() => expect(baseElement.children.length).toBe(2))
}

describe('OrderModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should not render when the modal is closed', async () => {
        const {baseElement} = render(
            <Provider store={store}>
                <OrderModal {...minProps} isOpen={false} />
            </Provider>
        )
        await renderInitialModal(baseElement)

        expect(baseElement.firstChild).toMatchSnapshot()
    })

    it('should render when the modal is opened', async () => {
        const {baseElement} = render(
            <Provider store={store}>
                <OrderModal {...minProps} />
            </Provider>
        )
        await renderInitialModal(baseElement)
        await screen.findByText('Awaiting Fulfillment')

        expect(baseElement).toMatchSnapshot()
    })
})
