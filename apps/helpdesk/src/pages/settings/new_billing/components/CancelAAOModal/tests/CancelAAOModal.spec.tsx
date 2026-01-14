import { userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {
    basicMonthlyHelpdeskPlan,
    currentProductsUsage,
    HELPDESK_PRODUCT_ID,
    products,
} from 'fixtures/plans'
import type { RootState, StoreDispatch } from 'state/types'

import { sendRemoveNotificationZap } from '../../../utils/sendRemoveNotificationZap'
import type { CancelAAOModalProps } from '../CancelAAOModal'
import CancelAAOModal from '../CancelAAOModal'

jest.mock('../../../utils/sendRemoveNotificationZap', () => ({
    sendRemoveNotificationZap: jest.fn(),
}))

const mockedStore = configureMockStore<DeepPartial<RootState>, StoreDispatch>()

const store = mockedStore({
    billing: fromJS({
        currentAccount: fromJS({
            current_subscription: {
                products: {
                    [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
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
            </Provider>,
        )
    }

    it('should render correctly', () => {
        const { getByText } = screen
        setup()
        expect(
            getByText('Are you sure you want to unsubscribe from AI Agent?'),
        ).toBeInTheDocument()
    })

    it('should handle an undefined currentUsage', () => {
        const { getByText } = screen
        setup({
            currentUsage: undefined,
        })
        expect(
            getByText('Are you sure you want to unsubscribe from AI Agent?'),
        ).toBeInTheDocument()
    })

    it('should call handleOnClose when the "Keep using AI Agent" button is clicked', () => {
        const { getByText } = screen
        setup()
        const closeButton = getByText('Keep using AI Agent')
        userEvent.click(closeButton)
        expect(mockHandleOnClose).toHaveBeenCalled()
    })

    it('should show the second modal', () => {
        const { getByText } = screen
        setup()
        const continueButton = getByText('Continue')
        userEvent.click(continueButton)
        expect(
            getByText("Let us know why you're changing your subscription"),
        ).toBeInTheDocument()
    })

    it('should enable the Submit button and call the handleCancelAAO', async () => {
        const { getByText, getByPlaceholderText, getByRole } = screen
        setup()
        const continueButton = getByText('Continue')
        userEvent.click(continueButton)
        const submitButton = getByRole('button', { name: 'Submit' })
        expect(submitButton).toBeAriaDisabled()
        const firstCheckbox = getByText(`It's not automating enough`)
        userEvent.click(firstCheckbox)
        const textarea = getByPlaceholderText(
            `It didn't work out for me because...`,
        )
        await userEvent.type(textarea, 'test')

        expect(submitButton).toBeAriaEnabled()
        userEvent.click(submitButton)

        expect(mockHandleCancelAAO).toHaveBeenCalled()
        expect(sendRemoveNotificationZap).toHaveBeenCalled()
    })
})
