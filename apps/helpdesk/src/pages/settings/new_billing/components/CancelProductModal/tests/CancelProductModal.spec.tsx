import React from 'react'

import { SegmentEvent } from '@repo/logging'
import { assumeMock, getLastMockCall } from '@repo/testing'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    basicMonthlyHelpdeskPlan,
    HELPDESK_PRODUCT_ID,
    proMonthlyAutomationPlan,
    proMonthlyHelpdeskPlan,
    voicePlan0,
} from 'fixtures/productPrices'
import { user } from 'fixtures/users'
import { trackBillingEvent } from 'models/billing/resources'
import { ProductType } from 'models/billing/types'
import { cancelHelpdeskAutoRenewal } from 'state/currentAccount/actions'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'

import CancellationReasons from '../CancellationReasons'
import CancellationSummary from '../CancellationSummary'
import CancelProductModal from '../CancelProductModal'
import ChurnMitigationOffer from '../ChurnMitigationOffer'
import { CancellationFlowStep } from '../constants'
import useCancellationFlowStepsStateMachine from '../hooks/useCancellationFlowStepsStateMachine'
import useFindChurnMitigationOffer from '../hooks/useFindChurnMitigationOffer'
import ProductFeaturesFOMO from '../ProductFeaturesFOMO'
import { cancellationReasonsReducer, DEFAULT_STATE } from '../reducers'
import { sendAcceptedChurnMitigationOfferToSupport } from '../resources'
import { HELPDESK_CANCELLATION_SCENARIO } from '../scenarios'
import Disclaimer from '../UI/Disclaimer'

// components mocks
const mockStore = configureMockStore([thunk])
const store = mockStore({
    billing: fromJS(billingState),
    currentAccount: fromJS({
        ...account,
        current_subscription: {
            products: {
                [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.price_id,
            },
        },
    }),
    currentUser: fromJS(user),
})

jest.mock('../ProductFeaturesFOMO/ProductFeaturesFOMO', () =>
    jest.fn(() => <div data-testid="product-features-fomo"></div>),
)
const MockProductFeaturesFOMO = assumeMock(ProductFeaturesFOMO)

jest.mock('../CancellationReasons/CancellationReasons', () =>
    jest.fn(() => <div data-testid="cancellation-reasons"></div>),
)
const CancellationReasonsMock = assumeMock(CancellationReasons)

jest.mock('../ChurnMitigationOffer/ChurnMitigationOffer', () =>
    jest.fn(() => <div data-testid="churn-mitigation-offer"></div>),
)
const ChurnMitigationOfferMock = assumeMock(ChurnMitigationOffer)

jest.mock('../CancellationSummary/CancellationSummary', () =>
    jest.fn(() => <div data-testid="cancellation-summary"></div>),
)
const CancellationSummaryMock = assumeMock(CancellationSummary)

jest.mock('../UI/Disclaimer', () =>
    jest.fn(() => <div data-testid="disclaimer" />),
)
const DisclaimerMock = assumeMock(Disclaimer)

// business logic mocks
jest.mock('../hooks/useCancellationFlowStepsStateMachine')
const useCancellationFlowStepsStateMachineMock = assumeMock(
    useCancellationFlowStepsStateMachine,
)
jest.mock('../hooks/useFindChurnMitigationOffer')
const useFindChurnMitigationOfferMock = assumeMock(useFindChurnMitigationOffer)

jest.mock('../reducers')
const cancellationReasonsReducerMock = assumeMock(cancellationReasonsReducer)

jest.mock('state/currentAccount/actions')
const cancelHelpdeskAutoRenewalMock = assumeMock(cancelHelpdeskAutoRenewal)

jest.mock('../resources')
const sendAcceptedChurnMitigationOfferToSupportMock = assumeMock(
    sendAcceptedChurnMitigationOfferToSupport,
)

jest.mock('state/notifications/actions')
const notifyMock = notify as jest.Mock
jest.mock('models/billing/resources')
const trackBillingEventMock = assumeMock(trackBillingEvent)
const mockSwitchToNextStep = jest.fn()

// tests setup
beforeEach(() => {
    // Reset all business logic mocks before each test.
    mockSwitchToNextStep.mockReset()
    useCancellationFlowStepsStateMachineMock.mockReset()
    cancellationReasonsReducerMock.mockReset()
    cancelHelpdeskAutoRenewalMock.mockReset()
    useFindChurnMitigationOfferMock.mockReset()
    sendAcceptedChurnMitigationOfferToSupportMock.mockReset()
    notifyMock.mockReset()

    // Set the default reducer state
    cancellationReasonsReducerMock.mockImplementation(() => DEFAULT_STATE)
    useCancellationFlowStepsStateMachineMock.mockImplementation(() => ({
        cancellationStep: CancellationFlowStep.productFeaturesFOMO,
        switchToNextStep: mockSwitchToNextStep,
        resetCancellationFlow: jest.fn(),
    }))

    // Set the default churn mitigation offer id
    useFindChurnMitigationOfferMock.mockImplementation(
        () => '5f5e3e3e4f3e4e001f3e4e4f',
    )

    // Mock notify
    notifyMock.mockImplementation((msg) => ({
        type: 'mocked notify action',
        message: msg,
    }))

    // Reset store actions
    store.clearActions()
})

// constants
const subscriptionProducts = {
    [ProductType.Helpdesk]: proMonthlyHelpdeskPlan,
    [ProductType.Automation]: proMonthlyAutomationPlan,
    [ProductType.SMS]: null,
    [ProductType.Voice]: voicePlan0,
    [ProductType.Convert]: null,
}
const productType = ProductType.Helpdesk
const periodEnd = 'February 14, 2024'

describe('CancelProductModal: step 1', () => {
    beforeEach(() => {
        useCancellationFlowStepsStateMachineMock.mockImplementation(() => ({
            cancellationStep: CancellationFlowStep.productFeaturesFOMO,
            switchToNextStep: mockSwitchToNextStep,
            resetCancellationFlow: jest.fn(),
        }))
        cancellationReasonsReducerMock.mockImplementation(() => DEFAULT_STATE)
    })

    it('should render the product fomo features with corresponding footer', () => {
        const { getByRole, getByTestId } = render(
            <Provider store={store}>
                <CancelProductModal
                    onClose={jest.fn()}
                    isOpen={true}
                    productType={productType}
                    subscriptionProducts={subscriptionProducts}
                    periodEnd={periodEnd}
                />
            </Provider>,
        )

        expect(getByTestId('product-features-fomo')).toBeInTheDocument()
        expect(MockProductFeaturesFOMO).toHaveBeenCalledWith(
            {
                periodEnd: periodEnd,
                features: HELPDESK_CANCELLATION_SCENARIO.features,
            },
            {},
        )

        const keepUsingHelpdeskButtonElement = getByRole('button', {
            name: 'Keep using helpdesk',
        })
        expect(keepUsingHelpdeskButtonElement).toBeInTheDocument()

        const continueCancellingButtonElement = getByRole('button', {
            name: 'Continue cancelling',
        })
        expect(continueCancellingButtonElement).toBeInTheDocument()
        expect(continueCancellingButtonElement).toBeEnabled()
    })

    it('should close the modal when the "Keep using helpdesk" button is clicked', () => {
        const mockHandleOnClose = jest.fn()

        const { getByRole } = render(
            <Provider store={store}>
                <CancelProductModal
                    onClose={mockHandleOnClose}
                    isOpen={true}
                    productType={productType}
                    subscriptionProducts={subscriptionProducts}
                    periodEnd={periodEnd}
                />
            </Provider>,
        )
        const keepUsingHelpdeskButtonElement = getByRole('button', {
            name: 'Keep using helpdesk',
        })
        keepUsingHelpdeskButtonElement.click()
        expect(mockHandleOnClose).toHaveBeenCalled()
    })

    it('should go to the next step when continue cancelling is clicked', () => {
        const { getByRole } = render(
            <Provider store={store}>
                <CancelProductModal
                    onClose={jest.fn()}
                    isOpen={true}
                    productType={productType}
                    subscriptionProducts={subscriptionProducts}
                    periodEnd={periodEnd}
                />
            </Provider>,
        )
        const continueCancellingButtonElement = getByRole('button', {
            name: 'Continue cancelling',
        })
        continueCancellingButtonElement.click()
        expect(mockSwitchToNextStep).toHaveBeenCalled()
    })
})
describe('CancelProductModal: step 2', () => {
    beforeEach(() => {
        useCancellationFlowStepsStateMachineMock.mockImplementation(() => ({
            cancellationStep: CancellationFlowStep.cancellationReasons,
            switchToNextStep: mockSwitchToNextStep,
            resetCancellationFlow: jest.fn(),
        }))
    })

    it('should render the cancellation reasons with a corresponding footer and unavailable next step', () => {
        const { getByRole, getByTestId } = render(
            <Provider store={store}>
                <CancelProductModal
                    onClose={jest.fn()}
                    isOpen={true}
                    productType={productType}
                    subscriptionProducts={subscriptionProducts}
                    periodEnd={periodEnd}
                />
            </Provider>,
        )
        expect(getByTestId('cancellation-reasons')).toBeInTheDocument()
        expect(CancellationReasonsMock).toHaveBeenCalledWith(
            {
                reasons: HELPDESK_CANCELLATION_SCENARIO.reasons,
                dispatchCancellationReasonsAction: expect.any(Function),
                reasonsState: DEFAULT_STATE,
            },
            {},
        )

        const keepUsingHelpdeskButtonElement = getByRole('button', {
            name: 'Keep using helpdesk',
        })
        expect(keepUsingHelpdeskButtonElement).toBeInTheDocument()

        const continueCancellingButtonElement = getByRole('button', {
            name: 'Continue cancelling',
        })
        expect(continueCancellingButtonElement).toBeInTheDocument()
        expect(continueCancellingButtonElement).toBeAriaDisabled()
    })

    it('should render the cancellation reasons step with next step unavailable', () => {
        const { getByRole } = render(
            <Provider store={store}>
                <CancelProductModal
                    onClose={jest.fn()}
                    isOpen={true}
                    productType={productType}
                    subscriptionProducts={subscriptionProducts}
                    periodEnd={periodEnd}
                />
            </Provider>,
        )
        expect(CancellationReasonsMock).toHaveBeenCalledWith(
            {
                reasons: HELPDESK_CANCELLATION_SCENARIO.reasons,
                dispatchCancellationReasonsAction: expect.any(Function),
                reasonsState: DEFAULT_STATE,
            },
            {},
        )

        const keepUsingHelpdeskButtonElement = getByRole('button', {
            name: 'Keep using helpdesk',
        })
        expect(keepUsingHelpdeskButtonElement).toBeInTheDocument()

        const continueCancellingButtonElement = getByRole('button', {
            name: 'Continue cancelling',
        })
        expect(continueCancellingButtonElement).toBeInTheDocument()
        expect(continueCancellingButtonElement).toBeAriaDisabled()
    })

    it('should close the modal when the "Keep using helpdesk" button is clicked', () => {
        const mockHandleOnClose = jest.fn()

        const { getByRole } = render(
            <Provider store={store}>
                <CancelProductModal
                    onClose={mockHandleOnClose}
                    isOpen={true}
                    productType={productType}
                    subscriptionProducts={subscriptionProducts}
                    periodEnd={periodEnd}
                />
            </Provider>,
        )
        const keepUsingHelpdeskButtonElement = getByRole('button', {
            name: 'Keep using helpdesk',
        })
        keepUsingHelpdeskButtonElement.click()
        expect(mockHandleOnClose).toHaveBeenCalled()
    })

    it('should go to the next step when continue cancelling is clicked', () => {
        const mockState = {
            ...DEFAULT_STATE,
            primaryReason: { label: 'some primary reason' },
            secondaryReason: { label: 'some secondary reason' },
            completed: true,
        }
        cancellationReasonsReducerMock.mockImplementation(() => mockState)

        const { getByRole } = render(
            <Provider store={store}>
                <CancelProductModal
                    onClose={jest.fn()}
                    isOpen={true}
                    productType={productType}
                    subscriptionProducts={subscriptionProducts}
                    periodEnd={periodEnd}
                />
            </Provider>,
        )
        const continueCancellingButtonElement = getByRole('button', {
            name: 'Continue cancelling',
        })
        expect(continueCancellingButtonElement).toBeAriaEnabled()

        continueCancellingButtonElement.click()
        expect(mockSwitchToNextStep).toHaveBeenCalled()
    })
})
describe('CancelProductModal: step 3', () => {
    const mockState = {
        ...DEFAULT_STATE,
        primaryReason: { label: 'some primary reason' },
        secondaryReason: { label: 'some secondary reason' },
        completed: true,
    }

    beforeEach(() => {
        useCancellationFlowStepsStateMachineMock.mockImplementation(() => ({
            cancellationStep: CancellationFlowStep.churnMitigationOffer,
            switchToNextStep: mockSwitchToNextStep,
            resetCancellationFlow: jest.fn(),
        }))
        cancellationReasonsReducerMock.mockImplementation(() => mockState)
    })

    it('should render the churn mitigation offer with a corresponding footer', () => {
        const { getByRole, getByTestId } = render(
            <Provider store={store}>
                <CancelProductModal
                    onClose={jest.fn()}
                    isOpen={true}
                    productType={productType}
                    subscriptionProducts={subscriptionProducts}
                    periodEnd={periodEnd}
                />
            </Provider>,
        )
        expect(ChurnMitigationOfferMock).toHaveBeenCalledWith(
            { canduContentId: '5f5e3e3e4f3e4e001f3e4e4f' },
            {},
        )
        expect(useFindChurnMitigationOfferMock).toHaveBeenNthCalledWith(
            1,
            null,
            null,
            [],
        )
        expect(useFindChurnMitigationOfferMock).toHaveBeenNthCalledWith(
            2,
            mockState.primaryReason,
            mockState.secondaryReason,
            HELPDESK_CANCELLATION_SCENARIO.reasonsToCanduContents,
        )
        expect(getByTestId('churn-mitigation-offer')).toBeInTheDocument()
        expect(
            getByRole('button', { name: 'Accept offer' }),
        ).toBeInTheDocument()
        expect(
            getByRole('button', { name: 'Continue cancelling' }),
        ).toBeInTheDocument()
    })

    it('should go to the next step when continue cancelling is clicked', () => {
        const { getByRole } = render(
            <Provider store={store}>
                <CancelProductModal
                    onClose={jest.fn()}
                    isOpen={true}
                    productType={productType}
                    subscriptionProducts={subscriptionProducts}
                    periodEnd={periodEnd}
                />
            </Provider>,
        )
        const continueCancellingButtonElement = getByRole('button', {
            name: 'Continue cancelling',
        })
        continueCancellingButtonElement.click()
        expect(mockSwitchToNextStep).toHaveBeenCalled()

        expect(trackBillingEventMock).toHaveBeenCalledWith(
            SegmentEvent.SubscriptionCancellationChurnMitigationOfferDecision,
            {
                product_type: productType,
                primary_reason: mockState.primaryReason.label,
                secondary_reason: mockState.secondaryReason.label,
                other_reason: mockState.otherReason,
                accepted: false,
            },
        )
    })

    it('should close the modal when churn mitigation offer was successfully submitted', async () => {
        sendAcceptedChurnMitigationOfferToSupportMock.mockResolvedValue(true)
        const mockHandleOnClose = jest.fn()
        const { getByRole } = render(
            <Provider store={store}>
                <CancelProductModal
                    onClose={mockHandleOnClose}
                    isOpen={true}
                    productType={productType}
                    subscriptionProducts={subscriptionProducts}
                    periodEnd={periodEnd}
                />
            </Provider>,
        )
        const acceptOfferButtonElement = getByRole('button', {
            name: 'Accept offer',
        })
        fireEvent.click(acceptOfferButtonElement)
        await waitFor(() => {
            expect(
                sendAcceptedChurnMitigationOfferToSupportMock,
            ).toHaveBeenCalledWith({
                productType: productType,
                primaryReason: mockState.primaryReason.label,
                secondaryReason: mockState.secondaryReason.label,
                accountDomain: account.domain,
                userEmail: user.email,
                correspondingChurnMitigationOfferId: '5f5e3e3e4f3e4e001f3e4e4f',
                otherReason: mockState.otherReason,
            })
        })
        expect(mockHandleOnClose).toHaveBeenCalled()
        expect(store.getActions()).toEqual([
            {
                type: 'mocked notify action',
                message: {
                    status: NotificationStatus.Success,
                    message:
                        'We are happy you changed your mind! ' +
                        'Our support team will reach out to you shortly regarding this offer.',
                },
            },
        ])
        expect(trackBillingEventMock).toHaveBeenCalledWith(
            SegmentEvent.SubscriptionCancellationChurnMitigationOfferDecision,
            {
                product_type: productType,
                primary_reason: mockState.primaryReason.label,
                secondary_reason: mockState.secondaryReason.label,
                other_reason: mockState.otherReason,
                accepted: true,
            },
        )
    })

    it('should not close the modal when churn mitigation offer submission failed', async () => {
        sendAcceptedChurnMitigationOfferToSupportMock.mockResolvedValue(false)
        const mockHandleOnClose = jest.fn()
        const { getByRole } = render(
            <Provider store={store}>
                <CancelProductModal
                    onClose={mockHandleOnClose}
                    isOpen={true}
                    productType={productType}
                    subscriptionProducts={subscriptionProducts}
                    periodEnd={periodEnd}
                />
            </Provider>,
        )
        const acceptOfferButtonElement = getByRole('button', {
            name: 'Accept offer',
        })
        fireEvent.click(acceptOfferButtonElement)
        await waitFor(() => {
            expect(
                sendAcceptedChurnMitigationOfferToSupportMock,
            ).toHaveBeenCalled()
        })
        expect(mockHandleOnClose).toHaveBeenCalledTimes(0)
        expect(store.getActions()).toEqual([
            {
                type: 'mocked notify action',
                message: {
                    status: NotificationStatus.Error,
                    message:
                        "Couldn't send the request to our support team. " +
                        'If the problem persists, please contact our billing team via chat or ' +
                        'at <a href="mailto:support@gorgias.com">support@gorgias.com</a> to make this change.',
                    allowHTML: true,
                },
            },
        ])
    })
})
describe('CancelProductModal: step 4', () => {
    beforeEach(() => {
        useCancellationFlowStepsStateMachineMock.mockImplementation(() => ({
            cancellationStep: CancellationFlowStep.cancellationSummary,
            switchToNextStep: mockSwitchToNextStep,
            resetCancellationFlow: jest.fn(),
        }))
    })

    it('should render the cancellation summary with a corresponding footer and disabled button', () => {
        const { getByRole, getByTestId } = render(
            <Provider store={store}>
                <CancelProductModal
                    onClose={jest.fn()}
                    isOpen={true}
                    productType={productType}
                    subscriptionProducts={subscriptionProducts}
                    periodEnd={periodEnd}
                />
            </Provider>,
        )

        expect(CancellationSummaryMock).toHaveBeenCalledWith(
            {
                cancellingProducts:
                    HELPDESK_CANCELLATION_SCENARIO.productsToCancel,
                subscriptionProducts: subscriptionProducts,
                periodEnd: periodEnd,
            },
            {},
        )

        const confirmButtonElement = getByRole('button', {
            name: 'Confirm Auto-Renewal Cancellation',
        })
        expect(confirmButtonElement).toBeInTheDocument()
        expect(confirmButtonElement).toBeAriaDisabled()

        const disclaimerElement = getByTestId('disclaimer')
        expect(disclaimerElement).toBeInTheDocument()
        expect(DisclaimerMock).toHaveBeenCalledWith(
            {
                agreementChecked: false,
                onChange: expect.any(Function),
            },
            {},
        )
    })

    it('should close when the product cancellation was successful', async () => {
        const mockHandleOnClose = jest.fn()
        cancelHelpdeskAutoRenewalMock.mockReturnValueOnce(() =>
            Promise.resolve(true),
        )
        const { getByRole } = render(
            <Provider store={store}>
                <CancelProductModal
                    onClose={mockHandleOnClose}
                    isOpen={true}
                    productType={productType}
                    subscriptionProducts={subscriptionProducts}
                    periodEnd={periodEnd}
                />
            </Provider>,
        )

        const confirmButtonElement = getByRole('button', {
            name: 'Confirm Auto-Renewal Cancellation',
        })
        act(() => {
            getLastMockCall(DisclaimerMock)[0].onChange(true)
        })
        expect(confirmButtonElement).toBeAriaEnabled()

        fireEvent.click(confirmButtonElement)
        await waitFor(() => {
            expect(cancelHelpdeskAutoRenewalMock).toHaveBeenCalledTimes(1)
        })
        expect(mockHandleOnClose).toHaveBeenCalledTimes(1)
    })

    it('should not close when the product cancellation failed', async () => {
        const mockHandleOnClose = jest.fn()
        cancelHelpdeskAutoRenewalMock.mockReturnValueOnce(() =>
            Promise.resolve(false),
        )
        const { getByRole } = render(
            <Provider store={store}>
                <CancelProductModal
                    onClose={mockHandleOnClose}
                    isOpen={true}
                    productType={productType}
                    subscriptionProducts={subscriptionProducts}
                    periodEnd={periodEnd}
                />
            </Provider>,
        )

        const confirmButtonElement = getByRole('button', {
            name: 'Confirm Auto-Renewal Cancellation',
        })
        act(() => {
            getLastMockCall(DisclaimerMock)[0].onChange(true)
        })
        expect(confirmButtonElement).toBeAriaEnabled()

        fireEvent.click(confirmButtonElement)
        await waitFor(() => {
            expect(cancelHelpdeskAutoRenewalMock).toHaveBeenCalledTimes(1)
        })
        expect(mockHandleOnClose).toHaveBeenCalledTimes(0)
    })
})
