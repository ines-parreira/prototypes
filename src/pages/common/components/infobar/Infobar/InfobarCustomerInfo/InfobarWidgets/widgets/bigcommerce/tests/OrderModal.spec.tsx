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
import OrderModalConnected, {
    OrderModal,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/OrderModal'
import {BigCommerceActionType} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/types'
import {integrationsState} from 'fixtures/integrations'
import {
    IntegrationContext,
    IntegrationContextType,
} from 'providers/infobar/IntegrationContext'
import {onInit} from '../utils'

jest.mock(
    'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/bigcommerce/utils'
)

jest.mock('store/middlewares/segmentTracker')

const defaultState = {
    integrations: fromJS(integrationsState),
}
const mockStore = configureMockStore([thunk])
const store = mockStore(defaultState)

describe('OrderModal', () => {
    const defaultProps: ComponentProps<typeof OrderModal> = {
        isOpen: true,
        data: {
            actionName: BigCommerceActionType.CreateOrder,
            customer: bigCommerceCustomerFixture(),
        },
        integrationId: bigCommerceIntegrationFixture().id,
        onClose: jest.fn(),
    }

    beforeAll(() => {
        ;(onInit as jest.MockedFunction<typeof onInit>).mockImplementation(
            () => new Promise((resolve) => resolve())
        )
    })

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render', async () => {
        const {baseElement} = render(
            <Provider store={store}>
                <OrderModal {...defaultProps} />
            </Provider>
        )

        await screen.findByText('Awaiting Fulfillment')
        expect(onInit).toHaveBeenCalled()

        expect(baseElement).toMatchSnapshot()
    })
})

describe('OrderModalConnected', () => {
    const defaultIntegrationContextValue = {
        integration: fromJS({}),
        integrationId: 1,
    }

    const defaultProps: ComponentProps<typeof OrderModalConnected> = {
        data: {
            actionName: BigCommerceActionType.CreateOrder,
            customer: bigCommerceCustomerFixture(),
        },
        isOpen: false,
        onClose: jest.fn(),
    }

    const renderSubject = ({
        integrationContextValue = defaultIntegrationContextValue,
        orderModalProps = defaultProps,
    }: {
        integrationContextValue?: IntegrationContextType
        orderModalProps?: ComponentProps<typeof OrderModalConnected>
    }) => {
        return render(
            <Provider store={store}>
                <IntegrationContext.Provider value={integrationContextValue}>
                    <OrderModalConnected {...orderModalProps} />
                </IntegrationContext.Provider>
            </Provider>
        )
    }

    it('renders null when `isOpen` is false', () => {
        const {container} = renderSubject({})
        expect(container.firstChild).toBe(null)
    })

    it('renders null when IntegrationContext has no integrationId', () => {
        const {container} = renderSubject({
            integrationContextValue: {
                integrationId: null,
                integration: fromJS({}),
            },
        })
        expect(container.firstChild).toBe(null)
    })

    it('renders when `isOpen` is `true` and IntegrationContext has value', () => {
        renderSubject({orderModalProps: {...defaultProps, isOpen: true}})

        expect(screen.getByRole('button', {name: /Add order/i})).toBeTruthy()
    })
})
