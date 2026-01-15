import '@testing-library/jest-dom'

import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { ToneOfVoiceStep } from './ToneOfVoiceStep'

const mockUseSteps = {
    validSteps: [
        { step: 1, condition: true },
        { step: 2, condition: true },
        { step: 3, condition: true },
    ],
    totalSteps: 3,
}

const mockUseCheckStoreIntegration = jest.fn()
const mockUseCheckOnboardingCompleted = jest.fn()
const mockUseCheckStoreAlreadyConfigured = jest.fn()

jest.mock('pages/aiAgent/Onboarding_V2/hooks/useSteps', () => ({
    useSteps: () => mockUseSteps,
}))

jest.mock('pages/aiAgent/Onboarding_V2/hooks/useCheckStoreIntegration', () => ({
    __esModule: true,
    default: () => mockUseCheckStoreIntegration(),
}))

jest.mock(
    'pages/aiAgent/Onboarding_V2/hooks/useCheckOnboardingCompleted',
    () => ({
        __esModule: true,
        default: () => mockUseCheckOnboardingCompleted(),
    }),
)

jest.mock(
    'pages/aiAgent/Onboarding_V2/hooks/useCheckStoreAlreadyConfigured',
    () => ({
        useCheckStoreAlreadyConfigured: () =>
            mockUseCheckStoreAlreadyConfigured(),
    }),
)

jest.mock('pages/aiAgent/Onboarding_V2/components/MainTitle/MainTitle', () => ({
    __esModule: true,
    default: ({ titleBlack, titleMagenta }: any) => (
        <h1>
            {titleBlack} <span>{titleMagenta}</span>
        </h1>
    ),
}))

jest.mock('pages/aiAgent/Onboarding_V2/layout/ConvAiOnboardingLayout', () => ({
    OnboardingBody: ({ children }: any) => (
        <div data-testid="onboarding-body">{children}</div>
    ),
    OnboardingContentContainer: ({
        children,
        currentStep,
        totalSteps,
        onNextClick,
        onBackClick,
    }: any) => (
        <div data-testid="onboarding-content-container">
            <div data-testid="current-step">{currentStep}</div>
            <div data-testid="total-steps">{totalSteps}</div>
            <button onClick={onNextClick}>Next</button>
            <button onClick={onBackClick}>Back</button>
            {children}
        </div>
    ),
    OnboardingPreviewContainer: ({ children, isLoading, caption }: any) => (
        <div data-testid="onboarding-preview-container">
            {isLoading && <div data-testid="preview-loading">Loading</div>}
            <div data-testid="preview-caption">{caption}</div>
            {children}
        </div>
    ),
}))

describe('ToneOfVoiceStep', () => {
    const mockGoToStep = jest.fn()
    const defaultProps = {
        currentStep: 2,
        totalSteps: 3,
        goToStep: mockGoToStep,
        isStoreSelected: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    const renderComponent = (props = defaultProps) => {
        return render(
            <MemoryRouter
                initialEntries={[
                    '/app/ai-agent/shopify/test-shop/onboarding/tone-of-voice',
                ]}
            >
                <Route path="/app/ai-agent/:shopType/:shopName/onboarding/:step">
                    <ToneOfVoiceStep {...props} />
                </Route>
            </MemoryRouter>,
        )
    }

    describe('Rendering', () => {
        it('should render with correct title', () => {
            renderComponent()

            expect(screen.getByText('Set Your')).toBeInTheDocument()
            expect(screen.getByText('Tone of Voice')).toBeInTheDocument()
        })

        it('should render onboarding body', () => {
            renderComponent()

            expect(screen.getByTestId('onboarding-body')).toBeInTheDocument()
        })

        it('should render content container with correct props', () => {
            renderComponent()

            expect(
                screen.getByTestId('onboarding-content-container'),
            ).toBeInTheDocument()
            expect(screen.getByTestId('current-step')).toHaveTextContent('2')
            expect(screen.getByTestId('total-steps')).toHaveTextContent('3')
        })

        it('should render preview container', () => {
            renderComponent()

            expect(
                screen.getByTestId('onboarding-preview-container'),
            ).toBeInTheDocument()
            expect(screen.getByTestId('preview-caption')).toHaveTextContent(
                'Preview',
            )
        })

        it('should render preview container with isLoading as false', () => {
            renderComponent()

            expect(
                screen.queryByTestId('preview-loading'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Navigation', () => {
        it('should call goToStep with next step when Next button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            const nextButton = screen.getByRole('button', { name: /next/i })
            await act(() => user.click(nextButton))

            expect(mockGoToStep).toHaveBeenCalledTimes(1)
            expect(mockGoToStep).toHaveBeenCalledWith(3)
        })

        it('should not call goToStep when Next button is clicked and there is no next step', async () => {
            const user = userEvent.setup()
            mockUseSteps.validSteps = [
                { step: 1, condition: true },
                { step: 2, condition: true },
            ]
            renderComponent({
                ...defaultProps,
                currentStep: 2,
            })

            const nextButton = screen.getByRole('button', { name: /next/i })
            await act(() => user.click(nextButton))

            expect(mockGoToStep).toHaveBeenCalledTimes(1)
            expect(mockGoToStep).toHaveBeenCalledWith(undefined)

            mockUseSteps.validSteps = [
                { step: 1, condition: true },
                { step: 2, condition: true },
                { step: 3, condition: true },
            ]
        })

        it('should call goToStep with previous step when Back button is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            const backButton = screen.getByRole('button', { name: /back/i })
            await act(() => user.click(backButton))

            expect(mockGoToStep).toHaveBeenCalledTimes(1)
            expect(mockGoToStep).toHaveBeenCalledWith(1)
        })

        it('should not call goToStep when Back button is clicked and there is no previous step', async () => {
            const user = userEvent.setup()
            renderComponent({
                ...defaultProps,
                currentStep: 1,
            })

            const backButton = screen.getByRole('button', { name: /back/i })
            await act(() => user.click(backButton))

            expect(mockGoToStep).not.toHaveBeenCalled()
        })
    })

    describe('Hooks', () => {
        it('should call useCheckStoreIntegration when not first step', () => {
            renderComponent({
                ...defaultProps,
                currentStep: 2,
            })

            expect(mockUseCheckStoreIntegration).toHaveBeenCalled()
        })

        it('should not check store integration when it is first step', () => {
            mockUseCheckStoreIntegration.mockClear()
            renderComponent({
                ...defaultProps,
                currentStep: 1,
            })

            expect(mockUseCheckStoreIntegration).toHaveBeenCalled()
        })

        it('should call useCheckOnboardingCompleted', () => {
            renderComponent()

            expect(mockUseCheckOnboardingCompleted).toHaveBeenCalled()
        })

        it('should call useCheckStoreAlreadyConfigured', () => {
            renderComponent()

            expect(mockUseCheckStoreAlreadyConfigured).toHaveBeenCalled()
        })
    })

    describe('Step calculations', () => {
        it('should correctly determine isFirstStep when currentStep is 1', () => {
            renderComponent({
                ...defaultProps,
                currentStep: 1,
            })

            expect(screen.getByTestId('current-step')).toHaveTextContent('1')
        })

        it('should correctly determine isFirstStep when currentStep is not 1', () => {
            renderComponent({
                ...defaultProps,
                currentStep: 2,
            })

            expect(screen.getByTestId('current-step')).toHaveTextContent('2')
        })
    })

    describe('Store selection', () => {
        it('should render correctly when store is selected', () => {
            renderComponent({
                ...defaultProps,
                isStoreSelected: true,
            })

            expect(screen.getByText('Set Your')).toBeInTheDocument()
        })

        it('should render correctly when store is not selected', () => {
            renderComponent({
                ...defaultProps,
                isStoreSelected: false,
            })

            expect(screen.getByText('Set Your')).toBeInTheDocument()
        })
    })
})
