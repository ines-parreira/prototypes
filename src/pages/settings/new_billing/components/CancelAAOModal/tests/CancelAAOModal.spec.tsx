import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'
import {RootState, StoreDispatch} from 'state/types'
import {
    HELPDESK_PRODUCT_ID,
    basicMonthlyHelpdeskPlan,
    products,
    currentProductsUsage,
} from 'fixtures/productPrices'
import CancelAAOModal, {CancelAAOModalProps} from '../CancelAAOModal'
import {sendRemoveNotificationZap} from '../../../utils/sendRemoveNotificationZap'

jest.mock('../../../utils/sendRemoveNotificationZap', () => ({
    sendRemoveNotificationZap: jest.fn(),
}))

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>()

const store = mockedStore({
    billing: fromJS({
        currentAccount: fromJS({
            current_subscription: {
                products: {
                    [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.price_id,
                },
            },
        }),
        products,
    }),
})

describe('CancelAAOModal', () => {
    const mockIsOpen = true
    const mockHandleCancelAAO = jest.fn()
    const mockHandleOnClose = jest.fn()
    const mockPeriodEnd = '2021-01-01'

    const setup = (props?: Partial<CancelAAOModalProps>) => {
        const defaultProps: CancelAAOModalProps = {
            isOpen: mockIsOpen,
            handleCancelAAO: mockHandleCancelAAO,
            handleOnClose: mockHandleOnClose,
            periodEnd: mockPeriodEnd,
            currentUsage: currentProductsUsage,
            ...props,
        }

        return render(
            <Provider store={store}>
                <CancelAAOModal {...defaultProps} />
            </Provider>
        )
    }

    it('should render correctly', () => {
        const {getByText} = screen
        setup()
        expect(
            getByText('Are you sure you want to unsubscribe from Automate?')
        ).toBeInTheDocument()
    })

    it('should call handleOnClose when the "Keep using automate" button is clicked', () => {
        const {getByText} = screen
        setup()
        const closeButton = getByText('Keep using automate')
        userEvent.click(closeButton)
        expect(mockHandleOnClose).toHaveBeenCalled()
    })

    it('should show the second modal', () => {
        const {getByText} = screen
        setup()
        const continueButton = getByText('Continue')
        userEvent.click(continueButton)
        expect(
            getByText("Let us know why you're changing your subscription")
        ).toBeInTheDocument()
    })

    it('should enable the Submit button and call the handleCancelAAO', async () => {
        const {getByText, getByPlaceholderText, getByRole} = screen
        setup()
        const continueButton = getByText('Continue')
        userEvent.click(continueButton)
        const submitButton = getByRole('button', {name: 'Submit'})
        expect(submitButton).toBeAriaDisabled()
        const firstCheckbox = getByText(`It's not automating enough`)
        userEvent.click(firstCheckbox)
        const textarea = getByPlaceholderText(
            `It didn't work out for me because...`
        )
        await userEvent.type(textarea, 'test')

        expect(submitButton).toBeAriaEnabled()
        userEvent.click(submitButton)

        expect(mockHandleCancelAAO).toHaveBeenCalled()
        expect(sendRemoveNotificationZap).toHaveBeenCalled()
    })
})
