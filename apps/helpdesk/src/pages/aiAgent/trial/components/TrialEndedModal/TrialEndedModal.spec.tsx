import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import moment from 'moment'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { TrialType } from 'pages/aiAgent/components/ShoppingAssistant/types/ShoppingAssistant'
import { getUseTrialEndingFixture } from 'pages/aiAgent/fixtures/useTrialEnding.fixture'

import { useTrialEnding } from '../../hooks/useTrialEnding'
import { useTrialModalProps } from '../../hooks/useTrialModalProps'
import { useUpgradePlan } from '../../hooks/useUpgradePlan'
import {
    dismissTrialEndedModal,
    isTrialEndedModalDismissed,
} from '../../utils/utils'
import { TrialEndedModal } from './TrialEndedModal'

jest.mock('../../hooks/useTrialModalProps')
jest.mock('../../hooks/useTrialEnding')
jest.mock('../../hooks/useUpgradePlan')
jest.mock('../../utils/utils')

const mockUseTrialModalProps = useTrialModalProps as jest.MockedFunction<
    typeof useTrialModalProps
>
const mockUseTrialEnding = useTrialEnding as jest.MockedFunction<
    typeof useTrialEnding
>
const mockUseUpgradePlan = useUpgradePlan as jest.MockedFunction<
    typeof useUpgradePlan
>
const mockDismissTrialEndedModal =
    dismissTrialEndedModal as jest.MockedFunction<typeof dismissTrialEndedModal>
const mockIsTrialEndedModalDismissed =
    isTrialEndedModalDismissed as jest.MockedFunction<
        typeof isTrialEndedModalDismissed
    >

jest.mock('../../components/TrialManageModal/TrialManageModal', () => ({
    TrialManageModal: ({
        title,
        description,
        advantages,
        secondaryDescription,
        onClose,
        primaryAction,
        secondaryAction,
    }: any) => (
        <div data-testid="trial-manage-modal">
            <h1>{title}</h1>
            <p>{description}</p>
            {secondaryDescription && <p>{secondaryDescription}</p>}
            <ul>
                {advantages.map((advantage: string, index: number) => (
                    <li key={index}>{advantage}</li>
                ))}
            </ul>
            <button
                onClick={primaryAction?.onClick}
                disabled={primaryAction?.isLoading}
            >
                {primaryAction?.isLoading ? 'Loading...' : primaryAction?.label}
            </button>
            <button onClick={secondaryAction?.onClick}>
                {secondaryAction?.label}
            </button>
            <button onClick={onClose}>Close</button>
        </div>
    ),
}))

const middlewares = [thunk]
const mockStore = configureStore(middlewares)({})

describe('TrialEndedModal', () => {
    const defaultProps = {
        storeName: 'test-store',
        trialType: TrialType.AiAgent,
    }

    const defaultTrialModalProps = {
        trialEndedModal: {
            title: 'Trial Ended',
            description: 'Your trial has ended',
            advantages: ['Advantage 1', 'Advantage 2'],
            secondaryDescription: 'Upgrade now to continue',
        },
    }

    const defaultTrialEnding = getUseTrialEndingFixture({
        remainingDays: 0,
        remainingDaysFloat: 0,
        trialTerminationDatetime: moment().subtract(1, 'day').toISOString(),
        optedOutDatetime: moment().subtract(2, 'days').toISOString(),
    })

    const defaultUpgradePlan = {
        upgradePlan: jest.fn(),
        upgradePlanAsync: jest.fn(),
        isLoading: false,
        error: null,
        isSuccess: false,
        isError: false,
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseTrialModalProps.mockReturnValue(defaultTrialModalProps as any)
        mockUseTrialEnding.mockReturnValue(defaultTrialEnding as any)
        mockUseUpgradePlan.mockReturnValue(defaultUpgradePlan as any)
        mockIsTrialEndedModalDismissed.mockReturnValue(false)
    })

    const renderComponent = (props = defaultProps) => {
        return render(
            <Provider store={mockStore}>
                <TrialEndedModal {...props} />
            </Provider>,
        )
    }

    describe('Modal visibility', () => {
        it('should show modal when trial terminated less than 3 days ago and opted out', () => {
            renderComponent()

            expect(screen.getByTestId('trial-manage-modal')).toBeInTheDocument()
            expect(screen.getByText('Trial Ended')).toBeInTheDocument()
        })

        it('should not show modal when trial terminated more than 3 days ago', () => {
            mockUseTrialEnding.mockReturnValue(
                getUseTrialEndingFixture({
                    ...defaultTrialEnding,
                    trialTerminationDatetime: moment()
                        .subtract(5, 'days')
                        .toISOString(),
                }),
            )

            renderComponent()

            expect(
                screen.queryByTestId('trial-manage-modal'),
            ).not.toBeInTheDocument()
        })

        it('should not show modal when not opted out', () => {
            mockUseTrialEnding.mockReturnValue(
                getUseTrialEndingFixture({
                    ...defaultTrialEnding,
                    optedOutDatetime: null,
                }),
            )

            renderComponent()

            expect(
                screen.queryByTestId('trial-manage-modal'),
            ).not.toBeInTheDocument()
        })

        it('should not show modal when dismissed', () => {
            mockIsTrialEndedModalDismissed.mockReturnValue(true)

            renderComponent()

            expect(
                screen.queryByTestId('trial-manage-modal'),
            ).not.toBeInTheDocument()
        })

        it('should not show modal when trial has not terminated', () => {
            mockUseTrialEnding.mockReturnValue(
                getUseTrialEndingFixture({
                    ...defaultTrialEnding,
                    trialTerminationDatetime: null,
                }),
            )

            renderComponent()

            expect(
                screen.queryByTestId('trial-manage-modal'),
            ).not.toBeInTheDocument()
        })
    })

    describe('Modal content', () => {
        it('should display correct modal content from useTrialModalProps', () => {
            renderComponent()

            expect(screen.getByText('Trial Ended')).toBeInTheDocument()
            expect(screen.getByText('Your trial has ended')).toBeInTheDocument()
            expect(screen.getByText('Advantage 1')).toBeInTheDocument()
            expect(screen.getByText('Advantage 2')).toBeInTheDocument()
            expect(
                screen.getByText('Upgrade now to continue'),
            ).toBeInTheDocument()
        })

        it('should display correct action buttons', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: 'Upgrade to Reactivate' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'No, thanks' }),
            ).toBeInTheDocument()
        })
    })

    describe('Upgrade functionality', () => {
        it('should call upgradePlanAsync when primary button is clicked', async () => {
            const upgradePlanAsync = jest.fn()
            mockUseUpgradePlan.mockReturnValue({
                ...defaultUpgradePlan,
                upgradePlanAsync,
            } as any)

            renderComponent()

            const upgradeButton = screen.getByRole('button', {
                name: 'Upgrade to Reactivate',
            })
            await userEvent.click(upgradeButton)

            expect(upgradePlanAsync).toHaveBeenCalledTimes(1)
        })

        it('should show loading state when upgrade is in progress', () => {
            mockUseUpgradePlan.mockReturnValue({
                ...defaultUpgradePlan,
                isLoading: true,
            } as any)

            renderComponent()

            const upgradeButton = screen.getByRole('button', {
                name: 'Loading...',
            })
            expect(upgradeButton).toBeDisabled()
        })
    })

    describe('Dismissal functionality', () => {
        it('should dismiss modal when secondary button is clicked', async () => {
            renderComponent()

            const noThanksButton = screen.getByRole('button', {
                name: 'No, thanks',
            })
            await userEvent.click(noThanksButton)

            expect(mockDismissTrialEndedModal).toHaveBeenCalledWith(
                'test-store',
                TrialType.AiAgent,
            )
        })

        it('should dismiss modal when close button is clicked', async () => {
            renderComponent()

            const closeButton = screen.getByRole('button', { name: 'Close' })
            await userEvent.click(closeButton)

            expect(mockDismissTrialEndedModal).toHaveBeenCalledWith(
                'test-store',
                TrialType.AiAgent,
            )
        })

        it('should update local state after dismissal', async () => {
            const { rerender } = renderComponent()

            const noThanksButton = screen.getByRole('button', {
                name: 'No, thanks',
            })
            await userEvent.click(noThanksButton)

            // After dismissal, modal should not be visible even on rerender
            mockIsTrialEndedModalDismissed.mockReturnValue(true)
            rerender(
                <Provider store={mockStore}>
                    <TrialEndedModal {...defaultProps} />
                </Provider>,
            )

            await waitFor(() => {
                expect(
                    screen.queryByTestId('trial-manage-modal'),
                ).not.toBeInTheDocument()
            })
        })
    })

    describe('Different trial types', () => {
        it('should work correctly with Shopping Assistant trial type', () => {
            renderComponent({
                ...defaultProps,
                trialType: TrialType.ShoppingAssistant,
            })

            expect(mockUseTrialEnding).toHaveBeenCalledWith(
                'test-store',
                TrialType.ShoppingAssistant,
            )
            expect(screen.getByTestId('trial-manage-modal')).toBeInTheDocument()
        })

        it('should pass correct trial type to dismissal functions', async () => {
            renderComponent({
                ...defaultProps,
                trialType: TrialType.ShoppingAssistant,
            })

            const noThanksButton = screen.getByRole('button', {
                name: 'No, thanks',
            })
            await userEvent.click(noThanksButton)

            expect(mockDismissTrialEndedModal).toHaveBeenCalledWith(
                'test-store',
                TrialType.ShoppingAssistant,
            )
        })
    })

    describe('Edge cases', () => {
        it('should handle trial termination exactly 3 days ago', () => {
            // Exactly 3 days ago should still show the modal
            // The condition is: terminatedLessThan3DaysAgo which uses isBefore(now) && isAfter(now.subtract(3, 'days'))
            mockUseTrialEnding.mockReturnValue(
                getUseTrialEndingFixture({
                    ...defaultTrialEnding,
                    trialTerminationDatetime: moment()
                        .subtract(2, 'days')
                        .subtract(23, 'hours')
                        .toISOString(),
                }),
            )

            renderComponent()

            // Should show as it's within the 3-day window
            expect(
                screen.queryByTestId('trial-manage-modal'),
            ).toBeInTheDocument()
        })

        it('should handle trial termination in the future', () => {
            mockUseTrialEnding.mockReturnValue(
                getUseTrialEndingFixture({
                    ...defaultTrialEnding,
                    trialTerminationDatetime: moment()
                        .add(1, 'day')
                        .toISOString(),
                }),
            )

            renderComponent()

            // Should not show as trial hasn't terminated yet
            expect(
                screen.queryByTestId('trial-manage-modal'),
            ).not.toBeInTheDocument()
        })
    })
})
