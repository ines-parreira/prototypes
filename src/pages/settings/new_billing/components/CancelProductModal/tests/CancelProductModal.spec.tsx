import React from 'react'
import {fireEvent, render, act} from '@testing-library/react'
import {
    proMonthlyAutomationPrice,
    proMonthlyHelpdeskPrice,
    voicePrice0,
} from 'fixtures/productPrices'
import {assumeMock, getLastMockCall} from 'utils/testing'
import CancelProductModal from '../CancelProductModal'
import {ProductType} from '../../../../../../models/billing/types'
import ProductFeaturesFOMO from '../ProductFeaturesFOMO'
import {HELPDESK_CANCELLATION_SCENARIO} from '../scenarios'
import CancellationReasons from '../CancellationReasons'
import {CancellationFlowStep} from '../constants'
import {useCancellationFlowStepsStateMachine} from '../hooks'
import {cancellationReasonsReducer, DEFAULT_STATE} from '../reducers'
import ChurnMitigationOffer from '../ChurnMitigationOffer'
import CancellationSummary from '../CancellationSummary'
import Disclaimer from '../UI/Disclaimer'

// components mocks

jest.mock('../ProductFeaturesFOMO/ProductFeaturesFOMO', () =>
    jest.fn(() => <div data-testid="product-features-fomo"></div>)
)
const MockProductFeaturesFOMO = assumeMock(ProductFeaturesFOMO)

jest.mock('../CancellationReasons/CancellationReasons', () =>
    jest.fn(() => <div data-testid="cancellation-reasons"></div>)
)
const CancellationReasonsMock = assumeMock(CancellationReasons)

jest.mock('../ChurnMitigationOffer/ChurnMitigationOffer', () =>
    jest.fn(() => <div data-testid="churn-mitigation-offer"></div>)
)
const ChurnMitigationOfferMock = assumeMock(ChurnMitigationOffer)

jest.mock('../CancellationSummary/CancellationSummary', () =>
    jest.fn(() => <div data-testid="cancellation-summary"></div>)
)
const CancellationSummaryMock = assumeMock(CancellationSummary)

jest.mock('../UI/Disclaimer', () =>
    jest.fn(() => <div data-testid="disclaimer" />)
)
const DisclaimerMock = assumeMock(Disclaimer)

// business logic mocks
jest.mock('../hooks')
const useCancellationFlowStepsStateMachineMock = assumeMock(
    useCancellationFlowStepsStateMachine
)

jest.mock('../reducers')
const cancellationReasonsReducerMock = assumeMock(cancellationReasonsReducer)

const mockSwitchToNextStep = jest.fn()

// tests setup
beforeEach(() => {
    // Reset all business logic mocks before each test.
    mockSwitchToNextStep.mockReset()
    useCancellationFlowStepsStateMachineMock.mockReset()
    cancellationReasonsReducerMock.mockReset()

    // Set the default reducer state
    cancellationReasonsReducerMock.mockImplementation(() => DEFAULT_STATE)
    useCancellationFlowStepsStateMachineMock.mockImplementation(() => ({
        cancellationStep: CancellationFlowStep.productFeaturesFOMO,
        switchToNextStep: mockSwitchToNextStep,
        resetCancellationFlow: jest.fn(),
    }))
})

// constants
const subscriptionProducts = {
    [ProductType.Helpdesk]: proMonthlyHelpdeskPrice,
    [ProductType.Automation]: proMonthlyAutomationPrice,
    [ProductType.SMS]: null,
    [ProductType.Voice]: voicePrice0,
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
        const {getByRole, getByTestId} = render(
            <CancelProductModal
                onClose={jest.fn()}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
            />
        )

        expect(getByTestId('product-features-fomo')).toBeInTheDocument()
        expect(MockProductFeaturesFOMO).toHaveBeenCalledWith(
            {
                periodEnd: periodEnd,
                features: HELPDESK_CANCELLATION_SCENARIO.features,
            },
            {}
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

        const {getByRole} = render(
            <CancelProductModal
                onClose={mockHandleOnClose}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
            />
        )
        const keepUsingHelpdeskButtonElement = getByRole('button', {
            name: 'Keep using helpdesk',
        })
        keepUsingHelpdeskButtonElement.click()
        expect(mockHandleOnClose).toHaveBeenCalled()
    })

    it('should go to the next step when continue cancelling is clicked', () => {
        const {getByRole} = render(
            <CancelProductModal
                onClose={jest.fn()}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
            />
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
        const {getByRole, getByTestId} = render(
            <CancelProductModal
                onClose={jest.fn()}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
            />
        )
        expect(getByTestId('cancellation-reasons')).toBeInTheDocument()
        expect(CancellationReasonsMock).toHaveBeenCalledWith(
            {
                reasons: HELPDESK_CANCELLATION_SCENARIO.reasons,
                dispatchCancellationReasonsAction: expect.any(Function),
                reasonsState: DEFAULT_STATE,
            },
            {}
        )

        const keepUsingHelpdeskButtonElement = getByRole('button', {
            name: 'Keep using helpdesk',
        })
        expect(keepUsingHelpdeskButtonElement).toBeInTheDocument()

        const continueCancellingButtonElement = getByRole('button', {
            name: 'Continue cancelling',
        })
        expect(continueCancellingButtonElement).toBeInTheDocument()
        expect(continueCancellingButtonElement).toHaveClass('isDisabled')
    })

    it('should render the cancellation reasons step with next step unavailable', () => {
        const {getByRole} = render(
            <CancelProductModal
                onClose={jest.fn()}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
            />
        )
        expect(CancellationReasonsMock).toHaveBeenCalledWith(
            {
                reasons: HELPDESK_CANCELLATION_SCENARIO.reasons,
                dispatchCancellationReasonsAction: expect.any(Function),
                reasonsState: DEFAULT_STATE,
            },
            {}
        )

        const keepUsingHelpdeskButtonElement = getByRole('button', {
            name: 'Keep using helpdesk',
        })
        expect(keepUsingHelpdeskButtonElement).toBeInTheDocument()

        const continueCancellingButtonElement = getByRole('button', {
            name: 'Continue cancelling',
        })
        expect(continueCancellingButtonElement).toBeInTheDocument()
        expect(continueCancellingButtonElement).toHaveClass('isDisabled')
    })

    it('should close the modal when the "Keep using helpdesk" button is clicked', () => {
        const mockHandleOnClose = jest.fn()

        const {getByRole} = render(
            <CancelProductModal
                onClose={mockHandleOnClose}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
            />
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
            primaryReason: {label: 'some primary reason'},
            secondaryReason: {label: 'some secondary reason'},
            completed: true,
        }
        cancellationReasonsReducerMock.mockImplementation(() => mockState)

        const {getByRole} = render(
            <CancelProductModal
                onClose={jest.fn()}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
            />
        )
        const continueCancellingButtonElement = getByRole('button', {
            name: 'Continue cancelling',
        })
        expect(continueCancellingButtonElement).not.toHaveClass('isDisabled')

        continueCancellingButtonElement.click()
        expect(mockSwitchToNextStep).toHaveBeenCalled()
    })
})
describe('CancelProductModal: step 3', () => {
    const mockState = {
        ...DEFAULT_STATE,
        primaryReason: {label: 'some primary reason'},
        secondaryReason: {label: 'some secondary reason'},
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
        const {getByRole, getByTestId} = render(
            <CancelProductModal
                onClose={jest.fn()}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
            />
        )
        expect(ChurnMitigationOfferMock).toHaveBeenCalledWith(
            {
                primaryReason: mockState.primaryReason,
                reasonsToCanduContent:
                    HELPDESK_CANCELLATION_SCENARIO.reasonsToCanduContents,
                secondaryReason: mockState.secondaryReason,
            },
            {}
        )
        expect(getByTestId('churn-mitigation-offer')).toBeInTheDocument()
        expect(getByRole('button', {name: 'Accept offer'})).toBeInTheDocument()
        expect(
            getByRole('button', {name: 'Continue cancelling'})
        ).toBeInTheDocument()
    })

    it('should go to the next step when continue cancelling is clicked', () => {
        const {getByRole} = render(
            <CancelProductModal
                onClose={jest.fn()}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
            />
        )
        const continueCancellingButtonElement = getByRole('button', {
            name: 'Continue cancelling',
        })
        continueCancellingButtonElement.click()
        expect(mockSwitchToNextStep).toHaveBeenCalled()
    })

    it('should close when churn mitigation offer is accepted', () => {
        const mockHandleOnClose = jest.fn()
        const {getByRole} = render(
            <CancelProductModal
                onClose={mockHandleOnClose}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
            />
        )
        const continueCancellingButtonElement = getByRole('button', {
            name: 'Accept offer',
        })
        continueCancellingButtonElement.click()
        expect(mockHandleOnClose).toHaveBeenCalled()
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
        const {getByRole, getByTestId} = render(
            <CancelProductModal
                onClose={jest.fn()}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
            />
        )

        expect(CancellationSummaryMock).toHaveBeenCalledWith(
            {
                cancellingProducts:
                    HELPDESK_CANCELLATION_SCENARIO.productsToCancel,
                subscriptionProducts: subscriptionProducts,
                periodEnd: periodEnd,
            },
            {}
        )

        const confirmButtonElement = getByRole('button', {
            name: 'Confirm Auto-Renewal Cancellation',
        })
        expect(confirmButtonElement).toBeInTheDocument()
        expect(confirmButtonElement).toHaveClass('isDisabled')

        const disclaimerElement = getByTestId('disclaimer')
        expect(disclaimerElement).toBeInTheDocument()
        expect(DisclaimerMock).toHaveBeenCalledWith(
            {
                agreementChecked: false,
                onChange: expect.any(Function),
            },
            {}
        )
    })

    it('should close when the confirmation button is clicked', () => {
        const mockHandleOnClose = jest.fn()
        const {getByRole} = render(
            <CancelProductModal
                onClose={mockHandleOnClose}
                isOpen={true}
                productType={productType}
                subscriptionProducts={subscriptionProducts}
                periodEnd={periodEnd}
            />
        )

        const confirmButtonElement = getByRole('button', {
            name: 'Confirm Auto-Renewal Cancellation',
        })
        act(() => {
            getLastMockCall(DisclaimerMock)[0].onChange(true)
        })
        expect(confirmButtonElement).not.toHaveClass('isDisabled')

        fireEvent.click(confirmButtonElement)
        expect(mockHandleOnClose).toHaveBeenCalled()
    })
})
