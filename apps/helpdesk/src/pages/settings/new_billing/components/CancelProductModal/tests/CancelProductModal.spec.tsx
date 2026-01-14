import { SegmentEvent } from '@repo/logging'
import { assumeMock, getLastMockCall } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import {
    basicMonthlyHelpdeskPlan,
    convertPlan1,
    currentProductsUsage,
    HELPDESK_PRODUCT_ID,
    proMonthlyAutomationPlan,
    proMonthlyHelpdeskPlan,
    smsPlan1,
    voicePlan0,
} from 'fixtures/plans'
import { user } from 'fixtures/users'
import { trackBillingEvent } from 'models/billing/resources'
import { ProductType } from 'models/billing/types'
import { cancelHelpdeskAutoRenewal } from 'state/currentAccount/actions'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { reportCRMGrowthError } from '../../../utils/reportCRMGrowthError'
import { sendRemoveNotificationZap } from '../../../utils/sendRemoveNotificationZap'
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
import {
    AI_AGENT_CANCELLATION_SCENARIO,
    CONVERT_CANCELLATION_SCENARIO,
    HELPDESK_CANCELLATION_SCENARIO,
    SMS_CANCELLATION_SCENARIO,
    VOICE_CANCELLATION_SCENARIO,
} from '../scenarios'
import Disclaimer from '../UI/Disclaimer'

// components mocks
const mockStore = configureMockStore([thunk])
const store = mockStore({
    billing: fromJS(billingState),
    currentAccount: fromJS({
        ...account,
        current_subscription: {
            products: {
                [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
            },
        },
    }),
    currentUser: fromJS(user),
})
const queryClient = mockQueryClient()

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
jest.mock('../../../utils/sendRemoveNotificationZap')

const sendRemoveNotificationZapMock = assumeMock(sendRemoveNotificationZap)
jest.mock('../../../utils/reportCRMGrowthError')
const reportCRMGrowthErrorMock = assumeMock(reportCRMGrowthError)
const mockSwitchToNextStep = jest.fn()
const mockUpdateSubscription = jest.fn()

// tests setup
beforeEach(() => {
    // Reset all business logic mocks before each test.
    mockSwitchToNextStep.mockReset()
    mockUpdateSubscription.mockReset()
    useCancellationFlowStepsStateMachineMock.mockReset()
    cancellationReasonsReducerMock.mockReset()
    cancelHelpdeskAutoRenewalMock.mockReset()
    useFindChurnMitigationOfferMock.mockReset()
    sendAcceptedChurnMitigationOfferToSupportMock.mockReset()
    sendRemoveNotificationZapMock.mockReset()
    notifyMock.mockReset()
    reportCRMGrowthErrorMock.mockReset()

    // Mock async functions to resolve
    trackBillingEventMock.mockResolvedValue({} as any)
    sendRemoveNotificationZapMock.mockResolvedValue({} as any)

    // Clear query client cache
    queryClient.clear()

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
const mockSetSelectedPlans = jest.fn()
const mockSelectedPlans = {
    [ProductType.Helpdesk]: {
        plan: proMonthlyHelpdeskPlan,
        isSelected: true,
    },
    [ProductType.Automation]: {
        plan: proMonthlyAutomationPlan,
        isSelected: true,
    },
    [ProductType.SMS]: {
        plan: undefined,
        isSelected: false,
    },
    [ProductType.Voice]: {
        plan: voicePlan0,
        isSelected: true,
    },
    [ProductType.Convert]: {
        plan: undefined,
        isSelected: false,
    },
}

// Helper function to render component with required providers
const renderComponent = (ui: React.ReactElement, customStore = store) => {
    return render(
        <Provider store={customStore}>
            <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
        </Provider>,
    )
}

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
        const { getByRole, getByTestId } = renderComponent(
            <CancelProductModal
                onClose={jest.fn()}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
                selectedPlans={mockSelectedPlans}
                setSelectedPlans={mockSetSelectedPlans}
                updateSubscription={mockUpdateSubscription}
            />,
        )

        expect(getByTestId('product-features-fomo')).toBeInTheDocument()
        expect(MockProductFeaturesFOMO).toHaveBeenCalledWith(
            {
                periodEnd: periodEnd,
                features: HELPDESK_CANCELLATION_SCENARIO.features,
                productType: ProductType.Helpdesk,
                productDisplayName: 'Helpdesk',
            },
            {},
        )

        const keepUsingHelpdeskButtonElement = getByRole('button', {
            name: 'Keep My Helpdesk Plan',
        })
        expect(keepUsingHelpdeskButtonElement).toBeInTheDocument()

        const continueCancellingButtonElement = getByRole('button', {
            name: 'Continue To Cancel',
        })
        expect(continueCancellingButtonElement).toBeInTheDocument()
        expect(continueCancellingButtonElement).toBeEnabled()
    })

    it('should close the modal when the "Keep using helpdesk" button is clicked', () => {
        const mockHandleOnClose = jest.fn()

        const { getByRole } = renderComponent(
            <CancelProductModal
                onClose={mockHandleOnClose}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
                selectedPlans={mockSelectedPlans}
                setSelectedPlans={mockSetSelectedPlans}
                updateSubscription={mockUpdateSubscription}
            />,
        )
        const keepUsingHelpdeskButtonElement = getByRole('button', {
            name: 'Keep My Helpdesk Plan',
        })
        keepUsingHelpdeskButtonElement.click()
        expect(mockHandleOnClose).toHaveBeenCalled()
    })

    it('should go to the next step when continue cancelling is clicked', () => {
        const { getByRole } = renderComponent(
            <CancelProductModal
                onClose={jest.fn()}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
                selectedPlans={mockSelectedPlans}
                setSelectedPlans={mockSetSelectedPlans}
                updateSubscription={mockUpdateSubscription}
            />,
        )
        const continueCancellingButtonElement = getByRole('button', {
            name: 'Continue To Cancel',
        })
        continueCancellingButtonElement.click()
        expect(mockSwitchToNextStep).toHaveBeenCalled()
    })

    describe.each([
        {
            productType: ProductType.Voice,
            productName: 'Voice',
            scenario: VOICE_CANCELLATION_SCENARIO,
        },
        {
            productType: ProductType.SMS,
            productName: 'SMS',
            scenario: SMS_CANCELLATION_SCENARIO,
        },
        {
            productType: ProductType.Convert,
            productName: 'Convert',
            scenario: CONVERT_CANCELLATION_SCENARIO,
        },
        {
            productType: ProductType.Automation,
            productName: 'AI Agent',
            scenario: AI_AGENT_CANCELLATION_SCENARIO,
        },
    ])('$productName product', ({ productType, productName, scenario }) => {
        beforeEach(() => {
            useCancellationFlowStepsStateMachineMock.mockImplementation(() => ({
                cancellationStep: CancellationFlowStep.productFeaturesFOMO,
                switchToNextStep: mockSwitchToNextStep,
                resetCancellationFlow: jest.fn(),
            }))
        })

        it('should render ProductFeaturesFOMO with correct props for non-Helpdesk product', () => {
            const { getByTestId } = renderComponent(
                <CancelProductModal
                    onClose={jest.fn()}
                    isOpen={true}
                    productType={productType}
                    subscriptionProducts={subscriptionProducts}
                    periodEnd={periodEnd}
                    selectedPlans={mockSelectedPlans}
                    setSelectedPlans={mockSetSelectedPlans}
                    updateSubscription={mockUpdateSubscription}
                />,
            )

            expect(getByTestId('product-features-fomo')).toBeInTheDocument()
            expect(MockProductFeaturesFOMO).toHaveBeenCalledWith(
                {
                    periodEnd: periodEnd,
                    features: scenario.features,
                    productType: productType,
                    productDisplayName: productName,
                },
                {},
            )
        })
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
        const { getByRole, getByTestId } = renderComponent(
            <CancelProductModal
                onClose={jest.fn()}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
                selectedPlans={mockSelectedPlans}
                setSelectedPlans={mockSetSelectedPlans}
                updateSubscription={mockUpdateSubscription}
            />,
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
            name: 'Keep My Helpdesk Plan',
        })
        expect(keepUsingHelpdeskButtonElement).toBeInTheDocument()

        const continueCancellingButtonElement = getByRole('button', {
            name: 'Continue To Cancel',
        })
        expect(continueCancellingButtonElement).toBeInTheDocument()
        expect(continueCancellingButtonElement).toBeAriaDisabled()
    })

    it('should render the cancellation reasons step with next step unavailable', () => {
        const { getByRole } = renderComponent(
            <CancelProductModal
                onClose={jest.fn()}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
                selectedPlans={mockSelectedPlans}
                setSelectedPlans={mockSetSelectedPlans}
                updateSubscription={mockUpdateSubscription}
            />,
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
            name: 'Keep My Helpdesk Plan',
        })
        expect(keepUsingHelpdeskButtonElement).toBeInTheDocument()

        const continueCancellingButtonElement = getByRole('button', {
            name: 'Continue To Cancel',
        })
        expect(continueCancellingButtonElement).toBeInTheDocument()
        expect(continueCancellingButtonElement).toBeAriaDisabled()
    })

    it('should close the modal when the "Keep using helpdesk" button is clicked', () => {
        const mockHandleOnClose = jest.fn()

        const { getByRole } = renderComponent(
            <CancelProductModal
                onClose={mockHandleOnClose}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
                selectedPlans={mockSelectedPlans}
                setSelectedPlans={mockSetSelectedPlans}
                updateSubscription={mockUpdateSubscription}
            />,
        )
        const keepUsingHelpdeskButtonElement = getByRole('button', {
            name: 'Keep My Helpdesk Plan',
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

        const { getByRole } = renderComponent(
            <CancelProductModal
                onClose={jest.fn()}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
                selectedPlans={mockSelectedPlans}
                setSelectedPlans={mockSetSelectedPlans}
                updateSubscription={mockUpdateSubscription}
            />,
        )
        const continueCancellingButtonElement = getByRole('button', {
            name: 'Continue To Cancel',
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
        const { getByRole, getByTestId } = renderComponent(
            <CancelProductModal
                onClose={jest.fn()}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
                selectedPlans={mockSelectedPlans}
                setSelectedPlans={mockSetSelectedPlans}
                updateSubscription={mockUpdateSubscription}
            />,
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
            getByRole('button', { name: 'Get My Offer' }),
        ).toBeInTheDocument()
        expect(
            getByRole('button', { name: 'Continue To Cancel' }),
        ).toBeInTheDocument()
    })

    it('should go to the next step when continue cancelling is clicked', async () => {
        const { getByRole } = renderComponent(
            <CancelProductModal
                onClose={jest.fn()}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
                selectedPlans={mockSelectedPlans}
                setSelectedPlans={mockSetSelectedPlans}
                updateSubscription={mockUpdateSubscription}
            />,
        )
        const continueCancellingButtonElement = getByRole('button', {
            name: 'Continue To Cancel',
        })
        await act(() => continueCancellingButtonElement.click())

        expect(mockSwitchToNextStep).toHaveBeenCalled()

        expect(trackBillingEventMock).toHaveBeenCalledWith(
            SegmentEvent.SubscriptionCancellationChurnMitigationOfferDecision,
            {
                product_type: productType,
                primary_reason: mockState.primaryReason.label,
                secondary_reason: mockState.secondaryReason.label,
                other_reason: mockState.additionalDetails?.label || null,
                accepted: false,
            },
        )
    })

    it('should still go to next step when trackBillingEvent fails', async () => {
        const trackingError = new Error('Failed to track event')
        trackBillingEventMock.mockRejectedValue(trackingError)

        const { getByRole } = renderComponent(
            <CancelProductModal
                onClose={jest.fn()}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
                selectedPlans={mockSelectedPlans}
                setSelectedPlans={mockSetSelectedPlans}
                updateSubscription={mockUpdateSubscription}
            />,
        )

        const continueCancellingButtonElement = getByRole('button', {
            name: 'Continue To Cancel',
        })
        await act(() => continueCancellingButtonElement.click())

        expect(mockSwitchToNextStep).toHaveBeenCalled()
        expect(reportCRMGrowthErrorMock).toHaveBeenCalledWith(
            trackingError,
            'Failed to track cancellation offer rejection event',
        )
    })

    it('should still go to next step when sendRemoveNotificationZap fails for Automation product', async () => {
        const zapierError = new Error('Failed to send Zapier notification')
        sendRemoveNotificationZapMock.mockRejectedValue(zapierError)

        const { getByRole } = renderComponent(
            <CancelProductModal
                onClose={jest.fn()}
                isOpen={true}
                productType={ProductType.Automation}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
                currentUsage={currentProductsUsage}
                selectedPlans={mockSelectedPlans}
                setSelectedPlans={mockSetSelectedPlans}
                updateSubscription={mockUpdateSubscription}
            />,
        )

        const continueCancellingButtonElement = getByRole('button', {
            name: 'Continue To Cancel',
        })
        await act(() => continueCancellingButtonElement.click())

        expect(mockSwitchToNextStep).toHaveBeenCalled()
        expect(trackBillingEventMock).toHaveBeenCalled()
        expect(reportCRMGrowthErrorMock).toHaveBeenCalledWith(
            zapierError,
            'Failed to send AI Agent removal notification to support',
        )
    })

    it('should handle both tracking and Zapier failures gracefully for Automation', async () => {
        const trackingError = new Error('Tracking failed')
        const zapierError = new Error('Zapier notification failed')
        trackBillingEventMock.mockRejectedValue(trackingError)
        sendRemoveNotificationZapMock.mockRejectedValue(zapierError)

        const { getByRole } = renderComponent(
            <CancelProductModal
                onClose={jest.fn()}
                isOpen={true}
                productType={ProductType.Automation}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
                currentUsage={currentProductsUsage}
                selectedPlans={mockSelectedPlans}
                setSelectedPlans={mockSetSelectedPlans}
                updateSubscription={mockUpdateSubscription}
            />,
        )

        const continueCancellingButton = getByRole('button', {
            name: 'Continue To Cancel',
        })
        await act(() => continueCancellingButton.click())

        expect(mockSwitchToNextStep).toHaveBeenCalled()

        expect(reportCRMGrowthErrorMock).toHaveBeenCalledTimes(2)
        expect(reportCRMGrowthErrorMock).toHaveBeenCalledWith(
            trackingError,
            'Failed to track cancellation offer rejection event',
        )
        expect(reportCRMGrowthErrorMock).toHaveBeenCalledWith(
            zapierError,
            'Failed to send AI Agent removal notification to support',
        )
    })

    it('should NOT update selectedPlans when continuing with Helpdesk cancellation', async () => {
        const mockSetSelectedPlansLocal = jest.fn()

        const { getByRole } = renderComponent(
            <CancelProductModal
                onClose={jest.fn()}
                isOpen={true}
                productType={ProductType.Helpdesk}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
                selectedPlans={mockSelectedPlans}
                setSelectedPlans={mockSetSelectedPlansLocal}
                updateSubscription={mockUpdateSubscription}
            />,
        )

        const continueCancellingButton = getByRole('button', {
            name: 'Continue To Cancel',
        })
        await act(() => continueCancellingButton.click())

        expect(mockSetSelectedPlansLocal).not.toHaveBeenCalled()

        expect(mockSwitchToNextStep).toHaveBeenCalled()
    })

    it('should handle missing secondaryReason and additionalDetails when rejecting offer', async () => {
        // Mock state with only primaryReason
        const minimalMockState = {
            ...DEFAULT_STATE,
            primaryReason: { label: 'Primary reason only' },
            secondaryReason: null,
            additionalDetails: null,
            completed: true,
        }
        cancellationReasonsReducerMock.mockImplementation(
            () => minimalMockState,
        )

        const { getByRole } = renderComponent(
            <CancelProductModal
                onClose={jest.fn()}
                isOpen={true}
                productType={ProductType.Helpdesk}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
                selectedPlans={mockSelectedPlans}
                setSelectedPlans={mockSetSelectedPlans}
                updateSubscription={mockUpdateSubscription}
            />,
        )

        const continueCancellingButton = getByRole('button', {
            name: 'Continue To Cancel',
        })
        await act(() => continueCancellingButton.click())

        // Verify trackBillingEvent was called with null for optional fields
        expect(trackBillingEventMock).toHaveBeenCalledWith(
            SegmentEvent.SubscriptionCancellationChurnMitigationOfferDecision,
            {
                product_type: productType,
                primary_reason: 'Primary reason only',
                secondary_reason: null,
                other_reason: null,
                accepted: false,
            },
        )

        expect(mockSwitchToNextStep).toHaveBeenCalled()
    })

    it('should close the modal when churn mitigation offer was successfully submitted', async () => {
        sendAcceptedChurnMitigationOfferToSupportMock.mockResolvedValue(true)
        const mockHandleOnClose = jest.fn()
        const { getByRole } = renderComponent(
            <CancelProductModal
                onClose={mockHandleOnClose}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
                selectedPlans={mockSelectedPlans}
                setSelectedPlans={mockSetSelectedPlans}
                updateSubscription={mockUpdateSubscription}
            />,
        )
        const acceptOfferButtonElement = getByRole('button', {
            name: 'Get My Offer',
        })
        await act(() => fireEvent.click(acceptOfferButtonElement))
        expect(
            sendAcceptedChurnMitigationOfferToSupportMock,
        ).toHaveBeenCalledWith({
            productType: productType,
            primaryReason: mockState.primaryReason.label,
            secondaryReason: mockState.secondaryReason.label,
            accountDomain: account.domain,
            userEmail: user.email,
            correspondingChurnMitigationOfferId: '5f5e3e3e4f3e4e001f3e4e4f',
            otherReason: mockState.additionalDetails?.label || null,
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
                other_reason: mockState.additionalDetails?.label || null,
                accepted: true,
            },
        )
    })

    it('should not close the modal when churn mitigation offer submission failed', async () => {
        sendAcceptedChurnMitigationOfferToSupportMock.mockResolvedValue(false)
        const mockHandleOnClose = jest.fn()
        const { getByRole } = renderComponent(
            <CancelProductModal
                onClose={mockHandleOnClose}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
                selectedPlans={mockSelectedPlans}
                setSelectedPlans={mockSetSelectedPlans}
                updateSubscription={mockUpdateSubscription}
            />,
        )
        const acceptOfferButtonElement = getByRole('button', {
            name: 'Get My Offer',
        })
        await act(() => fireEvent.click(acceptOfferButtonElement))
        expect(sendAcceptedChurnMitigationOfferToSupportMock).toHaveBeenCalled()
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

    it('should still track acceptance event even when offer submission fails', async () => {
        sendAcceptedChurnMitigationOfferToSupportMock.mockResolvedValue(false)
        const mockHandleOnClose = jest.fn()

        const { getByRole } = renderComponent(
            <CancelProductModal
                onClose={mockHandleOnClose}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
                selectedPlans={mockSelectedPlans}
                setSelectedPlans={mockSetSelectedPlans}
                updateSubscription={mockUpdateSubscription}
            />,
        )

        const acceptOfferButton = getByRole('button', { name: 'Get My Offer' })
        await act(() => fireEvent.click(acceptOfferButton))

        expect(mockHandleOnClose).not.toHaveBeenCalled()

        expect(trackBillingEventMock).toHaveBeenCalledWith(
            SegmentEvent.SubscriptionCancellationChurnMitigationOfferDecision,
            {
                product_type: productType,
                primary_reason: mockState.primaryReason.label,
                secondary_reason: mockState.secondaryReason.label,
                other_reason: mockState.additionalDetails?.label || null,
                accepted: true,
            },
        )

        expect(store.getActions()).toContainEqual(
            expect.objectContaining({
                type: 'mocked notify action',
                message: expect.objectContaining({
                    status: NotificationStatus.Error,
                }),
            }),
        )
    })

    it('should still close modal when trackBillingEvent fails after accepting offer', async () => {
        sendAcceptedChurnMitigationOfferToSupportMock.mockResolvedValue(true)
        const trackingError = new Error('Failed to track acceptance')
        trackBillingEventMock.mockRejectedValue(trackingError)
        const mockHandleOnClose = jest.fn()

        const { getByRole } = renderComponent(
            <CancelProductModal
                onClose={mockHandleOnClose}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
                selectedPlans={mockSelectedPlans}
                setSelectedPlans={mockSetSelectedPlans}
                updateSubscription={mockUpdateSubscription}
            />,
        )

        const acceptOfferButton = getByRole('button', { name: 'Get My Offer' })
        await act(() => fireEvent.click(acceptOfferButton))

        // Modal should close despite tracking failure
        expect(mockHandleOnClose).toHaveBeenCalled()

        // Success notification should be shown
        expect(store.getActions()).toContainEqual(
            expect.objectContaining({
                type: 'mocked notify action',
                message: expect.objectContaining({
                    status: NotificationStatus.Success,
                }),
            }),
        )

        // Error should be reported to Sentry
        expect(reportCRMGrowthErrorMock).toHaveBeenCalledWith(
            trackingError,
            'Failed to track churn mitigation offer acceptance event',
        )
    })

    it('should handle missing secondaryReason and additionalDetails when accepting offer', async () => {
        // Mock state with only primaryReason (no secondary or additional)
        const minimalMockState = {
            ...DEFAULT_STATE,
            primaryReason: { label: 'Primary reason only' },
            secondaryReason: null,
            additionalDetails: null,
            completed: true,
        }
        cancellationReasonsReducerMock.mockImplementation(
            () => minimalMockState,
        )

        sendAcceptedChurnMitigationOfferToSupportMock.mockResolvedValue(true)
        const mockHandleOnClose = jest.fn()

        const { getByRole } = renderComponent(
            <CancelProductModal
                onClose={mockHandleOnClose}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
                selectedPlans={mockSelectedPlans}
                setSelectedPlans={mockSetSelectedPlans}
                updateSubscription={mockUpdateSubscription}
            />,
        )

        const acceptOfferButton = getByRole('button', { name: 'Get My Offer' })
        await act(() => fireEvent.click(acceptOfferButton))

        // Verify modal closed successfully
        expect(mockHandleOnClose).toHaveBeenCalled()

        // Verify sendAcceptedChurnMitigationOfferToSupport was called with null for optional fields
        expect(
            sendAcceptedChurnMitigationOfferToSupportMock,
        ).toHaveBeenCalledWith({
            productType: productType.toString(),
            accountDomain: account.domain,
            userEmail: user.email,
            primaryReason: 'Primary reason only',
            secondaryReason: null,
            otherReason: null,
            correspondingChurnMitigationOfferId: expect.any(String),
        })

        // Verify trackBillingEvent was called with null for optional fields
        expect(trackBillingEventMock).toHaveBeenCalledWith(
            SegmentEvent.SubscriptionCancellationChurnMitigationOfferDecision,
            {
                product_type: productType,
                primary_reason: 'Primary reason only',
                secondary_reason: null,
                other_reason: null,
                accepted: true,
            },
        )
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
        const { getByRole, getByTestId } = renderComponent(
            <CancelProductModal
                onClose={jest.fn()}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
                selectedPlans={mockSelectedPlans}
                setSelectedPlans={mockSetSelectedPlans}
                updateSubscription={mockUpdateSubscription}
            />,
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
        const { getByRole } = renderComponent(
            <CancelProductModal
                onClose={mockHandleOnClose}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
                selectedPlans={mockSelectedPlans}
                setSelectedPlans={mockSetSelectedPlans}
                updateSubscription={mockUpdateSubscription}
            />,
        )

        const confirmButtonElement = getByRole('button', {
            name: 'Confirm Auto-Renewal Cancellation',
        })
        act(() => {
            getLastMockCall(DisclaimerMock)[0].onChange(true)
        })
        expect(confirmButtonElement).toBeAriaEnabled()

        await act(() => fireEvent.click(confirmButtonElement))
        expect(cancelHelpdeskAutoRenewalMock).toHaveBeenCalledTimes(1)
        expect(mockHandleOnClose).toHaveBeenCalledTimes(1)
    })

    it('should not close when the product cancellation failed', async () => {
        const mockHandleOnClose = jest.fn()
        cancelHelpdeskAutoRenewalMock.mockReturnValueOnce(() =>
            Promise.resolve(false),
        )
        const { getByRole } = renderComponent(
            <CancelProductModal
                onClose={mockHandleOnClose}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
                selectedPlans={mockSelectedPlans}
                setSelectedPlans={mockSetSelectedPlans}
                updateSubscription={mockUpdateSubscription}
            />,
        )

        const confirmButtonElement = getByRole('button', {
            name: 'Confirm Auto-Renewal Cancellation',
        })
        act(() => {
            getLastMockCall(DisclaimerMock)[0].onChange(true)
        })
        expect(confirmButtonElement).toBeAriaEnabled()

        await act(() => fireEvent.click(confirmButtonElement))
        expect(cancelHelpdeskAutoRenewalMock).toHaveBeenCalledTimes(1)
        expect(mockHandleOnClose).toHaveBeenCalledTimes(0)
    })

    it('should handle Automation product cancellation failure gracefully', async () => {
        useCancellationFlowStepsStateMachineMock.mockImplementation(() => ({
            cancellationStep: CancellationFlowStep.cancellationSummary,
            switchToNextStep: mockSwitchToNextStep,
            resetCancellationFlow: jest.fn(),
        }))

        const updateError = new Error('Update failed')
        mockUpdateSubscription.mockRejectedValue(updateError)
        const mockOnCancellationConfirmed = jest.fn()
        const mockHandleOnClose = jest.fn()

        const { getByRole } = renderComponent(
            <CancelProductModal
                onClose={mockHandleOnClose}
                isOpen={true}
                productType={ProductType.Automation}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
                selectedPlans={mockSelectedPlans}
                setSelectedPlans={mockSetSelectedPlans}
                updateSubscription={mockUpdateSubscription}
                onCancellationConfirmed={mockOnCancellationConfirmed}
            />,
        )

        const confirmButton = getByRole('button', {
            name: 'Confirm Auto-Renewal Cancellation',
        })
        act(() => {
            getLastMockCall(DisclaimerMock)[0].onChange(true)
        })

        await act(() => fireEvent.click(confirmButton))

        expect(mockHandleOnClose).not.toHaveBeenCalled()
        expect(mockOnCancellationConfirmed).not.toHaveBeenCalled()

        expect(store.getActions()).toContainEqual(
            expect.objectContaining({
                type: 'mocked notify action',
                message: expect.objectContaining({
                    status: NotificationStatus.Error,
                    message: expect.stringContaining('AI Agent'),
                }),
            }),
        )
    })
})

describe('CancelProductModal: AI Agent cancellation flow', () => {
    const mockState = {
        ...DEFAULT_STATE,
        primaryReason: { label: 'Too expensive' },
        secondaryReason: { label: 'Not enough features' },
        completed: true,
    }

    const automationSelectedPlans = {
        ...mockSelectedPlans,
        [ProductType.Automation]: {
            plan: proMonthlyAutomationPlan,
            isSelected: false,
        },
    }

    beforeEach(() => {
        useCancellationFlowStepsStateMachineMock.mockImplementation(() => ({
            cancellationStep: CancellationFlowStep.cancellationSummary,
            switchToNextStep: mockSwitchToNextStep,
            resetCancellationFlow: jest.fn(),
        }))
        cancellationReasonsReducerMock.mockImplementation(() => mockState)
    })

    it('should successfully cancel AI Agent product', async () => {
        const mockHandleOnClose = jest.fn()
        mockUpdateSubscription.mockResolvedValueOnce(undefined)

        const { getByRole } = renderComponent(
            <CancelProductModal
                onClose={mockHandleOnClose}
                isOpen={true}
                productType={ProductType.Automation}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
                selectedPlans={automationSelectedPlans}
                setSelectedPlans={mockSetSelectedPlans}
                updateSubscription={mockUpdateSubscription}
            />,
        )

        const confirmButtonElement = getByRole('button', {
            name: 'Confirm Auto-Renewal Cancellation',
        })

        act(() => {
            getLastMockCall(DisclaimerMock)[0].onChange(true)
        })
        await act(() => fireEvent.click(confirmButtonElement))
        expect(mockUpdateSubscription).toHaveBeenCalled()
        expect(mockHandleOnClose).toHaveBeenCalled()
    })

    it('should send Zapier notification when cancelling AI Agent', async () => {
        useCancellationFlowStepsStateMachineMock.mockImplementation(() => ({
            cancellationStep: CancellationFlowStep.churnMitigationOffer,
            switchToNextStep: mockSwitchToNextStep,
            resetCancellationFlow: jest.fn(),
        }))

        const storeWithUsage = mockStore({
            billing: fromJS(billingState),
            currentAccount: fromJS({
                ...account,
                current_subscription: {
                    products: {
                        [HELPDESK_PRODUCT_ID]: basicMonthlyHelpdeskPlan.plan_id,
                    },
                },
            }),
            currentUser: fromJS(user),
        })

        const currentUsageWithAutomation = {
            ...currentProductsUsage,
            automation: {
                data: {
                    extra_tickets_cost_in_cents: 0,
                    num_tickets: 50,
                    num_extra_tickets: 0,
                },
                meta: {
                    subscription_start_datetime: '2017-08-22T00:46:32+00:00',
                    subscription_end_datetime: '2017-09-05T00:46:32+00:00',
                },
            },
        }

        const { getByRole } = renderComponent(
            <CancelProductModal
                onClose={jest.fn()}
                isOpen={true}
                productType={ProductType.Automation}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
                currentUsage={currentUsageWithAutomation}
                selectedPlans={automationSelectedPlans}
                setSelectedPlans={mockSetSelectedPlans}
                updateSubscription={mockUpdateSubscription}
            />,
            storeWithUsage,
        )

        const continueCancellingButtonElement = getByRole('button', {
            name: 'Continue To Cancel',
        })

        await act(() => continueCancellingButtonElement.click())

        expect(sendRemoveNotificationZapMock).toHaveBeenCalled()
        expect(mockSetSelectedPlans).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should handle missing plan names when sending Zapier notification', async () => {
        const mockState = {
            ...DEFAULT_STATE,
            primaryReason: { label: 'Too expensive' },
            secondaryReason: { label: 'Not enough features' },
            completed: true,
        }
        cancellationReasonsReducerMock.mockImplementation(() => mockState)

        useCancellationFlowStepsStateMachineMock.mockImplementation(() => ({
            cancellationStep: CancellationFlowStep.churnMitigationOffer,
            switchToNextStep: mockSwitchToNextStep,
            resetCancellationFlow: jest.fn(),
        }))

        // Mock store with undefined plan names
        const storeWithNoPlanNames = mockStore({
            billing: fromJS({
                ...billingState,
                subscription_products: {
                    [ProductType.Helpdesk]: undefined,
                    [ProductType.Automation]: undefined,
                },
            }),
            currentAccount: fromJS({
                ...account,
                current_subscription: {
                    products: {},
                },
            }),
            currentUser: fromJS(user),
        })

        const currentUsageWithAutomation = {
            ...currentProductsUsage,
            automation: {
                data: {
                    extra_tickets_cost_in_cents: 0,
                    num_tickets: 50,
                    num_extra_tickets: 0,
                },
                meta: {
                    subscription_start_datetime: '2017-08-22T00:46:32+00:00',
                    subscription_end_datetime: '2017-09-05T00:46:32+00:00',
                },
            },
        }

        const { getByRole } = renderComponent(
            <CancelProductModal
                onClose={jest.fn()}
                isOpen={true}
                productType={ProductType.Automation}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
                currentUsage={currentUsageWithAutomation}
                selectedPlans={automationSelectedPlans}
                setSelectedPlans={mockSetSelectedPlans}
                updateSubscription={mockUpdateSubscription}
            />,
            storeWithNoPlanNames,
        )

        const continueCancellingButton = getByRole('button', {
            name: 'Continue To Cancel',
        })
        await act(() => continueCancellingButton.click())

        // Verify Zapier call was made with empty strings for undefined plan names
        expect(sendRemoveNotificationZapMock).toHaveBeenCalledWith({
            zapierHook: expect.any(String),
            subject: expect.any(String),
            message: expect.any(String),
            from: user.email,
            to: expect.any(String),
            account: account.domain,
            freeTrial: expect.any(Boolean),
            helpdeskPlan: '',
            automationPlan: '',
        })
    })
})

describe('CancelProductModal: Convert and SMS cancellation flows', () => {
    describe.each([
        {
            productType: ProductType.Convert,
            productName: 'Convert',
            plan: convertPlan1,
            primaryReason: 'Not using it',
            secondaryReason: null,
        },
        {
            productType: ProductType.SMS,
            productName: 'SMS',
            plan: smsPlan1,
            primaryReason: 'Too expensive',
            secondaryReason: null,
        },
    ])(
        '$productName cancellation',
        ({ productType, plan, primaryReason, secondaryReason }) => {
            const mockState = {
                ...DEFAULT_STATE,
                primaryReason: { label: primaryReason },
                secondaryReason: secondaryReason
                    ? { label: secondaryReason }
                    : null,
                completed: true,
            }

            const productSelectedPlans = {
                ...mockSelectedPlans,
                [productType]: {
                    plan,
                    isSelected: false,
                },
            }

            beforeEach(() => {
                useCancellationFlowStepsStateMachineMock.mockImplementation(
                    () => ({
                        cancellationStep:
                            CancellationFlowStep.cancellationSummary,
                        switchToNextStep: mockSwitchToNextStep,
                        resetCancellationFlow: jest.fn(),
                    }),
                )
                cancellationReasonsReducerMock.mockImplementation(
                    () => mockState,
                )
            })

            it('should successfully cancel product', async () => {
                const mockHandleOnClose = jest.fn()
                mockUpdateSubscription.mockResolvedValueOnce(undefined)

                const { getByRole } = renderComponent(
                    <CancelProductModal
                        onClose={mockHandleOnClose}
                        isOpen={true}
                        productType={productType}
                        subscriptionProducts={subscriptionProducts}
                        periodEnd={periodEnd}
                        selectedPlans={productSelectedPlans}
                        setSelectedPlans={mockSetSelectedPlans}
                        updateSubscription={mockUpdateSubscription}
                    />,
                )

                const confirmButtonElement = getByRole('button', {
                    name: 'Confirm Auto-Renewal Cancellation',
                })

                act(() => {
                    getLastMockCall(DisclaimerMock)[0].onChange(true)
                })

                await act(() => fireEvent.click(confirmButtonElement))

                expect(mockUpdateSubscription).toHaveBeenCalled()
                expect(mockHandleOnClose).toHaveBeenCalled()
            })

            it('should update selectedPlans when product is cancelled', async () => {
                useCancellationFlowStepsStateMachineMock.mockImplementation(
                    () => ({
                        cancellationStep:
                            CancellationFlowStep.churnMitigationOffer,
                        switchToNextStep: mockSwitchToNextStep,
                        resetCancellationFlow: jest.fn(),
                    }),
                )

                const { getByRole } = renderComponent(
                    <CancelProductModal
                        onClose={jest.fn()}
                        isOpen={true}
                        productType={productType}
                        subscriptionProducts={subscriptionProducts}
                        periodEnd={periodEnd}
                        selectedPlans={productSelectedPlans}
                        setSelectedPlans={mockSetSelectedPlans}
                        updateSubscription={mockUpdateSubscription}
                    />,
                )

                const continueCancellingButtonElement = getByRole('button', {
                    name: 'Continue To Cancel',
                })

                await act(() => continueCancellingButtonElement.click())

                expect(mockSetSelectedPlans).toHaveBeenCalledWith(
                    expect.any(Function),
                )
            })

            it('should NOT send Zapier notification when cancelling', async () => {
                useCancellationFlowStepsStateMachineMock.mockImplementation(
                    () => ({
                        cancellationStep:
                            CancellationFlowStep.churnMitigationOffer,
                        switchToNextStep: mockSwitchToNextStep,
                        resetCancellationFlow: jest.fn(),
                    }),
                )

                const { getByRole } = renderComponent(
                    <CancelProductModal
                        onClose={jest.fn()}
                        isOpen={true}
                        productType={productType}
                        subscriptionProducts={subscriptionProducts}
                        periodEnd={periodEnd}
                        selectedPlans={productSelectedPlans}
                        setSelectedPlans={mockSetSelectedPlans}
                        updateSubscription={mockUpdateSubscription}
                    />,
                )

                const continueCancellingButtonElement = getByRole('button', {
                    name: 'Continue To Cancel',
                })

                await act(() => continueCancellingButtonElement.click())

                expect(mockSwitchToNextStep).toHaveBeenCalled()
                expect(sendRemoveNotificationZapMock).not.toHaveBeenCalled()
            })

            it('should update selectedPlans state when rejecting offer', async () => {
                useCancellationFlowStepsStateMachineMock.mockImplementation(
                    () => ({
                        cancellationStep:
                            CancellationFlowStep.churnMitigationOffer,
                        switchToNextStep: mockSwitchToNextStep,
                        resetCancellationFlow: jest.fn(),
                    }),
                )

                const mockSetSelectedPlansLocal = jest.fn()
                const productSelectedPlansForTest = {
                    ...mockSelectedPlans,
                    [productType]: {
                        plan,
                        isSelected: true,
                    },
                }

                const { getByRole } = renderComponent(
                    <CancelProductModal
                        onClose={jest.fn()}
                        isOpen={true}
                        productType={productType}
                        subscriptionProducts={subscriptionProducts}
                        periodEnd={periodEnd}
                        selectedPlans={productSelectedPlansForTest}
                        setSelectedPlans={mockSetSelectedPlansLocal}
                        updateSubscription={mockUpdateSubscription}
                    />,
                )

                const continueCancellingButton = getByRole('button', {
                    name: 'Continue To Cancel',
                })
                await act(() => continueCancellingButton.click())

                // Verify setSelectedPlans was called with callback
                expect(mockSetSelectedPlansLocal).toHaveBeenCalled()

                // Execute the callback to verify its logic
                const setSelectedPlansCallback =
                    mockSetSelectedPlansLocal.mock.calls[0][0]
                const result = setSelectedPlansCallback(
                    productSelectedPlansForTest,
                )

                // Verify the callback updates the product to not selected
                // Plan object is retained for cancellation detection
                expect(result[productType]).toEqual({
                    ...productSelectedPlansForTest[productType],
                    isSelected: false,
                })
            })
        },
    )
})

describe('CancelProductModal: Modal Headers', () => {
    describe.each([
        { productType: ProductType.Helpdesk, productName: 'Helpdesk' },
        { productType: ProductType.Automation, productName: 'AI Agent' },
        { productType: ProductType.Voice, productName: 'Voice' },
        { productType: ProductType.SMS, productName: 'SMS' },
        { productType: ProductType.Convert, productName: 'Convert' },
    ])('$productName product', ({ productType, productName }) => {
        it('should display "Are you sure" header for productFeaturesFOMO step', () => {
            useCancellationFlowStepsStateMachineMock.mockImplementation(() => ({
                cancellationStep: CancellationFlowStep.productFeaturesFOMO,
                switchToNextStep: mockSwitchToNextStep,
                resetCancellationFlow: jest.fn(),
            }))

            const { getByText } = renderComponent(
                <CancelProductModal
                    onClose={jest.fn()}
                    isOpen={true}
                    productType={productType}
                    subscriptionProducts={subscriptionProducts}
                    periodEnd={periodEnd}
                    selectedPlans={mockSelectedPlans}
                    setSelectedPlans={mockSetSelectedPlans}
                    updateSubscription={mockUpdateSubscription}
                />,
            )

            expect(
                getByText(
                    `Are you sure you want to cancel your ${productName} plan?`,
                ),
            ).toBeInTheDocument()
        })

        it('should display "Cancel auto-renewal" header for cancellationReasons step', () => {
            useCancellationFlowStepsStateMachineMock.mockImplementation(() => ({
                cancellationStep: CancellationFlowStep.cancellationReasons,
                switchToNextStep: mockSwitchToNextStep,
                resetCancellationFlow: jest.fn(),
            }))

            const { getByText } = renderComponent(
                <CancelProductModal
                    onClose={jest.fn()}
                    isOpen={true}
                    productType={productType}
                    subscriptionProducts={subscriptionProducts}
                    periodEnd={periodEnd}
                    selectedPlans={mockSelectedPlans}
                    setSelectedPlans={mockSetSelectedPlans}
                    updateSubscription={mockUpdateSubscription}
                />,
            )

            expect(
                getByText(`Cancel ${productName} auto-renewal`),
            ).toBeInTheDocument()
        })

        it('should display "Before you go" header for churnMitigationOffer step', () => {
            useCancellationFlowStepsStateMachineMock.mockImplementation(() => ({
                cancellationStep: CancellationFlowStep.churnMitigationOffer,
                switchToNextStep: mockSwitchToNextStep,
                resetCancellationFlow: jest.fn(),
            }))
            cancellationReasonsReducerMock.mockImplementation(() => ({
                ...DEFAULT_STATE,
                primaryReason: { label: 'some reason' },
                completed: true,
            }))

            const { getByText } = renderComponent(
                <CancelProductModal
                    onClose={jest.fn()}
                    isOpen={true}
                    productType={productType}
                    subscriptionProducts={subscriptionProducts}
                    periodEnd={periodEnd}
                    selectedPlans={mockSelectedPlans}
                    setSelectedPlans={mockSetSelectedPlans}
                    updateSubscription={mockUpdateSubscription}
                />,
            )

            expect(
                getByText(
                    "Before you go—let's find the best option for your business",
                ),
            ).toBeInTheDocument()
        })

        it('should display "Cancel auto-renewal" header for cancellationSummary step', () => {
            useCancellationFlowStepsStateMachineMock.mockImplementation(() => ({
                cancellationStep: CancellationFlowStep.cancellationSummary,
                switchToNextStep: mockSwitchToNextStep,
                resetCancellationFlow: jest.fn(),
            }))

            const { getByText } = renderComponent(
                <CancelProductModal
                    onClose={jest.fn()}
                    isOpen={true}
                    productType={productType}
                    subscriptionProducts={subscriptionProducts}
                    periodEnd={periodEnd}
                    selectedPlans={mockSelectedPlans}
                    setSelectedPlans={mockSetSelectedPlans}
                    updateSubscription={mockUpdateSubscription}
                />,
            )

            expect(
                getByText(`Cancel ${productName} auto-renewal`),
            ).toBeInTheDocument()
        })
    })
})
describe('Modal state management', () => {
    it('should reset all state when modal is reopened', () => {
        const resetMock = jest.fn()
        useCancellationFlowStepsStateMachineMock.mockImplementation(() => ({
            cancellationStep: CancellationFlowStep.productFeaturesFOMO,
            switchToNextStep: mockSwitchToNextStep,
            resetCancellationFlow: resetMock,
        }))

        const { rerender } = renderComponent(
            <CancelProductModal
                onClose={jest.fn()}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
                selectedPlans={mockSelectedPlans}
                setSelectedPlans={mockSetSelectedPlans}
                updateSubscription={mockUpdateSubscription}
            />,
        )

        expect(useCancellationFlowStepsStateMachineMock).toHaveBeenCalled()

        rerender(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <CancelProductModal
                        onClose={jest.fn()}
                        isOpen={false}
                        productType={productType}
                        subscriptionProducts={subscriptionProducts}
                        periodEnd={periodEnd}
                        selectedPlans={mockSelectedPlans}
                        setSelectedPlans={mockSetSelectedPlans}
                        updateSubscription={mockUpdateSubscription}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        rerender(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <CancelProductModal
                        onClose={jest.fn()}
                        isOpen={true}
                        productType={productType}
                        subscriptionProducts={subscriptionProducts}
                        periodEnd={periodEnd}
                        selectedPlans={mockSelectedPlans}
                        setSelectedPlans={mockSetSelectedPlans}
                        updateSubscription={mockUpdateSubscription}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        expect(resetMock).toHaveBeenCalled()
    })
})
